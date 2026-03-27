export interface MarketSession {
    name: string
    alias: string
    status: "open" | "closed" | "opening_soon" | "closing_soon"
    opensAt: string
    closesAt: string
    opensIn?: string
    closesIn?: string
    currentLocal: string
    progressMs: number
    durationMs: number
}

export interface SessionSnapshot {
    currentTime: Date
    currentLocal: string
    userTimezone: string
    sessions: MarketSession[]
    activeSessions: string[]
    currentOverlap: string | null
    nextEvent: string
    marketPhase: "high_liquidity" | "moderate" | "low_liquidity" | "weekend"
    displaySession: string
}

export function isDST(date: Date, region: 'us' | 'eu'): boolean {
    const year = date.getUTCFullYear()
    if (region === 'us') {
        // US DST: 2nd Sunday in March to 1st Sunday in November
        const mar = new Date(Date.UTC(year, 2, 1))
        const nov = new Date(Date.UTC(year, 10, 1))

        let usStart = new Date(Date.UTC(year, 2, 8 + (7 - mar.getUTCDay()) % 7, 7)) // 2nd Sunday, 2am EST (7am UTC)
        let usEnd = new Date(Date.UTC(year, 10, 1 + (7 - nov.getUTCDay()) % 7, 6)) // 1st Sunday, 2am EDT (6am UTC)

        return date >= usStart && date < usEnd
    } else {
        // EU DST: Last Sunday in March to Last Sunday in October
        const mar = new Date(Date.UTC(year, 2, 31))
        const oct = new Date(Date.UTC(year, 9, 31))

        let euStart = new Date(Date.UTC(year, 2, 31 - mar.getUTCDay(), 1)) // Last Sunday, 1am UTC
        let euEnd = new Date(Date.UTC(year, 9, 31 - oct.getUTCDay(), 1)) // Last Sunday, 1am UTC

        return date >= euStart && date < euEnd
    }
}

function parseTime(timeStr: string): { h: number, m: number } {
    const [h, m] = timeStr.split(':').map(Number)
    return { h, m }
}

function formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000)
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
}

