"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

const MAX_ENERGY = 100
const ENERGY_REGEN_PER_TICK = 1
const ENERGY_REGEN_INTERVAL_SECONDS = 60

/**
 * Server Action para sincronizar a energia do jogador
 * Calcula quanto tempo passou desde a última regeneração e atualiza o banco.
 */
export async function syncEnergyAction(): Promise<{ success: boolean; energy?: number; error?: string }> {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { success: false, error: "Usuário não autenticado" }
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("energy, energy_last_regen_at, created_at")
        .eq("id", user.id)
        .single()

    if (profileError || !profile) {
        return { success: false, error: "Perfil não encontrado" }
    }

    const now = new Date()
    const lastRegenAt = profile.energy_last_regen_at
        ? new Date(profile.energy_last_regen_at)
        : new Date(profile.created_at)

    const diffInSeconds = Math.floor((now.getTime() - lastRegenAt.getTime()) / 1000)

    if (diffInSeconds < ENERGY_REGEN_INTERVAL_SECONDS) {
        return { success: true, energy: profile.energy }
    }

    // Se já está no máximo, apenas atualizamos o timestamp para 'agora' 
    // para evitar que o relógio fique muito para trás
    if (profile.energy >= MAX_ENERGY) {
        await supabase
            .from("profiles")
            .update({ energy_last_regen_at: now.toISOString() })
            .eq("id", user.id)

        return { success: true, energy: profile.energy }
    }

    const ticks = Math.floor(diffInSeconds / ENERGY_REGEN_INTERVAL_SECONDS)
    const energyToAdd = ticks * ENERGY_REGEN_PER_TICK
    const newEnergy = Math.min(MAX_ENERGY, profile.energy + energyToAdd)

    // Atualiza apenas se houver ganho real ou se passou muito tempo
    const { error: updateError } = await supabase
        .from("profiles")
        .update({
            energy: newEnergy,
            energy_last_regen_at: new Date(lastRegenAt.getTime() + (ticks * ENERGY_REGEN_INTERVAL_SECONDS * 1000)).toISOString()
        })
        .eq("id", user.id)

    if (updateError) {
        return { success: false, error: "Erro ao atualizar energia" }
    }

    revalidatePath("/")
    return { success: true, energy: newEnergy }
}
