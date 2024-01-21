import { UserPurchase } from "@/types"

import { createServerSupabaseClient } from "@/app/supabase-server"

export async function getUserPurchase(
  userId: string
): Promise<UserPurchase | null> {
  const supabase = createServerSupabaseClient()
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single()

  if (!user) {
    return null
  }

  // Check if user paid.
  const isPaid = Boolean(user?.stripe_invoice_id)

  return {
    user,
    isPaid,
  }
}