export function getMarketSessions(now: Date = new Date()): SessionSnapshot {
    const isWeekend = now.getUTCDay() === 0 || now.getUTCDay() === 6
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // London 07:00-16:00 UTC (winter), shifts 1 hour earlier in UTC during summer (06:00-15:00 UTC)?
    // Wait, London is always local 08:00 - 17:00? The prompt specifies:
    // London: 07:00 - 16:00 UTC (adjust for DST). If DST, London is UTC+1. So 07:00 UTC is 08:00 BST.
    // If requirement means: 07:00 UTC winter, 06:00 UTC summer. Let's adjust UTC start hour to maintain local time.
    const euDst = isDST(now, 'eu')
    const londonOpenH = euDst ? 6 : 7
    const londonCloseH = euDst ? 15 : 16

    const usDst = isDST(now, 'us')
    const nyOpenH = usDst ? 12 : 13 // NY usually 08:00 EST. 8+5=13 UTC. In EDT, 8+4=12 UTC. Prompt originally said 12:00-21:00 UTC inside text, let's use 12 for summer and 13 for winter. Wait, prompt says: "New York (US): 12:00 - 21:00 UTC (adjust for DST)". Often 12:00 EDT = 8:00 EST. Let's use 12 if DST else 13.
    const nyCloseH = usDst ? 21 : 22

    // Tokyo: 00:00 - 09:00 UTC
    const tokyoOpenH = 0
    const tokyoCloseH = 9

    const rawSessions = [
        { name: 'Tokyo', alias: 'Asian', open: tokyoOpenH, close: tokyoCloseH },
        { name: 'London', alias: 'European', open: londonOpenH, close: londonCloseH },
        { name: 'New York', alias: 'US', open: nyOpenH, close: nyCloseH }
    ]

    const formatter = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: userTimezone
    })

    const sessions: MarketSession[] = rawSessions.map(s => {
        let openTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), s.open))
        let closeTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), s.close))

        let timeOffset = 0
        if (now < openTime && s.name === 'Tokyo' && now.getUTCHours() > 12) {
            // Tokyo opens tomorrow in UTC
            openTime.setUTCDate(openTime.getUTCDate() + 1)
            closeTime.setUTCDate(closeTime.getUTCDate() + 1)
        } else if (now > closeTime && s.name === 'New York' && now.getUTCHours() >= s.close) {
            // NY closed today
        } else if (now > closeTime && s.name === 'Tokyo' && now.getUTCHours() >= s.close) {
            openTime.setUTCDate(openTime.getUTCDate() + 1)
            closeTime.setUTCDate(closeTime.getUTCDate() + 1)
        } else if (now > closeTime && s.name === 'London' && now.getUTCHours() >= s.close) {
            openTime.setUTCDate(openTime.getUTCDate() + 1)
            closeTime.setUTCDate(closeTime.getUTCDate() + 1)
        }

        let status: "open" | "closed" | "opening_soon" | "closing_soon" = "closed"
        let opensIn: string | undefined
        let closesIn: string | undefined
        let progressMs = 0
        const durationMs = (s.close - s.open) * 60 * 60 * 1000

        if (isWeekend) {
            status = "closed"
            opensIn = "Weekend"
        } else {
            if (now >= openTime && now < closeTime) {
                const diffClose = closeTime.getTime() - now.getTime()
                progressMs = now.getTime() - openTime.getTime()
                if (diffClose <= 30 * 60000) status = "closing_soon"
                else status = "open"
                closesIn = formatDuration(diffClose)
            } else {
                const diffOpen = openTime.getTime() - now.getTime()
                if (diffOpen <= 30 * 60000 && diffOpen > 0) status = "opening_soon"
                if (diffOpen > 0) opensIn = formatDuration(diffOpen)
            }
        }

        return {
            name: s.name,
            alias: s.alias,
            status,
            opensAt: `${s.open.toString().padStart(2, '0')}:00 UTC`,
            closesAt: `${s.close.toString().padStart(2, '0')}:00 UTC`,
            opensIn,
            closesIn,
            currentLocal: formatter.format(now),
            progressMs,
            durationMs
        }
    })

    const activeSessions = sessions.filter(s => s.status === 'open' || s.status === 'closing_soon').map(s => s.name)

    let currentOverlap: string | null = null
    if (activeSessions.includes('London') && activeSessions.includes('New York')) currentOverlap = 'London-New York'
    else if (activeSessions.includes('Tokyo') && activeSessions.includes('London')) currentOverlap = 'Tokyo-London'

    let marketPhase: "high_liquidity" | "moderate" | "low_liquidity" | "weekend" = "low_liquidity"
    if (isWeekend) marketPhase = "weekend"
    else if (currentOverlap) marketPhase = "high_liquidity"
    else if (activeSessions.includes('London') || activeSessions.includes('New York')) marketPhase = "moderate"

    let nextEvent = ""
    if (isWeekend) {
        nextEvent = "Market opens Sunday 22:00 UTC / Mon 00:00 UTC Tokyo"
    } else {
        const events: { time: number, msg: string }[] = []
        sessions.forEach(s => {
            if ((s.status === 'open' || s.status === 'closing_soon') && s.closesIn) {
                const min = parseInt(s.closesIn.split('m')[0].split('h').pop() || '0')
                const hr = s.closesIn.includes('h') ? parseInt(s.closesIn.split('h')[0]) : 0
                events.push({ time: hr * 60 + min, msg: `${s.name} closes in ${s.closesIn}` })
            } else if ((s.status === 'closed' || s.status === 'opening_soon') && s.opensIn && s.opensIn !== 'Weekend') {
                const min = parseInt(s.opensIn.split('m')[0].split('h').pop() || '0')
                const hr = s.opensIn.includes('h') ? parseInt(s.opensIn.split('h')[0]) : 0
                events.push({ time: hr * 60 + min, msg: `${s.name} opens in ${s.opensIn}` })
            }
        })
        events.sort((a, b) => a.time - b.time)
        nextEvent = events[0]?.msg || ""
    }

    // Determine display session
    let displaySession = 'Closed/Other'
    if (currentOverlap) {
        displaySession = `${currentOverlap} overlap`
    } else if (activeSessions.includes('New York') && !activeSessions.includes('London')) {
        displaySession = 'Late New York'
    } else if (activeSessions.length > 0) {
        displaySession = activeSessions[0]
    }

    return {
        currentTime: now,
        currentLocal: formatter.format(now),
        userTimezone,
        sessions,
        activeSessions,
        currentOverlap,
        nextEvent,
        marketPhase,
        displaySession
    }
}

export function isTimeInSession(date: Date, sessionName: string): boolean {
    const hours = date.getUTCHours()
    const euDst = isDST(date, 'eu')
    const usDst = isDST(date, 'us')

    if (sessionName === 'Tokyo') return hours >= 0 && hours < 9
    if (sessionName === 'London') {
        const open = euDst ? 6 : 7
        const close = euDst ? 15 : 16
        return hours >= open && hours < close
    }
    if (sessionName === 'New York') {
        const open = usDst ? 12 : 13
        const close = usDst ? 21 : 22
        return hours >= open && hours < close
    }
    return true // Default
}
