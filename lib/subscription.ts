import { UserPurchase } from "@/types"

import { createServerSupabaseClient } from "@/app/supabase-server"

import { stripe } from "./stripe"

export async function getUserPurchase(
  userId: string
): Promise<UserPurchase | null> {
  const supabase = createServerSupabaseClient()
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single()

  if (!user || !user.email) {
    return null
  }

  // Check if user paid.
  const isPaid = Boolean(user?.stripe_invoice_id)

  // Sanity check in case webhook didn't fire.
  // Checks stripe customers outright.
  if (!isPaid && !user?.stripe_invoice_id) {
    const customer = await stripe.customers.search({
      query: `email:"${user.email}"`,
    })

    if (customer.data.length > 0) {
      const invoices = await stripe.invoices.list({
        customer: customer.data[0].id,
      })

      if (invoices.data.length > 0) {
        const invoice = invoices.data[0]

        if (invoice.status === "paid") {
          // Need to update the database.
          await supabase
            .from("users")
            .update({
              stripe_customer_id: customer.data[0].id,
              stripe_invoice_id: invoice.id,
              stripe_purchase_date: new Date(
                invoice.created * 1000
              ).toISOString(),
            })
            .eq("id", userId)

          return {
            user,
            isPaid: true,
          }
        }
      }
    }
  }

  return {
    user,
    isPaid,
  }
}
