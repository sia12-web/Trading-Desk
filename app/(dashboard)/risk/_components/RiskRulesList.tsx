'use client'

import React, { useState } from 'react'
import { Shield, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Save, X } from 'lucide-react'
import { RiskRule } from '@/lib/data/risk-rules'

export function RiskRulesList({ initialRules }: { initialRules: RiskRule[] }) {
    const [rules, setRules] = useState<RiskRule[]>(initialRules)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValue, setEditValue] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [newRuleName, setNewRuleName] = useState('')
    const [newRuleValue, setNewRuleValue] = useState('')

    const handleAddCustom = async () => {
        if (!newRuleName.trim() || !newRuleValue.trim()) return
        setLoading(true)
        try {
            const res = await fetch(`/api/risk-rules`, {
                method: 'POST',
                body: JSON.stringify({
                    rule_name: newRuleName,
                    rule_type: 'custom',
                    value: { description: newRuleValue },
                    is_active: true
                }),
                headers: { 'Content-Type': 'application/json' }
            })
            if (res.ok) {
                const newRule = await res.json()
                setRules([...rules, newRule])
                setIsAdding(false)
                setNewRuleName('')
                setNewRuleValue('')
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleToggle = async (rule: RiskRule) => {
        try {
            const res = await fetch(`/api/risk-rules/${rule.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ is_active: !rule.is_active }),
                headers: { 'Content-Type': 'application/json' }
            })
            if (res.ok) {
                setRules(rules.map(r => r.id === rule.id ? { ...r, is_active: !r.is_active } : r))
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this rule?')) return
        try {
            const res = await fetch(`/api/risk-rules/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setRules(rules.filter(r => r.id !== id))
            }
        } catch (err) {
            console.error(err)
        }
    }

    const startEdit = (rule: RiskRule) => {
        setEditingId(rule.id)
        const val = (rule.value as any)
        setEditValue(val.percent || val.count || val.lots || val.ratio || val.description || '')
    }

    const handleSave = async (rule: RiskRule) => {
        setLoading(true)
        try {
            const newValue = { ... (rule.value as any) }
            if (rule.rule_type === 'max_risk_per_trade' || rule.rule_type === 'max_daily_loss') {
                newValue.percent = parseFloat(editValue)
            } else if (rule.rule_type === 'max_open_trades') {
                newValue.count = parseInt(editValue)
            } else if (rule.rule_type === 'max_position_size') {
                newValue.lots = parseFloat(editValue)
            } else if (rule.rule_type === 'min_reward_risk') {
                newValue.ratio = parseFloat(editValue)
            } else {
                newValue.description = editValue
            }

            const res = await fetch(`/api/risk-rules/${rule.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ value: newValue }),
                headers: { 'Content-Type': 'application/json' }
            })
            if (res.ok) {
                setRules(rules.map(r => r.id === rule.id ? { ...r, value: newValue } : r))
                setEditingId(null)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const getRuleDescription = (rule: RiskRule) => {
        const val = rule.value as any
        switch (rule.rule_type) {
            case 'max_risk_per_trade': return `Max risk: ${val.percent}% per trade`
            case 'max_daily_loss': return `Max daily loss: ${val.percent}%`
            case 'max_open_trades': return `Limit: ${val.count} open positions`
            case 'max_position_size': return `Limit: ${val.lots} standard lots`
            case 'min_reward_risk': return `Minimum Reward:Risk Ratio: ${val.ratio}:1`
            case 'custom': return val.description || 'Manual rule check'
            default: return 'Rule configuration'
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rules.map((rule) => (
                <div key={rule.id} className={`bg-neutral-900 border rounded-[2rem] p-8 transition-all ${rule.is_active ? 'border-neutral-800' : 'border-neutral-800 opacity-60'}`}>
                    <div className="flex items-start justify-between mb-6">
                        <div className={`p-3 rounded-2xl ${rule.is_active ? 'bg-blue-500/10 text-blue-500' : 'bg-neutral-800 text-neutral-600'}`}>
                            <Shield size={24} />
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleToggle(rule)} className="text-neutral-500 hover:text-white transition-colors">
                                {rule.is_active ? <ToggleRight size={28} className="text-blue-500" /> : <ToggleLeft size={28} />}
                            </button>
                        </div>
                    </div>

                    {editingId === rule.id ? (
                        <div className="space-y-4">
                            <h4 className="font-bold text-lg">{rule.rule_name}</h4>
                            <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleSave(rule)}
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2"
                                >
                                    <Save size={16} /> Save
                                </button>
                                <button onClick={() => setEditingId(null)} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2">
                                    <X size={16} /> Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-lg mb-1">{rule.rule_name}</h4>
                                <p className="text-neutral-500 text-sm">{getRuleDescription(rule)}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => startEdit(rule)} className="p-2 text-neutral-500 hover:text-white transition-colors">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(rule.id)} className="p-2 text-neutral-500 hover:text-red-400 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {isAdding ? (
                <div className="bg-neutral-900 border border-neutral-800 rounded-[2rem] p-8 space-y-4">
                    <h4 className="font-bold text-lg text-premium-white">New Custom Rule</h4>
                    <input
                        type="text"
                        placeholder="Rule Name (e.g., No trades near news)"
                        value={newRuleName}
                        onChange={(e) => setNewRuleName(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500"
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        value={newRuleValue}
                        onChange={(e) => setNewRuleValue(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleAddCustom}
                            disabled={loading || !newRuleName.trim() || !newRuleValue.trim()}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2"
                        >
                            <Save size={16} /> Create
                        </button>
                        <button onClick={() => setIsAdding(false)} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2">
                            <X size={16} /> Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button onClick={() => setIsAdding(true)} className="border-2 border-dashed border-neutral-800 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 transition-all group">
                    <div className="p-4 rounded-full bg-neutral-900 border border-neutral-800 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
                        <Plus size={24} className="group-hover:text-white" />
                    </div>
                    <span className="font-bold text-neutral-500 group-hover:text-neutral-300">Add Custom Rule</span>
                </button>
            )}
        </div>
    )
}
