"use client"

import * as React from "react"
import { useMemo } from "react"
import { createBrowserClient } from "@supabase/ssr"

import { Database } from "@/types/db"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"

import { Input } from "./ui/input"
import { toast } from "./ui/use-toast"

interface GitHubLinkProps extends React.HTMLAttributes<HTMLFormElement> {}

export function GitHubLink({ className, ...props }: GitHubLinkProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [githubUser, setGitHubUser] = React.useState<string>()
  const [user, setUser] = React.useState<
    Database["public"]["Tables"]["github_users"]["Row"] | null
  >(null)
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchGitHubUser = useMemo(
    () => async () => {
      const { data } = await supabase.from("github_users").select().limit(1)

      setUser(data?.[0] ?? null)
    },
    [supabase]
  )

  React.useEffect(() => {
    fetchGitHubUser()
  }, [fetchGitHubUser])

  async function onSubmit(event) {
    event.preventDefault()
    setIsLoading((isLoading) => !isLoading)

    const user = await supabase.auth.getUser()

    console.log(
      JSON.stringify({
        userId: user.data.user!.id,
        githubUser: githubUser,
      })
    )

    const response = await fetch("/api/users/github", {
      method: "POST",
      body: JSON.stringify({
        userId: user.data.user!.id,
        githubUser: githubUser,
      }),
    })

    setIsLoading((isLoading) => !isLoading)

    if (!response?.ok) {
      return toast({
        title: "Something went wrong.",
        description: "Please refresh the page and try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="mt-12">
      <h3>
        {!user?.github_user ? "Enter your GitHub handle" : "Update your handle"}
      </h3>
      <form
        className="mt-2 flex flex-row space-x-2"
        onSubmit={onSubmit}
        {...props}
      >
        <Input
          defaultValue={user?.github_user ?? ""}
          className="w-64"
          type="text"
          name="github-username"
          onChange={(event) => setGitHubUser(event.target.value)}
        />
        <button
          type="submit"
          className={cn(buttonVariants())}
          disabled={
            isLoading ||
            githubUser?.length === 0 ||
            githubUser === user?.github_user ||
            !githubUser
          }
        >
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Link
        </button>
      </form>
    </div>
  )
}
