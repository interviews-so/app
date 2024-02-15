"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Auth } from "@supabase/auth-ui-react"
import { createBrowserClient } from "@supabase/ssr"

import { Database } from "@/types/db"
import { getURL } from "@/lib/utils"

export default function UserAuthForm() {
  const router = useRouter()
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.refresh()
      }
    })
  }, [supabase.auth, router])

  return (
    <div className="flex flex-col space-y-4">
      <Auth
        supabaseClient={supabase}
        providers={["google", "github"]}
        redirectTo={getURL()}
        magicLink
        appearance={{
          className: {
            anchor:
              "!text-sm !text-muted-foreground hover:!text-brand !underline !underline-offset-4",
            button:
              "!bg-primary !text-sm !text-primary-foreground hover:!bg-primary/90 !rounded-md !h-10 sm:!h-9 sm:!px-3 lg:!h-11 lg:!px-8",
            container: "",
            divider: "!bg-input",
            input:
              "!h-10 !rounded-md border !border-input !bg-transparent !px-3 !py-2 !text-sm !ring-offset-background file:!border-0 file:!bg-transparent file:!text-sm file:!font-medium placeholder:!text-muted-foreground focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!cursor-not-allowed disabled:!opacity-50",
            label: "!mb-2 !text-xs hover:!cursor-pointer",
            loader: "w-4 h-4 mr-2 animate-spin",
            message: "!text-xs !text-red-600",
          },
        }}
      />
    </div>
  )
}
