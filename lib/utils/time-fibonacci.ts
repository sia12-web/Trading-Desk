/**
 * Time-based Fibonacci projections.
 * Uses swing durations x Fibonacci ratios to project WHEN structural points end.
 * Replaces traditional Gann time analysis with Fibonacci-based time cycles.
 */

export interface StructuralPoint {
    label: string           // e.g. "Major Low", "Swing High"
    date: Date
    price?: number          // price at that point (optional)
}

export interface TimeProjection {
    label: string           // e.g. "Wave 3 end projection (1.618x)"
    projectedDate: Date
    fibRatio: number        // e.g. 1.618
    fibLabel: string        // e.g. "161.8%"
    basisWave: string       // which swing duration was used as basis
    basisDays: number       // duration of the basis swing in days
    projectedDays: number   // projected days from reference point
    confidence: 'high' | 'moderate' | 'low'
    isPast: boolean         // whether this date has already passed
}

export interface TimeFibCluster {
    startDate: Date
    endDate: Date
    projections: TimeProjection[]
    clusterStrength: number     // 0-100, how many projections converge
    description: string
}

// Standard Fibonacci time ratios
const FIB_TIME_RATIOS = [
    { ratio: 0.382, label: '38.2%' },
    { ratio: 0.500, label: '50.0%' },
    { ratio: 0.618, label: '61.8%' },
    { ratio: 1.000, label: '100%' },
    { ratio: 1.272, label: '127.2%' },
    { ratio: 1.618, label: '161.8%' },
    { ratio: 2.000, label: '200%' },
    { ratio: 2.618, label: '261.8%' },
]

/**
 * Calculate days between two dates.
 */
function daysBetween(start: Date, end: Date): number {
    const ms = end.getTime() - start.getTime()
    return Math.abs(ms / (1000 * 60 * 60 * 24))
}

/**
 * Add days to a date.
 */
function addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + Math.round(days))
    return result
}

/**
 * Project future time targets from a swing duration.
 * Given the start and end of a completed swing, projects where the NEXT structural point
 * might occur based on Fibonacci time ratios applied to the completed swing's duration.
 *
 * Example: Swing lasted 30 days. Project next structural end:
 *   - 38.2% = 30 * 0.382 = 11.5 days from end
 *   - 61.8% = 30 * 0.618 = 18.5 days from end
 *   - 100%  = 30 * 1.000 = 30 days from end
 */
export function projectTimeTargets(
    basisWaveStart: Date,
    basisWaveEnd: Date,
    projectionFrom: Date,
    basisLabel: string,
    ratios?: { ratio: number; label: string }[]
): TimeProjection[] {
    const basisDays = daysBetween(basisWaveStart, basisWaveEnd)
    if (basisDays < 1) return []

    const now = new Date()
    const activeRatios = ratios || FIB_TIME_RATIOS

    return activeRatios.map(({ ratio, label }) => {
        const projectedDays = basisDays * ratio
        const projectedDate = addDays(projectionFrom, projectedDays)

        let confidence: 'high' | 'moderate' | 'low' = 'moderate'
        if (ratio === 0.618 || ratio === 1.618) confidence = 'high'
        if (ratio === 2.618) confidence = 'low'

        return {
            label: `${basisLabel} x ${label}`,
            projectedDate,
            fibRatio: ratio,
            fibLabel: label,
            basisWave: basisLabel,
            basisDays: Math.round(basisDays),
            projectedDays: Math.round(projectedDays),
            confidence,
            isPast: projectedDate < now
        }
    })
}

/**
 * Find clusters where multiple time projections converge within a window.
 * Clustered Fibonacci time projections are high-probability reversal windows.
 */
export function findTimeClusters(
    projections: TimeProjection[],
    clusterWindowDays: number = 5
): TimeFibCluster[] {
    if (projections.length === 0) return []

    // Sort by projected date
    const sorted = [...projections].sort(
        (a, b) => a.projectedDate.getTime() - b.projectedDate.getTime()
    )

    const clusters: TimeFibCluster[] = []
    let currentCluster: TimeProjection[] = [sorted[0]]

    for (let i = 1; i < sorted.length; i++) {
        const daysDiff = daysBetween(
            currentCluster[currentCluster.length - 1].projectedDate,
            sorted[i].projectedDate
        )

        if (daysDiff <= clusterWindowDays) {
            currentCluster.push(sorted[i])
        } else {
            if (currentCluster.length >= 2) {
                clusters.push(buildCluster(currentCluster))
            }
            currentCluster = [sorted[i]]
        }
    }

    // Don't forget the last cluster
    if (currentCluster.length >= 2) {
        clusters.push(buildCluster(currentCluster))
    }

    return clusters.sort((a, b) => b.clusterStrength - a.clusterStrength)
}

function buildCluster(projections: TimeProjection[]): TimeFibCluster {
    const dates = projections.map(p => p.projectedDate.getTime())
    const startDate = new Date(Math.min(...dates))
    const endDate = new Date(Math.max(...dates))

    const highConfCount = projections.filter(p => p.confidence === 'high').length
    const strength = Math.min(100, (projections.length * 25) + (highConfCount * 15))

    const basisWaves = [...new Set(projections.map(p => p.basisWave))]
    const description = projections.length >= 3
        ? `Strong time cluster: ${projections.length} projections from ${basisWaves.join(', ')} converge`
        : `Time cluster: ${projections.length} projections from ${basisWaves.join(', ')} converge`

    return {
        startDate,
        endDate,
        projections,
        clusterStrength: strength,
        description
    }
}

/**
 * Build a complete time Fibonacci analysis from Structural Point timestamps.
 * Takes swing start/end timestamps and builds all forward projections.
 */
export function buildTimeFibAnalysis(points: StructuralPoint[]): {
    projections: TimeProjection[]
    clusters: TimeFibCluster[]
} {
    if (points.length < 2) return { projections: [], clusters: [] }

    const allProjections: TimeProjection[] = []

    // Project from each completed point pair
    for (let i = 0; i < points.length - 1; i++) {
        const swingStart = points[i]
        const swingEnd = points[i + 1]

        // Project forward from the end of this swing
        const projectionFrom = swingEnd.date
        const basisLabel = `${swingStart.label} → ${swingEnd.label}`

        const projections = projectTimeTargets(
            swingStart.date,
            swingEnd.date,
            projectionFrom,
            basisLabel
        )

        allProjections.push(...projections)
    }

    // Also project from the FIRST point to the LAST point (full cycle)
    if (points.length >= 3) {
        const fullCycleProjections = projectTimeTargets(
            points[0].date,
            points[points.length - 1].date,
            points[points.length - 1].date,
            `Full cycle (${points[0].label} → ${points[points.length - 1].label})`
        )
        allProjections.push(...fullCycleProjections)
    }

    const clusters = findTimeClusters(allProjections)

    return { projections: allProjections, clusters }
}

/**
 * Format a time projection for display.
 */
export function formatProjection(p: TimeProjection): string {
    const dateStr = p.projectedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
    const daysText = p.isPast ? `${p.projectedDays}d ago` : `in ${p.projectedDays}d`
    return `${p.label}: ${dateStr} (${daysText}) [${p.confidence}]`
}

/**
 * Get upcoming (future) projections only, sorted by date.
 */
export function getUpcomingProjections(projections: TimeProjection[]): TimeProjection[] {
    const now = new Date()
    return projections
        .filter(p => p.projectedDate > now)
        .sort((a, b) => a.projectedDate.getTime() - b.projectedDate.getTime())
}
