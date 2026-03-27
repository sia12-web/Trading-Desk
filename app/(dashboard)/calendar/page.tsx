'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
    Calendar as CalendarIcon, Plus, Clock, CheckCircle2, Trash2,
    ChevronLeft, ChevronRight, TrendingUp, BookOpen, FileText,
    Search, Coffee, Bell, Download, Globe, X, AlertTriangle, RotateCcw
} from 'lucide-react'
import {
    format, startOfWeek, endOfWeek, addDays, addMonths, subMonths,
    isSameDay, isSameMonth, startOfDay, endOfDay, startOfMonth,
    endOfMonth, getHours, getMinutes, differenceInMinutes, isToday
} from 'date-fns'

// ─── Types ──────────────────────────────────────────────────────────────────

interface CalendarEvent {
    id: string
    title: string
    description: string | null
    event_type: string
    start_time: string
    end_time: string | null
    all_day: boolean
    is_recurring: boolean
    recurrence_rule: any | null
    market_session: string | null
    currency_pairs: string[] | null
    status: string
    priority: string
    tags: string[] | null
    notify_before_minutes: number
    related_task_id: string | null
}

// ─── Constants ──────────────────────────────────────────────────────────────

const EVENT_TYPES = ['trading', 'study', 'homework', 'research', 'review', 'market_event', 'break', 'other'] as const

