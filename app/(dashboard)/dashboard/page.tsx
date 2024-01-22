import { redirect } from "next/navigation"

import { getUserPurchase } from "@/lib/subscription"
import { BillingForm } from "@/components/billing-form"
import { EmptyPlaceholder } from "@/components/empty-placeholder"
import { GitHubLink } from "@/components/github-link"
import { DashboardShell } from "@/components/shell"
import { getUser } from "@/app/supabase-server"

export const metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const purchase = await getUserPurchase(user.id)

  return (
    <DashboardShell>
      {purchase ? (
        <div>
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="post" />
            <EmptyPlaceholder.Title>
              Purchase Completed{" "}
              {new Date(
                purchase?.user?.stripe_purchase_date ?? Date.now()
              ).toLocaleDateString()}
            </EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              You now have full access to the library. Link your GitHub below.
            </EmptyPlaceholder.Description>
            <BillingForm purchase={purchase} />
            <GitHubLink />
          </EmptyPlaceholder>
        </div>
      ) : (
        <div>
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="post" />
            <EmptyPlaceholder.Title>Purchase Access</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              You have not yet purchased access to the organization. You will
              need a GitHub account in order to gain access.
            </EmptyPlaceholder.Description>
            <BillingForm purchase={purchase} />
          </EmptyPlaceholder>
        </div>
      )}
    </DashboardShell>
  )
}
