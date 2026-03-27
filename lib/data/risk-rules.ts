import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database'

export type RiskRule = Database['public']['Tables']['risk_rules']['Row']
export type RuleType = RiskRule['rule_type']

export async function getRiskRules(userId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('risk_rules')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

    if (error) throw error
    return data
}

export async function getActiveRiskRules(userId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('risk_rules')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)

    if (error) throw error
    return data
}

export async function createRiskRule(userId: string, rule: any) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('risk_rules')
        .insert([{ ...rule, user_id: userId }])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function updateRiskRule(id: string, updates: Partial<RiskRule>) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('risk_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteRiskRule(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('risk_rules')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export async function seedDefaultRules(userId: string) {
    const supabase = await createClient()

    // Get existing rules
    const { data: existingRules, error: fetchError } = await supabase
        .from('risk_rules')
        .select('*')
        .eq('user_id', userId)

    if (fetchError) throw fetchError

    const defaultRules = [
        {
            rule_name: 'Max Risk Per Trade',
            rule_type: 'max_risk_per_trade',
            value: { percent: 2 },
            is_active: true
        },
        {
            rule_name: 'Max Daily Loss',
            rule_type: 'max_daily_loss',
            value: { percent: 5 },
            is_active: true
        },
        {
            rule_name: 'Max Open Trades',
            rule_type: 'max_open_trades',
            value: { count: 3 },
            is_active: true
        },
        {
            rule_name: 'Max Position Size',
            rule_type: 'max_position_size',
            value: { lots: 1.0 },
            is_active: true
        },
        {
            rule_name: 'Correlated Exposure',
            rule_type: 'custom',
            value: { count: 2, description: 'Max trades sharing a base or quote currency' },
            is_active: true
        },
        {
            rule_name: 'Minimum Reward:Risk Ratio',
            rule_type: 'min_reward_risk',
            value: { ratio: 1.5 },
            is_active: true
        }
    ]

    // Filter out rules that already exist
    const rulesToInsert = defaultRules.filter(defRule => {
        if (existingRules) {
            if (defRule.rule_type === 'custom') {
                return !existingRules.some(r => r.rule_name === defRule.rule_name)
            }
            return !existingRules.some(r => r.rule_type === defRule.rule_type)
        }
        return true
    })

    if (rulesToInsert.length === 0) return

    const { error } = await supabase
        .from('risk_rules')
        .insert(rulesToInsert.map(r => ({ ...r, user_id: userId })))

    if (error) throw error
}
