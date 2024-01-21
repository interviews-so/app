import { cookies, headers } from "next/headers"
import { CookieOptions, createServerClient } from "@supabase/ssr"
import Stripe from "stripe"

import { env } from "@/env.mjs"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string
  const cookieStore = cookies()

  // We are in a webhook so there is no session, need to use service account to bypass RLS
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ACCOUNT_ROLE!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    }
  )

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (event.type === "checkout.session.completed") {
    // Retrieve the payment details from Stripe.
    const invoice = await stripe.invoices.retrieve(session.invoice as string)

    if (!session?.metadata?.userId) {
      console.error("Missing user id", {
        event,
        session,
        invoice,
      })

      throw new Error("Missing user id")
    }

    // Update the user stripe into in our database.
    await supabase
      .from("users")
      .update({
        stripe_customer_id: invoice.customer as string,
        stripe_invoice_id: invoice.id,
        stripe_purchase_date: new Date(invoice.created * 1000).toUTCString(),
      })
      .eq("id", session.metadata.userId)
      .select("*")
  }

  return new Response(null, { status: 200 })
}
