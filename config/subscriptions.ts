import { SubscriptionPlan } from "types"
import { env } from "@/env.mjs"

export const freePlan: SubscriptionPlan = {
  name: "Free",
  description:
    "The free plan is limited to 3 posts. Upgrade to the PRO plan for unlimited posts.",
  stripe_price_id: "",
}

export const proPlan: SubscriptionPlan = {
  name: "Interviews Pro",
  description:
    "Full access to the interviews.so catalog of interview scenarios.",
  stripe_price_id: env.STRIPE_PRO_MONTHLY_PLAN_ID || "",
}
