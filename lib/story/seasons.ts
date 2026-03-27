import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Safety cap: if the AI never ends a season, force a finale after this many episodes.
 * The AI normally decides when to end a season based on narrative arc completion.
 */
const MAX_EPISODES_PER_SEASON = 50

/**
 * Compute season number from the last episode's season_number.
 * If the last episode was a season finale, the next episode starts a new season.
 */
export function getSeasonNumber(lastSeasonNumber: number, lastWasFinale: boolean): number {
    if (lastWasFinale) return lastSeasonNumber + 1
    return lastSeasonNumber
}

/**
 * Check if the AI should be nudged to end the season (safety cap reached).
 * Returns true if episodesInCurrentSeason >= MAX_EPISODES_PER_SEASON.
 */
export function shouldForceSeasonFinale(episodesInCurrentSeason: number): boolean {
    return episodesInCurrentSeason >= MAX_EPISODES_PER_SEASON
}

/**
 * After a season finale episode, create/update the season summary and archive old episodes.
 * The AI sets is_season_finale — we trust it, with the safety cap as a backstop.
 */
export async function checkAndCloseSeason(
    userId: string,
    pair: string,
    episodeNumber: number,
    seasonNumber: number,
    arcSummary: string,
    isSeasonFinale: boolean,
    episodesInSeason: number,
    client: SupabaseClient
): Promise<void> {
    if (!isSeasonFinale) return

    const { error } = await client
        .from('story_seasons')
        .upsert(
            {
                user_id: userId,
                pair,
                season_number: seasonNumber,
                summary: arcSummary,
                episode_count: episodesInSeason,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,pair,season_number' }
        )

    if (error) {
        console.error(`[Seasons] Failed to close season ${seasonNumber} for ${pair}:`, error.message)
    } else {
        console.log(`[Seasons] Season ${seasonNumber} closed for ${pair} (${episodesInSeason} episodes, last ep #${episodeNumber})`)
    }

    // Archive episodes from seasons older than the previous one (keep current + previous unarchived)
    if (seasonNumber >= 2) {
        const { error: archiveError } = await client
            .from('story_episodes')
            .update({ archived: true })
            .eq('user_id', userId)
            .eq('pair', pair)
            .lt('season_number', seasonNumber - 1)
            .eq('archived', false)

        if (archiveError) {
            console.error(`[Seasons] Failed to archive episodes for ${pair}:`, archiveError.message)
        }
    }
}

/**
 * Fetch all completed season summaries for deep cross-season memory.
 * Fed to the narrator so the AI knows what happened in every past season.
 */
export async function getSeasonArchive(
    userId: string,
    pair: string,
    client: SupabaseClient
): Promise<Array<{
    season_number: number
    summary: string | null
    episode_count: number
    key_events: unknown[]
    performance_notes: string | null
}>> {
    const { data, error } = await client
        .from('story_seasons')
        .select('season_number, summary, episode_count, key_events, performance_notes')
        .eq('user_id', userId)
        .eq('pair', pair)
        .order('season_number', { ascending: true })

    if (error) {
        console.error(`[Seasons] Failed to fetch season archive for ${pair}:`, error.message)
        return []
    }
    return data || []
}
