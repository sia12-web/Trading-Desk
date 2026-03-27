'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, ClipboardList, Loader2, Save, X, ChevronRight, Target, BarChart3, ShieldCheck, Zap, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Activity, Timer, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react'
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '@/lib/data/strategy-templates'
import { StrategyTemplate, ChecklistItem } from '@/lib/types/database'
import { format } from 'date-fns'

const CATEGORY_COLORS: Record<string, { bg: string, text: string, icon: any }> = {
    trend: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: Target },
    indicator: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', icon: Zap },
    level: { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: BarChart3 },
    pattern: { bg: 'bg-rose-500/10', text: 'text-rose-400', icon: ShieldCheck },
    confirmation: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: ChevronRight },
}

// === BUILT-IN STRATEGY GUIDES ===

interface StrategyStep {
    title: string
    details: string[]
    icon: 'trend' | 'indicator' | 'level' | 'confirmation' | 'pattern'
}

interface BuiltInStrategy {
    name: string
    tagline: string
    marketType: string
    timeframe: string
    color: { bg: string; text: string; border: string; glow: string }
    indicators: string[]
    entrySteps: StrategyStep[]
    exitRules: string[]
    riskManagement: string[]
}

const BUILT_IN_STRATEGIES: BuiltInStrategy[] = []

