import { cookies, headers } from "next/headers"
import { CookieOptions, createServerClient } from "@supabase/ssr"
import Stripe from "stripe"

import { env } from "@/env.mjs"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const user = await supabase.auth.getSession()

  console.log(user)

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

  console.log("event.type", event.type)

  if (event.type === "checkout.session.completed") {
    // Retrieve the payment details from Stripe.

    console.log("session", session)
    const invoice = await stripe.invoices.retrieve(session.invoice as string)
    console.log("invoice", invoice)

    if (!session?.metadata?.userId) {
      console.error("Missing user id", {
        event,
        session,
        invoice,
      })

      throw new Error("Missing user id")
    }

    console.log("invoice.customer", invoice.customer, session.metadata.userId)

    // Update the user stripe into in our database.
    const res = await supabase
      .from("users")
      .update({
        stripe_customer_id: invoice.customer as string,
        stripe_invoice_id: invoice.id,
        stripe_purchase_date: new Date(invoice.created).toUTCString(),
      })
      .eq("id", session.metadata.userId)
      .select("*")

    console.log("res", res)
  }

  return new Response(null, { status: 200 })
}
