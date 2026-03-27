import { createClient } from '@/lib/supabase/server'

export async function uploadScreenshot(file: File, tradeId: string, userId: string) {
    const supabase = await createClient()

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${userId}/${tradeId}/${fileName}`

    const { error: uploadError } = await supabase.storage
        .from('trade-screenshots')
        .upload(filePath, file)

    if (uploadError) throw uploadError

    return filePath
}

export async function getScreenshotUrl(storagePath: string) {
    const supabase = await createClient()
    const { data } = await supabase.storage
        .from('trade-screenshots')
        .createSignedUrl(storagePath, 3600) // 1 hour expiry

    return data?.signedUrl
}

export async function deleteScreenshot(id: string, storagePath: string) {
    const supabase = await createClient()

    // 1. Remove from storage
    const { error: storageError } = await supabase.storage
        .from('trade-screenshots')
        .remove([storagePath])

    if (storageError) throw storageError

    // 2. Delete record
    const { error: dbError } = await supabase
        .from('trade_screenshots')
        .delete()
        .eq('id', id)

    if (dbError) throw dbError
}
