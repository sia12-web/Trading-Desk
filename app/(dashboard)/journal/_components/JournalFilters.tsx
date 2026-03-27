'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Filter, Search, X } from 'lucide-react'

interface JournalFiltersProps {
    pairs: string[]
    statuses: string[]
}

export function JournalFilters({ pairs, statuses }: JournalFiltersProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [pair, setPair] = useState(searchParams.get('pair') || '')
    const [status, setStatus] = useState(searchParams.get('status') || '')

    // Create a function to update the URL with a new set of parameters
    const createQueryString = useCallback(
        (params: Record<string, string | null>) => {
            const newParams = new URLSearchParams(searchParams.toString())

            Object.entries(params).forEach(([name, value]) => {
                if (value === null || value === '') {
                    newParams.delete(name)
                } else {
                    newParams.set(name, value)
                }
            })

            return newParams.toString()
        },
        [searchParams]
    )

    // Handle search input with a slight debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentSearch = searchParams.get('search') || ''
            if (search !== currentSearch) {
                router.push(`${pathname}?${createQueryString({ search })}`)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [search, router, pathname, createQueryString, searchParams])

    const handlePairChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        setPair(val)
        router.push(`${pathname}?${createQueryString({ pair: val === 'all' ? '' : val })}`)
    }

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        setStatus(val)
        router.push(`${pathname}?${createQueryString({ status: val === 'all' ? '' : val })}`)
    }

    const clearFilters = () => {
        setSearch('')
        setPair('')
        setStatus('')
        router.push(pathname)
    }

    return (
        <div className="flex flex-wrap items-center gap-4 bg-neutral-900 border border-neutral-800 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800 rounded-xl border border-neutral-700">
                <Filter size={16} className="text-neutral-500" />
                <span className="text-sm font-bold text-neutral-400">Filters</span>
            </div>

            <select
                value={pair || 'all'}
                onChange={handlePairChange}
                className="bg-neutral-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer text-neutral-200"
            >
                <option value="all">All Pairs</option>
                {pairs.map(p => (
                    <option key={p} value={p}>{p.replace('_', '/')}</option>
                ))}
            </select>

            <select
                value={status || 'all'}
                onChange={handleStatusChange}
                className="bg-neutral-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer text-neutral-200"
            >
                <option value="all">All Statuses</option>
                {statuses.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
            </select>

            <div className="flex-1" />

            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                    type="text"
                    placeholder="Search notes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-neutral-800 border-none rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none w-64 text-neutral-200 placeholder:text-neutral-600"
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {(search || pair || status) && (
                <button
                    onClick={clearFilters}
                    className="text-xs font-bold text-neutral-500 hover:text-red-400 transition-colors uppercase tracking-widest px-2"
                >
                    Clear
                </button>
            )}
        </div>
    )
}
