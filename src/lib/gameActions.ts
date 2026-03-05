import { supabase } from './supabase'

export interface Profile {
    id: string
    username: string
    level: number
    xp: number
    gold: number
    hp_current: number
    hp_max: number
    energy: number
    job_finish_at: string | null
    current_job_id: string | null
    strength: number
    defense: number
    agility: number
    accuracy: number
    vigor: number
    stat_points_available: number
}

export interface Job {
    id: string
    title: string
    description: string
    duration_seconds: number
    reward_xp: number
    reward_gold: number
    energy_cost: number
}

export interface Enemy {
    id: string
    name: string
    level: number
    hp_max: number
    strength: number
    agility: number
    precision: number
}

/**
 * Tenta buscar o perfil do usuário logado (anônimo ou credencial).
 */
export async function ensureProfile(): Promise<Profile | null> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null

    const currentUser = session.user

    // Tenta buscar o perfil
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

    if (profileError || !profile) {
        console.warn('Perfil não encontrado, tentando criar manualmente...')
        const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
                id: currentUser.id,
                username: `Viajante_${currentUser.id.slice(0, 4)}`,
                gold: 100,
                energy: 100,
                hp_current: 100,
                hp_max: 100
            }])
            .select('*')
            .single()

        return createError ? null : newProfile
    }

    return profile
}

export async function loginWithEmail(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password })
}

export async function signUpWithEmail(email: string, password: string) {
    return await supabase.auth.signUp({ email, password })
}

export async function getJobs(): Promise<Job[]> {
    const { data, error } = await supabase.from('jobs').select('*').order('energy_cost', { ascending: true })
    return error ? [] : data
}

export async function getEnemies(): Promise<Enemy[]> {
    const { data, error } = await supabase.from('npc_enemies').select('*').order('level', { ascending: true })
    return error ? [] : data
}

export async function startJobAction(profileId: string, job: Job) {
    const finishAt = new Date()
    finishAt.setSeconds(finishAt.getSeconds() + job.duration_seconds)

    const { error } = await supabase
        .from('profiles')
        .update({
            current_job_id: job.id,
            job_finish_at: finishAt.toISOString()
        })
        .eq('id', profileId)

    return !error
}

export async function claimJobAction(profile: Profile, job: Job) {
    const { error } = await supabase
        .from('profiles')
        .update({
            xp: profile.xp + job.reward_xp,
            gold: profile.gold + job.reward_gold,
            energy: Math.max(0, profile.energy - job.energy_cost),
            current_job_id: null,
            job_finish_at: null
        })
        .eq('id', profile.id)

    return !error
}

export async function distributeStats(profileId: string, attr: 'strength' | 'agility' | 'accuracy' | 'vigor', points: number = 1): Promise<boolean> {
    const { data: profile, error: getError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single()

    if (getError || !profile) return false
    if (profile.stat_points_available < points) return false

    const updates: any = {
        stat_points_available: profile.stat_points_available - points,
        [attr]: (profile[attr] || 0) + points
    }

    // Vigor aumenta HP Máximo (+10 por ponto)
    if (attr === 'vigor') {
        updates.hp_max = (profile.hp_max || 100) + (points * 10);
        updates.hp_current = (profile.hp_current || 100) + (points * 10); // Cura o jogador ao aumentar o vigor? Geralmente sim em RPGs.
    }

    const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profileId)

    return !updateError
}

export async function awardCombatRewards(profileId: string, xpGain: number, goldGain: number): Promise<boolean> {
    const { data: profile, error: getError } = await supabase
        .from('profiles')
        .select('xp, gold')
        .eq('id', profileId)
        .single()

    if (getError || !profile) return false

    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            xp: (profile.xp || 0) + xpGain,
            gold: (profile.gold || 0) + goldGain
        })
        .eq('id', profileId)

    return !updateError
}
