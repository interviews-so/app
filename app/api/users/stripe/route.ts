import { cookies } from "next/headers"
import { CookieOptions, createServerClient } from "@supabase/ssr"
import { z } from "zod"

import { stripe } from "@/lib/stripe"
import { getUserPurchase } from "@/lib/subscription"
import { fullUrl } from "@/lib/utils"

const billingUrl = fullUrl("/dashboard")

export async function GET(req: Request) {
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

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user || !session?.user.email) {
      return new Response(null, { status: 403 })
    }

    const purchaseInvoice = await getUserPurchase(session.user.id)

    // The user is paid already.
    // Create a portal session to view invoice.
    if (purchaseInvoice?.isPaid && purchaseInvoice?.user.stripe_customer_id) {
      const stripeInvoice = await stripe.invoices.retrieve(
        purchaseInvoice.user.stripe_invoice_id!
      )

      return new Response(
        JSON.stringify({ url: stripeInvoice.hosted_invoice_url })
      )
    }

    // The user is on the free plan.
    // Create a checkout session to upgrade.
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ["card"],
      mode: "payment",
      billing_address_collection: "auto",
      customer_email: session.user.email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
      },
      customer_creation: "always",
      invoice_creation: {
        enabled: true,
      },
      allow_promotion_codes: true,
    })

    return new Response(JSON.stringify({ url: stripeSession.url }))
  } catch (error) {
    console.log(error)
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(error, { status: 500 })
  }
}
