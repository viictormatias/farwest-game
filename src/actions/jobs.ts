"use server"

import { supabase } from "@/lib/supabase"

// Wrapper temporário: este arquivo usa Server Actions mas o projeto usa o client browser.
// Para evitar erro de build, re-exportamos o supabase client.
const createClient = () => supabase
import { revalidatePath } from "next/cache"

// Interfaces baseadas nas tabelas de RPG (profiles, actions, etc)
interface ActionResponse {
    success?: boolean
    error?: string
    message?: string
    data?: any
}

/**
 * Server Action para iniciar um trabalho
 * 1. Verifica energia suficiente
 * 2. Define finish_at
 * 3. Impede outra ação antes do tempo
 */
export async function startJob(jobId: string): Promise<ActionResponse> {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: "Jogador não autenticado." }

    // Obtém dados do jogador
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("energy, job_finish_at")
        .eq("id", user.id)
        .single()

    if (profileError || !profile) return { error: "Perfil não encontrado." }

    // Valida se o jogador já está em um trabalho ativo
    if (profile.job_finish_at && new Date(profile.job_finish_at) > new Date()) {
        return { error: "Você já está executando uma ação/trabalho. Aguarde o término." }
    }

    // Obtém dados do trabalho que deseja iniciar
    const { data: job, error: jobError } = await supabase
        .from("jobs") // Assumindo tabela jobs de conversas anteriores
        .select("id, energy_cost, duration_minutes")
        .eq("id", jobId)
        .single()

    if (jobError || !job) return { error: "Trabalho não encontrado." }

    // 1. Verifique se o jogador tem energia suficiente
    if (profile.energy < job.energy_cost) {
        return { error: "Energia insuficiente para iniciar este trabalho." }
    }

    // 2. Calcule o finish_at
    const finishAt = new Date()
    finishAt.setMinutes(finishAt.getMinutes() + job.duration_minutes)

    // 3. Registre no banco o tempo de fim e bloqueia para novas ações
    // Assumimos que existe uma coluna 'current_job_id' para depois podermos colher a recompensa
    const { error: updateError } = await supabase
        .from("profiles")
        .update({
            job_finish_at: finishAt.toISOString(),
            current_job_id: job.id
        })
        .eq("id", user.id)

    if (updateError) {
        console.error(updateError)
        return { error: "Erro ao registrar o início do trabalho." }
    }

    revalidatePath('/tavern') // Revalida interface local
    return {
        success: true,
        message: "Trabalho iniciado com sucesso!",
        data: { finishAt: finishAt.toISOString() }
    }
}

/**
 * Server Action para coletar a recompensa do trabalho
 * 1. Valida término
 * 2. Adiciona XP/Gold
 * 3. Desconta energia exigida pelo trabalho
 */
export async function claimJob(): Promise<ActionResponse> {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: "Jogador não autenticado." }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("energy, xp, gold, job_finish_at, current_job_id")
        .eq("id", user.id)
        .single()

    if (profileError || !profile) return { error: "Perfil não encontrado." }

    // Verifica se realmente estava em um trabalho
    if (!profile.current_job_id || !profile.job_finish_at) {
        return { error: "Você não tem nenhum trabalho em andamento para coletar." }
    }

    // Valida término (Se a data atual for menor que o término, não deixa coletar)
    if (new Date() < new Date(profile.job_finish_at)) {
        return { error: "Ainda trabalhando. Aguarde o tempo acabar." }
    }

    // Obter detalhes do trabalho concluído (para XP e Gold)
    const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select("energy_cost, xp_reward, gold_reward")
        .eq("id", profile.current_job_id)
        .single()

    if (jobError || !job) return { error: "Dados do trabalho concluído inválidos." }

    // Valida energia (como o desconto ocorre apenas agora, validar mais uma vez se puder ir a zero)
    // Caso de borda: O que acontece se a energia foi gasta em outro lugar enquanto esperava e não tem o suficiente?
    // Impede de reclamar ou joga para zero? Deixaremos que pelo menos esvazie.
    const energyRemaining = Math.max(0, profile.energy - job.energy_cost)

    // Adiciona recompensas e reseta status de trabalho
    const newXp = profile.xp + job.xp_reward
    const newGold = profile.gold + job.gold_reward

    const { error: claimError } = await supabase
        .from("profiles")
        .update({
            energy: energyRemaining,
            xp: newXp,
            gold: newGold,
            job_finish_at: null,
            current_job_id: null
        })
        .eq("id", user.id)

    if (claimError) {
        console.error(claimError)
        return { error: "Erro ao coletar os frutos do seu trabalho." }
    }

    revalidatePath('/tavern')
    return {
        success: true,
        message: `Trabalho concluído! Você recebeu ${job.xp_reward} XP e ${job.gold_reward} Ouro. Sua energia foi reduzida.`,
        data: { xp: newXp, gold: newGold, energy: energyRemaining }
    }
}
