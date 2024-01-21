"use client"

import * as React from "react"
import { UserPurchase } from "@/types"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"

interface BillingFormProps extends React.HTMLAttributes<HTMLFormElement> {
  purchase: UserPurchase | null
}

export function BillingForm({
  purchase,
  className,
  ...props
}: BillingFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  async function onSubmit(event) {
    event.preventDefault()
    setIsLoading(!isLoading)

    // Get a Stripe session URL.
    const response = await fetch("/api/users/stripe")

    if (!response?.ok) {
      return toast({
        title: "Something went wrong.",
        description: "Please refresh the page and try again.",
        variant: "destructive",
      })
    }

    // Redirect to the Stripe session.
    // This could be a checkout page for initial upgrade.
    // Or portal to manage existing subscription.
    const session = await response.json()
    if (session) {
      window.location.href = session.url
    }
  }

  return (
    <form className={cn(className)} onSubmit={onSubmit} {...props}>
      <button
        type="submit"
        className={cn(buttonVariants())}
        disabled={isLoading}
      >
        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
        {purchase?.isPaid ? "Manage Subscription" : "Upgrade to PRO"}
      </button>
    </form>
  )
}