function BuiltInStrategyCard({ strategy }: { strategy: BuiltInStrategy }) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className={`bg-neutral-900/40 border ${strategy.color.border} rounded-[2rem] overflow-hidden transition-all duration-300 shadow-xl ${strategy.color.glow}`}>
            {/* Card Header */}
            <div className="p-7 pb-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 ${strategy.color.bg} ${strategy.color.text} text-[9px] font-black uppercase tracking-[0.2em] rounded-full border ${strategy.color.border}`}>
                            Built-in Strategy
                        </span>
                        <span className="px-3 py-1 bg-neutral-800/60 text-neutral-400 text-[9px] font-black uppercase tracking-[0.15em] rounded-full">
                            {strategy.marketType}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Timer size={12} className="text-neutral-500" />
                        <span className="text-[10px] font-bold text-neutral-500">{strategy.timeframe}</span>
                    </div>
                </div>

                <h3 className={`text-2xl font-black text-white leading-tight mb-2`}>{strategy.name}</h3>
                <p className="text-neutral-500 text-sm font-medium leading-relaxed">{strategy.tagline}</p>

                {/* Indicators */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                    {strategy.indicators.map((ind, i) => (
                        <span key={i} className="px-2.5 py-1 bg-neutral-800/40 text-neutral-400 text-[10px] font-bold rounded-lg border border-neutral-800/60">
                            {ind}
                        </span>
                    ))}
                </div>
            </div>

            {/* Expand Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full flex items-center justify-center gap-2 py-3.5 border-t ${strategy.color.border} ${strategy.color.bg} ${strategy.color.text} text-xs font-black uppercase tracking-widest transition-all hover:brightness-125`}
            >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {isExpanded ? 'Collapse Steps' : 'Show Step-by-Step Guide'}
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t border-neutral-800/50">
                    {/* Entry Steps */}
                    <div className="p-7 space-y-1">
                        <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                            <ArrowRight size={12} />
                            Entry Process
                        </h4>
                        <div className="space-y-4">
                            {strategy.entrySteps.map((step, i) => {
                                const config = CATEGORY_COLORS[step.icon] || CATEGORY_COLORS.confirmation
                                return (
                                    <div key={i} className="bg-neutral-800/20 border border-neutral-800/40 rounded-2xl p-5">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`p-2 rounded-xl ${config.bg} ${config.text}`}>
                                                <config.icon size={14} />
                                            </div>
                                            <h5 className="text-sm font-black text-white">{step.title}</h5>
                                        </div>
                                        <ul className="space-y-2 ml-11">
                                            {step.details.map((detail, j) => (
                                                <li key={j} className="text-xs text-neutral-400 leading-relaxed flex gap-2">
                                                    <span className="text-neutral-600 mt-0.5 shrink-0">&bull;</span>
                                                    <span>{detail}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Exit Rules */}
                    <div className="px-7 pb-5">
                        <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <CheckCircle2 size={12} />
                            Exit Rules
                        </h4>
                        <div className="bg-neutral-800/20 border border-neutral-800/40 rounded-2xl p-5 space-y-2">
                            {strategy.exitRules.map((rule, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                    <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-[9px] font-black">{i + 1}</span>
                                    </div>
                                    <p className="text-xs text-neutral-300 leading-relaxed">{rule}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Risk Management */}
                    <div className="px-7 pb-7">
                        <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <AlertTriangle size={12} />
                            Risk Management
                        </h4>
                        <div className="bg-neutral-800/20 border border-neutral-800/40 rounded-2xl p-5 space-y-2">
                            {strategy.riskManagement.map((rule, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                    <div className="w-5 h-5 rounded-md bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
                                        <ShieldCheck size={10} />
                                    </div>
                                    <p className="text-xs text-neutral-300 leading-relaxed">{rule}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function StrategiesPage() {
    const [templates, setTemplates] = useState<StrategyTemplate[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState<string | null>(null)
    const [showCreate, setShowCreate] = useState(false)
    const [formData, setFormData] = useState<Partial<StrategyTemplate>>({
        name: '',
        description: '',
        checklist_items: []
    })

    useEffect(() => {
        fetchTemplates()
    }, [])

    async function fetchTemplates() {
        setIsLoading(true)
        try {
            const data = await getTemplates()
            setTemplates(data)
        } catch (error) {
            console.error('Failed to fetch templates:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddItem = () => {
        const newItem: ChecklistItem = {
            id: Math.random().toString(36).substr(2, 9),
            label: '',
            category: 'indicator',
            logical_condition: ''
        }
        setFormData((prev) => ({
            ...prev,
            checklist_items: [...(prev.checklist_items || []), newItem]
        }))
    }

    const handleUpdateItem = (id: string, field: keyof ChecklistItem, value: string) => {
        setFormData((prev) => ({
            ...prev,
            checklist_items: prev.checklist_items?.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            )
        }))
    }

    const handleRemoveItem = (id: string) => {
        setFormData((prev) => ({
            ...prev,
            checklist_items: prev.checklist_items?.filter((item) => item.id !== id)
        }))
    }

    const handleSave = async () => {
        if (!formData.name) return

        try {
            if (isEditing) {
                await updateTemplate(isEditing, formData)
            } else {
                await createTemplate(formData)
            }
            setIsEditing(null)
            setShowCreate(false)
            setFormData({ name: '', description: '', checklist_items: [] })
            fetchTemplates()
        } catch (error) {
            console.error('Failed to save template:', error)
        }
    }

    const handleEdit = (template: StrategyTemplate) => {
        setFormData(template)
        setIsEditing(template.id)
        setShowCreate(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this strategy template?')) return
        try {
            await deleteTemplate(id)
            fetchTemplates()
        } catch (error) {
            console.error('Failed to delete template:', error)
        }
    }

    if (isLoading && templates.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p className="mt-4 text-neutral-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Library...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-800 pb-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-600/20">
                            <ClipboardList className="text-blue-500" size={28} />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Strategy</h1>
                    </div>
                    <p className="text-neutral-500 font-medium max-w-lg leading-relaxed">
                        Design your institutional playbooks. Defined rules lead to defined profits.
                    </p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                        onClick={() => {
                            setFormData({ name: '', description: '', checklist_items: [] })
                            setIsEditing(null)
                            setShowCreate(true)
                        }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl transition-all font-black shadow-2xl shadow-blue-500/20"
                    >
                        <Plus size={20} />
                        <span className="text-sm uppercase tracking-wider">New Strategy</span>
                    </button>
                </div>
            </div>

            {/* Strategy Section */}
            <div className="space-y-10">
                <div className="flex items-center gap-3">
                    <h2 className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.2em]">Strategy</h2>
                    <span className="text-[10px] font-bold text-neutral-600 bg-neutral-800/60 px-2 py-0.5 rounded-full">
                        {BUILT_IN_STRATEGIES.length + templates.length}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {/* Built-in strategies */}
                    {BUILT_IN_STRATEGIES.map(strategy => (
                        <BuiltInStrategyCard key={strategy.name} strategy={strategy} />
                    ))}

                    {/* User Blueprint Templates */}
                    {templates.map((template) => (
                        <div key={template.id} className="group relative flex flex-col bg-neutral-900/40 border border-neutral-800 rounded-[2.5rem] overflow-hidden hover:border-blue-500/30 transition-all duration-500 shadow-xl hover:shadow-blue-500/5">
                            {/* Card Header & Backdrop Effect */}
                            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                                <button onClick={() => handleEdit(template)} className="p-3 bg-neutral-800/80 backdrop-blur-md rounded-xl text-neutral-400 hover:text-white transition-all border border-neutral-700/50">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(template.id)} className="p-3 bg-red-500/10 backdrop-blur-md rounded-xl text-red-500/70 hover:text-red-500 transition-all border border-red-500/20">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="p-8 pb-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-blue-500/10">
                                        Blueprint
                                    </span>
                                    <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">Verified Logic</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white leading-tight mb-3 group-hover:text-blue-400 transition-colors">{template.name}</h3>
                                    <p className="text-neutral-500 text-sm font-medium leading-relaxed line-clamp-2">
                                        {template.description || "Systematic rules for high-probability executions."}
                                    </p>
                                </div>
                            </div>

                            {/* Checklist Preview */}
                            <div className="px-8 flex-1">
                                <div className="space-y-3 py-6 border-t border-neutral-800/50">
                                    {template.checklist_items.slice(0, 4).map((item) => {
                                        const config = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.confirmation
                                        return (
                                            <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-800/20 border border-neutral-800/40 hover:bg-neutral-800/40 transition-colors">
                                                <div className={`p-2 rounded-lg ${config.bg} ${config.text}`}>
                                                    <config.icon size={12} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-bold text-neutral-300 truncate tracking-tight">{item.label}</p>
                                                    {item.logical_condition && (
                                                        <p className="text-[9px] text-neutral-500 font-medium truncate italic mt-0.5">{item.logical_condition}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {template.checklist_items.length > 4 && (
                                        <div className="px-3 py-2 text-center text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                                            + {template.checklist_items.length - 4} More Rules
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-8 bg-neutral-900/60 border-t border-neutral-800/80 flex items-center justify-between">
                                <div className="flex gap-6 items-center">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-1">Checkpoints</span>
                                        <span className="text-sm font-black text-blue-500">{template.checklist_items.length}</span>
                                    </div>
                                    <div className="w-[1px] h-6 bg-neutral-800/80" />
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-1">Total Wins</span>
                                        <span className="text-sm font-black text-emerald-500">{template.usage_count}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-tighter block">Modified</span>
                                    <span className="text-[10px] font-black text-neutral-400 capitalize whitespace-nowrap">
                                        {format(new Date(template.updated_at || template.created_at), 'MMM dd, yyyy')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {templates.length === 0 && BUILT_IN_STRATEGIES.length === 0 && (
                    <div className="text-center py-32 bg-neutral-900/30 rounded-[3rem] border border-neutral-800/50 flex flex-col items-center">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                            <div className="relative w-24 h-24 rounded-[2rem] bg-neutral-800 border border-neutral-700 flex items-center justify-center shadow-2xl">
                                <ClipboardList size={48} className="text-neutral-600" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Your Playbook is Empty</h2>
                        <p className="text-neutral-500 max-w-sm mx-auto mb-10 font-medium leading-relaxed">
                            A trader without a plan is just a gambler. Start building your edge today.
                        </p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="bg-white text-black px-10 py-5 rounded-2xl font-black hover:bg-neutral-200 transition-all uppercase tracking-widest text-xs shadow-xl"
                        >
                            Create First Strategy
                        </button>
                    </div>
                )}
            </div>

            {/* Creation Modal (Redesigned) */}
            {showCreate && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowCreate(false)} />
                    <div className="relative bg-neutral-900 border border-neutral-800 rounded-[3rem] w-full max-w-3xl shadow-[0_0_100px_rgba(37,99,235,0.1)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-10 py-8 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
                                    <Target size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">
                                        {isEditing ? 'Pulse Blueprint' : 'Architect Edge'}
                                    </h2>
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Institutional Strategy Designer</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCreate(false)}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-10 space-y-10 overflow-y-auto scrollbar-thin flex-1 bg-neutral-900">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Strategy Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-bold text-lg placeholder-neutral-700"
                                        placeholder="Ex: 5m FVG Reversal"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Context (Optional)</label>
                                    <textarea
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-2xl px-6 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all min-h-[60px] font-medium text-sm placeholder-neutral-700 resize-none"
                                        placeholder="When session crosses OTE levels..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-black text-white tracking-wide uppercase">Rule Matrix</h4>
                                        <p className="text-[10px] font-bold text-neutral-500 tracking-widest">DEFINING THE IF/THEN LOGIC</p>
                                    </div>
                                    <button
                                        onClick={handleAddItem}
                                        className="text-[10px] font-black bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-xl shadow-blue-500/10 uppercase tracking-widest"
                                    >
                                        <Plus size={14} /> Add Parameter
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {formData.checklist_items?.map((item, index) => (
                                        <div key={item.id} className="grid grid-cols-[120px_1fr_1.5fr_48px] gap-4 items-center p-4 rounded-2xl bg-neutral-800/20 border border-neutral-800/60 group animate-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                                            <div className="relative">
                                                <select
                                                    value={item.category}
                                                    onChange={(e) => handleUpdateItem(item.id, 'category', e.target.value as any)}
                                                    className="w-full bg-neutral-900 text-[10px] text-blue-400 font-black border border-neutral-700/50 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 outline-none appearance-none cursor-pointer uppercase tracking-widest"
                                                >
                                                    <option value="trend">Trend</option>
                                                    <option value="indicator">Indicator</option>
                                                    <option value="level">Level</option>
                                                    <option value="pattern">Pattern</option>
                                                    <option value="confirmation">Confirm</option>
                                                </select>
                                            </div>
                                            <input
                                                type="text"
                                                value={item.label}
                                                onChange={(e) => handleUpdateItem(item.id, 'label', e.target.value)}
                                                className="bg-transparent border-none text-white text-sm focus:ring-0 font-bold placeholder-neutral-700 p-0"
                                                placeholder="Rule Label..."
                                            />
                                            <input
                                                type="text"
                                                value={item.logical_condition || ''}
                                                onChange={(e) => handleUpdateItem(item.id, 'logical_condition', e.target.value)}
                                                className="bg-transparent border-none text-neutral-400 text-[11px] focus:ring-0 font-medium placeholder-neutral-700 p-0 italic"
                                                placeholder="Logical Condition..."
                                            />
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-600 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-40 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {(!formData.checklist_items || formData.checklist_items.length === 0) && (
                                        <div className="text-center py-16 border-2 border-dashed border-neutral-800 rounded-3xl">
                                            <ShieldCheck size={32} className="mx-auto text-neutral-700 mb-3 opacity-20" />
                                            <p className="text-neutral-600 font-bold uppercase tracking-widest text-[9px]">Zero logic gates defined. Click "Add Parameter" above.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-10 border-t border-neutral-800 flex gap-4 bg-neutral-900/80 backdrop-blur-md">
                            <button
                                onClick={() => setShowCreate(false)}
                                className="flex-1 px-8 py-4 rounded-2xl border border-neutral-800 text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all font-black uppercase tracking-widest text-xs"
                            >
                                Abandon
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!formData.name}
                                className="flex-[2] px-10 py-5 rounded-2xl bg-blue-600 text-white hover:bg-blue-500 transition-all font-black uppercase tracking-widest text-xs disabled:opacity-30 shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3"
                            >
                                <Save size={18} />
                                {isEditing ? 'Sync Blueprint' : 'Deploy Blueprint'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
