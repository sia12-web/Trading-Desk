'use server'

import { createClient } from '@/lib/supabase/server'
import { getActiveAccountId } from '@/lib/oanda/account'
import { cache } from 'react'

export interface TraderProfile {
    id: string
    user_id: string
    trading_style: 'scalper' | 'day_trader' | 'swing_trader' | 'position_trader' | null
    risk_personality: 'aggressive' | 'moderate' | 'conservative' | null
    experience_months: number | null
    primary_pairs: string[] | null
    trading_goals: string | null
    observed_strengths: string[]
    observed_weaknesses: string[]
    emotional_triggers: string[]
    current_focus: string | null
    personality_notes: string | null

    updated_at: string
    created_at: string
}

export const getProfile = cache(async (userId: string): Promise<TraderProfile | null> => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('trader_profile')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error('Error fetching trader profile:', error)
        return null
    }

    return data
})

export async function createProfile(userId: string, data: Partial<TraderProfile>): Promise<TraderProfile | null> {
    const supabase = await createClient()
    const accountId = await getActiveAccountId()

    const { data: profile, error } = await supabase
        .from('trader_profile')
        .insert({ user_id: userId, oanda_account_id: accountId, ...data })
        .select()
        .single()

    if (error) {
        console.error('Error creating trader profile:', error)
        return null
    }

    return profile
}

export async function updateProfile(userId: string, data: Partial<TraderProfile>): Promise<TraderProfile | null> {
    const existing = await getProfile(userId)
    if (!existing) return null

    const supabase = await createClient()
    const { data: profile, error } = await supabase
        .from('trader_profile')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()

    if (error) {
        console.error('Error updating trader profile:', error)
        return null
    }

    return profile
}


