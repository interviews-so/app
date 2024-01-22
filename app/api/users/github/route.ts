import { cookies } from "next/headers"
import { CookieOptions, createServerClient } from "@supabase/ssr"
import { z } from "zod"

import { Database } from "@/types/db"

import { appOctokit, installationOctokit } from "./octokit"

const getInstallationKit = async () => {
  const installationId = await appOctokit().apps.getOrgInstallation({
    org: "interviews-so",
  })

  const octokit = installationOctokit(String(installationId.data.id))

  return octokit
}

const routeContextSchema = z.object({
  userId: z.string(),
  githubUser: z.string(),
})

export async function POST(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  const cookieStore = cookies()

  const supabase = createServerClient<Database>(
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

  const octokit = await getInstallationKit()

  const data = await req.json()
  try {
    // Validate the route context.
    const params = routeContextSchema.parse(data)

    // Ensure user is authentication and has access to this user.
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user || params.userId !== session?.user.id) {
      return new Response(null, { status: 403 })
    }

    // Fetch the github user data from the api.
    const user = await octokit.users.getByUsername({
      username: params.githubUser,
    })

    const res = await supabase.from("github_users").insert({
      github_user: user.data.login,
      github_id: user.data.id,
      user_id: session.user.id,
    })

    console.log(res)

    // Now invite them to the organization.
    await octokit.orgs.createInvitation({
      org: process.env.GITHUB_ORGANIZATION_ID!,
      invitee_id: user.data.id,
    })

    return new Response(null, { status: 200 })
  } catch (error) {
    console.error(error)
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}