const EVENT_ICONS: Record<string, any> = {
    trading: TrendingUp, study: BookOpen, homework: FileText, research: Search,
    review: FileText, market_event: Bell, break: Coffee, other: CalendarIcon
}

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string; dot: string; bar: string }> = {
    trading:      { bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    text: 'text-blue-400',    dot: 'bg-blue-400',    bar: 'bg-blue-500' },
    study:        { bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  text: 'text-purple-400',  dot: 'bg-purple-400',  bar: 'bg-purple-500' },
    homework:     { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400',   dot: 'bg-amber-400',   bar: 'bg-amber-500' },
    research:     { bg: 'bg-green-500/10',   border: 'border-green-500/20',   text: 'text-green-400',   dot: 'bg-green-400',   bar: 'bg-green-500' },
    review:       { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    text: 'text-cyan-400',    dot: 'bg-cyan-400',    bar: 'bg-cyan-500' },
    market_event: { bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    text: 'text-rose-400',    dot: 'bg-rose-400',    bar: 'bg-rose-500' },
    break:        { bg: 'bg-neutral-500/10', border: 'border-neutral-500/20', text: 'text-neutral-400', dot: 'bg-neutral-500', bar: 'bg-neutral-500' },
    other:        { bg: 'bg-neutral-500/10', border: 'border-neutral-500/20', text: 'text-neutral-400', dot: 'bg-neutral-500', bar: 'bg-neutral-500' },
}

const TYPE_LABELS: Record<string, string> = {
    trading: 'Trading', study: 'Study', homework: 'Homework', research: 'Research',
    review: 'Review', market_event: 'Market', break: 'Break', other: 'Other'
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

// ─── Mini Month Calendar ────────────────────────────────────────────────────

function MiniMonth({
    currentMonth,
    selectedDate,
    eventDates,
    onSelectDate,
    onChangeMonth,
}: {
    currentMonth: Date
    selectedDate: Date
    eventDates: Set<string>
    onSelectDate: (d: Date) => void
    onChangeMonth: (d: Date) => void
}) {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days: Date[] = []
    let d = gridStart
    while (d <= gridEnd) { days.push(d); d = addDays(d, 1) }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <button onClick={() => onChangeMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-neutral-800 rounded-lg transition-colors">
                    <ChevronLeft size={14} className="text-neutral-500" />
                </button>
                <span className="text-xs font-bold text-neutral-300">{format(currentMonth, 'MMMM yyyy')}</span>
                <button onClick={() => onChangeMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-neutral-800 rounded-lg transition-colors">
                    <ChevronRight size={14} className="text-neutral-500" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-0">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <div key={i} className="text-center text-[10px] font-bold text-neutral-600 py-1">{d}</div>
                ))}
                {days.map(day => {
                    const inMonth = isSameMonth(day, currentMonth)
                    const today = isToday(day)
                    const selected = isSameDay(day, selectedDate)
                    const hasEvents = eventDates.has(format(day, 'yyyy-MM-dd'))

                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => onSelectDate(day)}
                            className={`relative w-8 h-8 flex items-center justify-center text-[11px] font-medium rounded-lg transition-all ${
                                selected ? 'bg-blue-600 text-white font-bold' :
                                today ? 'bg-blue-500/15 text-blue-400 font-bold' :
                                inMonth ? 'text-neutral-300 hover:bg-neutral-800' : 'text-neutral-700'
                            }`}
                        >
                            {format(day, 'd')}
                            {hasEvents && !selected && (
                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

// ─── Event Card ─────────────────────────────────────────────────────────────

function EventCard({
    event, compact, onComplete, onDelete
}: {
    event: CalendarEvent
    compact?: boolean
    onComplete: (id: string) => void
    onDelete: (id: string) => void
}) {
    const colors = TYPE_COLORS[event.event_type] || TYPE_COLORS.other
    const Icon = EVENT_ICONS[event.event_type] || CalendarIcon
    const isVirtual = event.id.includes('__')
    const isCompleted = event.status === 'completed'

    if (compact) {
        return (
            <div className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg border ${colors.bg} ${colors.border} ${isCompleted ? 'opacity-40' : ''} transition-all hover:brightness-125`}>
                <div className={`w-1 h-4 rounded-full shrink-0 ${colors.bar}`} />
                <span className={`text-[11px] font-medium truncate flex-1 ${colors.text} ${isCompleted ? 'line-through' : ''}`}>
                    {!event.all_day && <span className="text-neutral-500 mr-1">{format(new Date(event.start_time), 'HH:mm')}</span>}
                    {event.title}
                </span>
                {event.priority === 'high' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
            </div>
        )
    }

    return (
        <div className={`group relative flex gap-3 p-3 rounded-xl border ${colors.bg} ${colors.border} ${isCompleted ? 'opacity-40' : ''} transition-all hover:brightness-110`}>
            <div className={`w-1 self-stretch rounded-full shrink-0 ${colors.bar}`} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <Icon size={14} className={`shrink-0 ${colors.text}`} />
                    <h4 className={`text-sm font-bold truncate ${isCompleted ? 'line-through text-neutral-500' : 'text-neutral-100'}`}>{event.title}</h4>
                    {event.priority === 'high' && (
                        <span className="text-[8px] font-black uppercase bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded shrink-0">HIGH</span>
                    )}
                    {event.is_recurring && (
                        <span className="text-[8px] font-black uppercase bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded shrink-0">REC</span>
                    )}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                    {event.all_day ? 'All Day' : (
                        <>
                            {format(new Date(event.start_time), 'HH:mm')}
                            {event.end_time && ` – ${format(new Date(event.end_time), 'HH:mm')}`}
                        </>
                    )}
                    {event.market_session && <span className="ml-2 text-neutral-600">• {event.market_session}</span>}
                </p>
                {event.description && <p className="text-xs text-neutral-600 mt-1 line-clamp-1">{event.description}</p>}
                {event.currency_pairs && event.currency_pairs.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                        {event.currency_pairs.map(pair => (
                            <span key={pair} className="text-[9px] font-mono bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">{pair}</span>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {event.status === 'pending' && !isVirtual && (
                    <button onClick={() => onComplete(event.id)} className="p-1.5 hover:bg-green-500/20 rounded-lg transition-colors" title="Complete">
                        <CheckCircle2 size={14} className="text-green-400" />
                    </button>
                )}
                <button onClick={() => onDelete(event.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={14} className="text-red-400" />
                </button>
            </div>
        </div>
    )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function CalendarPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [view, setView] = useState<'day' | 'week' | 'month'>('day')
    const [miniMonth, setMiniMonth] = useState(new Date())
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [showClearDialog, setShowClearDialog] = useState(false)
    const [seeding, setSeeding] = useState(false)
    const [importing, setImporting] = useState(false)
    const [clearing, setClearing] = useState(false)
    const [clearConfirmText, setClearConfirmText] = useState('')

    // Form state
    const [formTitle, setFormTitle] = useState('')
    const [formDescription, setFormDescription] = useState('')
    const [formEventType, setFormEventType] = useState<string>('trading')
    const [formDate, setFormDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [formStartTime, setFormStartTime] = useState('09:00')
    const [formEndTime, setFormEndTime] = useState('10:00')
    const [formAllDay, setFormAllDay] = useState(false)
    const [formMarketSession, setFormMarketSession] = useState('')
    const [formPairs, setFormPairs] = useState('')
    const [formPriority, setFormPriority] = useState<string>('normal')
    const [formNotifyBefore, setFormNotifyBefore] = useState(15)
    const [formRecurring, setFormRecurring] = useState(false)
    const [formFrequency, setFormFrequency] = useState<string>('daily')
    const [formSubmitting, setFormSubmitting] = useState(false)

    useEffect(() => { loadEvents() }, [currentDate, view])

    const loadEvents = async () => {
        setLoading(true)
        try {
            let start: Date, end: Date
            if (view === 'day') {
                start = startOfDay(currentDate)
                end = endOfDay(currentDate)
            } else if (view === 'week') {
                start = startOfWeek(currentDate, { weekStartsOn: 1 })
                end = endOfWeek(currentDate, { weekStartsOn: 1 })
            } else {
                const ms = startOfMonth(currentDate)
                const me = endOfMonth(currentDate)
                start = startOfWeek(ms, { weekStartsOn: 1 })
                end = endOfWeek(me, { weekStartsOn: 1 })
            }
            const res = await fetch(`/api/calendar/events?start=${start.toISOString()}&end=${end.toISOString()}`)
            const data = await res.json()
            setEvents(data.events || [])
        } catch (err) {
            console.error('Failed to load events:', err)
        } finally {
            setLoading(false)
        }
    }

    const completeEvent = async (eventId: string) => {
        if (eventId.includes('__')) return
        try {
            await fetch(`/api/calendar/events/${eventId}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'complete' })
            })
            loadEvents()
        } catch (err) { console.error('Failed to complete event:', err) }
    }

    const deleteEvent = async (eventId: string) => {
        const isRecurring = eventId.includes('__')
        if (!confirm(isRecurring ? 'Delete this recurring event and all occurrences?' : 'Delete this event?')) return
        const realId = isRecurring ? eventId.split('__')[0] : eventId
        try {
            await fetch(`/api/calendar/events/${realId}`, { method: 'DELETE' })
            loadEvents()
        } catch (err) { console.error('Failed to delete event:', err) }
    }

    const handleClearAll = async () => {
        if (clearConfirmText !== 'CLEAR') return
        setClearing(true)
        try {
            await fetch('/api/calendar/events', { method: 'DELETE' })
            setShowClearDialog(false)
            setClearConfirmText('')
            loadEvents()
        } catch (err) { console.error('Failed to clear:', err) }
        finally { setClearing(false) }
    }

    const handleCreateEvent = async () => {
        if (!formTitle.trim()) return
        setFormSubmitting(true)
        try {
            // Convert Montreal local time to UTC for storage
            let startDT: string, endDT: string
            if (formAllDay) {
                startDT = `${formDate}T00:00:00.000Z`
                endDT = `${formDate}T23:59:59.000Z`
            } else {
                // Create date in Montreal timezone and convert to UTC
                const startLocal = new Date(`${formDate}T${formStartTime}:00`)
                const endLocal = new Date(`${formDate}T${formEndTime}:00`)
                startDT = startLocal.toISOString()
                endDT = endLocal.toISOString()
            }
            const pairs = formPairs.trim() ? formPairs.split(',').map(p => p.trim()).filter(Boolean) : null

            const res = await fetch('/api/calendar/events', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formTitle, description: formDescription || null, event_type: formEventType,
                    start_time: startDT, end_time: endDT, all_day: formAllDay,
                    market_session: formMarketSession || null, currency_pairs: pairs,
                    priority: formPriority, notify_before_minutes: formNotifyBefore,
                    is_recurring: formRecurring, recurrence_rule: formRecurring ? { frequency: formFrequency } : null
                })
            })
            if (res.ok) { resetForm(); setShowAddDialog(false); loadEvents() }
        } catch (err) { console.error('Failed to create event:', err) }
        finally { setFormSubmitting(false) }
    }

    const resetForm = () => {
        setFormTitle(''); setFormDescription(''); setFormEventType('trading')
        setFormDate(format(new Date(), 'yyyy-MM-dd')); setFormStartTime('09:00'); setFormEndTime('10:00')
        setFormAllDay(false); setFormMarketSession(''); setFormPairs('')
        setFormPriority('normal'); setFormNotifyBefore(15); setFormRecurring(false); setFormFrequency('daily')
    }

    const seedMarketSessions = async () => {
        setSeeding(true)
        try {
            const res = await fetch('/api/calendar/seed-market-events', { method: 'POST' })
            const data = await res.json()
            if (res.ok) loadEvents()
        } catch (err) { console.error('Failed to seed:', err) }
        finally { setSeeding(false) }
    }



    // ─── Helpers ────────────────────────────────────────────────────────────

    const getWeekDays = () => {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 })
        return Array.from({ length: 7 }, (_, i) => addDays(start, i))
    }

    const getMonthGrid = () => {
        const ms = startOfMonth(currentDate)
        const me = endOfMonth(currentDate)
        const gs = startOfWeek(ms, { weekStartsOn: 1 })
        const ge = endOfWeek(me, { weekStartsOn: 1 })
        const days: Date[] = []
        let d = gs
        while (d <= ge) { days.push(d); d = addDays(d, 1) }
        return days
    }

    const getEventsForDay = (day: Date) => events.filter(e => isSameDay(new Date(e.start_time), day))

    const navigateDate = (dir: 1 | -1) => {
        if (view === 'day') setCurrentDate(addDays(currentDate, dir))
        else if (view === 'week') setCurrentDate(addDays(currentDate, dir * 7))
        else setCurrentDate(dir === 1 ? addMonths(currentDate, 1) : subMonths(currentDate, 1))
    }

    const getDateLabel = () => {
        if (view === 'day') return format(currentDate, 'EEEE, MMMM d, yyyy')
        if (view === 'week') return `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d')} – ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`
        return format(currentDate, 'MMMM yyyy')
    }

    const eventDates = useMemo(() => {
        const set = new Set<string>()
        events.forEach(e => set.add(format(new Date(e.start_time), 'yyyy-MM-dd')))
        return set
    }, [events])

    const todaysEvents = useMemo(() => events.filter(e => isSameDay(new Date(e.start_time), new Date())), [events])

    const selectDate = (d: Date) => {
        setCurrentDate(d)
        if (view === 'month') setView('day')
    }

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="max-w-[1400px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Calendar</h1>
                    <p className="text-neutral-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d yyyy')}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">

                    <button onClick={seedMarketSessions} disabled={seeding}
                        className="flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200 font-medium rounded-xl transition-all text-xs disabled:opacity-50">
                        <Globe size={14} /> {seeding ? 'Seeding...' : 'Sessions'}
                    </button>
                    <button onClick={() => { setShowClearDialog(true); setClearConfirmText('') }}
                        className="flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-red-500/20 hover:border-red-500/50 text-red-400 font-medium rounded-xl transition-all text-xs">
                        <RotateCcw size={14} /> Clear All
                    </button>
                    <button onClick={() => { resetForm(); setShowAddDialog(true) }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all text-xs">
                        <Plus size={16} /> Add Event
                    </button>
                </div>
            </div>

            {/* Main Layout: Sidebar + Calendar */}
            <div className="flex gap-6">
                {/* Sidebar */}
                <aside className="hidden lg:flex flex-col gap-5 w-[260px] shrink-0">
                    {/* Mini Month */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                        <MiniMonth
                            currentMonth={miniMonth}
                            selectedDate={currentDate}
                            eventDates={eventDates}
                            onSelectDate={selectDate}
                            onChangeMonth={setMiniMonth}
                        />
                    </div>

                    {/* Today's Agenda */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Today&apos;s Agenda</h3>
                        {todaysEvents.length === 0 ? (
                            <p className="text-xs text-neutral-600 text-center py-3">Nothing scheduled</p>
                        ) : (
                            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                                {todaysEvents.slice(0, 8).map(event => {
                                    const c = TYPE_COLORS[event.event_type] || TYPE_COLORS.other
                                    return (
                                        <div key={event.id} className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                                            <span className="text-[11px] text-neutral-400 font-mono shrink-0">
                                                {event.all_day ? 'ALL' : format(new Date(event.start_time), 'HH:mm')}
                                            </span>
                                            <span className={`text-[11px] truncate ${event.status === 'completed' ? 'text-neutral-600 line-through' : 'text-neutral-300'}`}>
                                                {event.title}
                                            </span>
                                        </div>
                                    )
                                })}
                                {todaysEvents.length > 8 && (
                                    <p className="text-[10px] text-neutral-600 text-center">+{todaysEvents.length - 8} more</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Legend */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Event Types</h3>
                        <div className="space-y-2">
                            {EVENT_TYPES.map(t => (
                                <div key={t} className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${TYPE_COLORS[t].dot}`} />
                                    <span className="text-xs text-neutral-400 capitalize">{TYPE_LABELS[t]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Calendar */}
                <div className="flex-1 min-w-0 space-y-4">
                    {/* Controls */}
                    <div className="flex items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                            <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
                                <ChevronLeft size={18} className="text-neutral-400" />
                            </button>
                            <div className="px-3 py-1.5 min-w-[220px] text-center">
                                <span className="text-sm font-bold text-white">{getDateLabel()}</span>
                            </div>
                            <button onClick={() => navigateDate(1)} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
                                <ChevronRight size={18} className="text-neutral-400" />
                            </button>
                            <button onClick={() => setCurrentDate(new Date())}
                                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs font-bold text-neutral-300 transition-colors ml-1">
                                Today
                            </button>
                        </div>
                        <div className="hidden bg-neutral-800 rounded-xl p-1">
                            {(['day', 'week', 'month'] as const).map(v => (
                                <button key={v} onClick={() => setView(v)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                                        view === v ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'
                                    }`}>
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Calendar Content */}
                    {loading ? (
                        <div className="flex items-center justify-center py-32">
                            <div className="w-8 h-8 border-2 border-neutral-800 border-t-blue-500 rounded-full animate-spin" />
                        </div>
                    ) : view === 'month' ? (
                        /* ── Month View ─────────────────────────────── */
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                            <div className="grid grid-cols-7">
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                    <div key={d} className="text-center text-[10px] font-bold text-neutral-600 uppercase tracking-widest py-3 border-b border-neutral-800">
                                        {d.slice(0, 3)}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7">
                                {getMonthGrid().map((day, idx) => {
                                    const dayEvents = getEventsForDay(day)
                                    const inMonth = isSameMonth(day, currentDate)
                                    const today = isToday(day)
                                    const selected = isSameDay(day, currentDate)

                                    return (
                                        <div
                                            key={day.toISOString()}
                                            onClick={() => selectDate(day)}
                                            className={`min-h-[110px] p-2 border-b border-r border-neutral-800/50 cursor-pointer transition-all hover:bg-neutral-800/30 ${
                                                !inMonth ? 'bg-neutral-950/50' : ''
                                            } ${selected ? 'bg-blue-500/5' : ''}`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                                                    today ? 'bg-blue-600 text-white' :
                                                    inMonth ? 'text-neutral-300' : 'text-neutral-700'
                                                }`}>
                                                    {format(day, 'd')}
                                                </span>
                                                {dayEvents.length > 0 && (
                                                    <span className="text-[9px] font-bold text-neutral-600">{dayEvents.length}</span>
                                                )}
                                            </div>
                                            <div className="space-y-0.5">
                                                {dayEvents.slice(0, 3).map(event => {
                                                    const c = TYPE_COLORS[event.event_type] || TYPE_COLORS.other
                                                    return (
                                                        <div key={event.id} className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${c.bg} ${event.status === 'completed' ? 'opacity-40' : ''}`}>
                                                            <div className={`w-1 h-1 rounded-full shrink-0 ${c.dot}`} />
                                                            <span className={`text-[10px] truncate ${c.text}`}>{event.title}</span>
                                                        </div>
                                                    )
                                                })}
                                                {dayEvents.length > 3 && (
                                                    <span className="text-[9px] text-neutral-500 font-bold pl-1">+{dayEvents.length - 3} more</span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ) : view === 'week' ? (
                        /* ── Week View ──────────────────────────────── */
                        <div className="grid grid-cols-7 gap-3">
                            {getWeekDays().map(day => {
                                const dayEvents = getEventsForDay(day)
                                const today = isToday(day)
                                return (
                                    <div key={day.toISOString()} className={`bg-neutral-900 border rounded-2xl overflow-hidden transition-all ${today ? 'border-blue-500/30' : 'border-neutral-800'}`}>
                                        <div className={`px-3 py-2.5 border-b ${today ? 'border-blue-500/20 bg-blue-500/5' : 'border-neutral-800'}`}>
                                            <p className="text-[10px] font-bold text-neutral-500 uppercase">{format(day, 'EEE')}</p>
                                            <p className={`text-lg font-bold ${today ? 'text-blue-400' : 'text-neutral-200'}`}>{format(day, 'd')}</p>
                                        </div>
                                        <div className="p-2 space-y-1.5 min-h-[120px]">
                                            {dayEvents.length === 0 ? (
                                                <p className="text-[10px] text-neutral-700 text-center py-6">No events</p>
                                            ) : dayEvents.map(event => (
                                                <EventCard key={event.id} event={event} compact onComplete={completeEvent} onDelete={deleteEvent} />
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        /* ── Day View (Time Grid) ────────────────────── */
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                            {/* All Day Events */}
                            {(() => {
                                const allDay = getEventsForDay(currentDate).filter(e => e.all_day)
                                if (allDay.length === 0) return null
                                return (
                                    <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-900/80">
                                        <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-2">All Day</p>
                                        <div className="space-y-1.5">
                                            {allDay.map(e => <EventCard key={e.id} event={e} compact onComplete={completeEvent} onDelete={deleteEvent} />)}
                                        </div>
                                    </div>
                                )
                            })()}

                            {/* Time Grid */}
                            <div className="relative max-h-[600px] overflow-y-auto">
                                {/* Current time indicator (Montreal time) */}
                                {isToday(currentDate) && (() => {
                                    // Get current time in Montreal timezone (America/Montreal = UTC-5 winter, UTC-4 summer)
                                    const now = new Date()
                                    const montrealTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Montreal' }))
                                    const hours = montrealTime.getHours()
                                    const minutes = montrealTime.getMinutes()
                                    const top = (hours * 60 + minutes) / (24 * 60) * (24 * 64)
                                    return (
                                        <div className="absolute left-0 right-0 z-10 pointer-events-none" style={{ top: `${top}px` }}>
                                            <div className="flex items-center">
                                                <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                                                <div className="flex-1 h-px bg-red-500" />
                                            </div>
                                        </div>
                                    )
                                })()}

                                {HOURS.map(hour => {
                                    const hourEvents = getEventsForDay(currentDate).filter(e => {
                                        if (e.all_day) return false
                                        const h = getHours(new Date(e.start_time))
                                        return h === hour
                                    })

                                    return (
                                        <div key={hour} className="flex border-b border-neutral-800/50 min-h-[64px]">
                                            <div className="w-16 shrink-0 py-2 pr-3 text-right">
                                                <span className="text-[11px] font-mono text-neutral-600">
                                                    {hour.toString().padStart(2, '0')}:00
                                                </span>
                                            </div>
                                            <div className="flex-1 border-l border-neutral-800/50 py-1 px-2 space-y-1">
                                                {hourEvents.map(event => (
                                                    <EventCard key={event.id} event={event} onComplete={completeEvent} onDelete={deleteEvent} />
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Add Event Modal ────────────────────────────────────────── */}
            {showAddDialog && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddDialog(false)}>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white">New Event</h3>
                            <button onClick={() => setShowAddDialog(false)} className="p-2 hover:bg-neutral-800 rounded-lg"><X size={18} /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Title *</label>
                                    <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)}
                                        placeholder="e.g. Monitor EUR/USD at London open"
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Description</label>
                                    <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={2}
                                        placeholder="Additional details..."
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 resize-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Date</label>
                                    <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={formAllDay} onChange={e => setFormAllDay(e.target.checked)}
                                        className="w-4 h-4 rounded border-neutral-600 bg-neutral-800 text-blue-500 focus:ring-blue-500" />
                                    <span className="text-sm font-medium text-neutral-300">All day event</span>
                                </label>
                                {!formAllDay && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Start Time</label>
                                            <input type="time" value={formStartTime} onChange={e => setFormStartTime(e.target.value)}
                                                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">End Time</label>
                                            <input type="time" value={formEndTime} onChange={e => setFormEndTime(e.target.value)}
                                                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Type</label>
                                        <select value={formEventType} onChange={e => setFormEventType(e.target.value)}
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                                            {EVENT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Priority</label>
                                        <select value={formPriority} onChange={e => setFormPriority(e.target.value)}
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                                            <option value="low">Low</option>
                                            <option value="normal">Normal</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Market Session</label>
                                    <select value={formMarketSession} onChange={e => setFormMarketSession(e.target.value)}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                                        <option value="">None</option>
                                        <option value="Tokyo">Tokyo</option>
                                        <option value="London">London</option>
                                        <option value="New York">New York</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Currency Pairs</label>
                                    <input type="text" value={formPairs} onChange={e => setFormPairs(e.target.value)}
                                        placeholder="EUR/USD, GBP/USD"
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
                                    <p className="text-[10px] text-neutral-600 mt-1">Comma separated</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Notify Before</label>
                                    <select value={formNotifyBefore} onChange={e => setFormNotifyBefore(Number(e.target.value))}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                                        <option value={5}>5 minutes</option>
                                        <option value={10}>10 minutes</option>
                                        <option value={15}>15 minutes</option>
                                        <option value={30}>30 minutes</option>
                                        <option value={60}>1 hour</option>
                                    </select>
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={formRecurring} onChange={e => setFormRecurring(e.target.checked)}
                                        className="w-4 h-4 rounded border-neutral-600 bg-neutral-800 text-blue-500 focus:ring-blue-500" />
                                    <span className="text-sm font-medium text-neutral-300">Recurring event</span>
                                </label>
                                {formRecurring && (
                                    <div>
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Frequency</label>
                                        <select value={formFrequency} onChange={e => setFormFrequency(e.target.value)}
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500">
                                            <option value="daily">Daily</option>
                                            <option value="weekday">Weekdays only</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6 pt-4 border-t border-neutral-800">
                            <button onClick={() => setShowAddDialog(false)}
                                className="flex-1 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-bold text-sm text-neutral-300 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleCreateEvent} disabled={!formTitle.trim() || formSubmitting}
                                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm text-white transition-colors disabled:opacity-50">
                                {formSubmitting ? 'Creating...' : 'Create Event'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Clear All Confirmation Modal ───────────────────────────── */}
            {showClearDialog && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowClearDialog(false)}>
                    <div className="bg-neutral-900 border border-red-500/20 rounded-3xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle size={20} className="text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Clear All Events</h3>
                                <p className="text-xs text-neutral-500">This cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-sm text-neutral-400 mb-4">
                            This will permanently delete <span className="font-bold text-red-400">all calendar events</span> including
                            recurring events, imported plans, and market sessions.
                        </p>
                        <div className="mb-4">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">
                                Type CLEAR to confirm
                            </label>
                            <input
                                type="text"
                                value={clearConfirmText}
                                onChange={e => setClearConfirmText(e.target.value)}
                                placeholder="CLEAR"
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowClearDialog(false)}
                                className="flex-1 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-bold text-sm text-neutral-300 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleClearAll}
                                disabled={clearConfirmText !== 'CLEAR' || clearing}
                                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-sm text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                {clearing ? 'Clearing...' : 'Delete Everything'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
