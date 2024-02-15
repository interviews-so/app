import { cookies } from "next/headers"
import { CookieOptions, createServerClient } from "@supabase/ssr"
import { Octokit } from "octokit"
import { z } from "zod"

import { Database } from "@/types/db"

import { appOctokit, installationOctokit } from "./octokit"

const getInstallationKit = async () => {
  const installationId = await appOctokit().rest.apps.getOrgInstallation({
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
      console.error(
        "User is not authenticated or does not have access to this user"
      )
      return new Response("Forbidden", { status: 403 })
    }

    let user: Awaited<ReturnType<Octokit["rest"]["users"]["getByUsername"]>>
    try {
      // Fetch the github user data from the api.
      user = await octokit.rest.users.getByUsername({
        username: params.githubUser,
      })
    } catch (error) {
      console.error(`User with login ${params.githubUser} not found`, error)
      return new Response(`User with login ${params.githubUser} not found`, {
        status: 404,
      })
    }

    // Check if the user is already in the organization.
    const members = await octokit.paginate(octokit.rest.orgs.listMembers, {
      org: process.env.GITHUB_ORGANIZATION_ID!,
    })

    console.log("members", members)

    if (members.some((member) => member.id === user.data.id)) {
      console.error("User is already a member of the organization")
      return new Response("User is already a member of the organization", {
        status: 409,
      })
    }

    // Check if the user already has an active invite to the organization.
    const invitations = await octokit.paginate(
      octokit.rest.orgs.listPendingInvitations,
      {
        org: process.env.GITHUB_ORGANIZATION_ID!,
      }
    )

    console.log("invitations", invitations)

    if (
      invitations.some((invitation) => invitation.login === user.data.login)
    ) {
      console.error("User already has an active invitation")
      return new Response("User already has an active invitation", {
        status: 409,
      })
    }

    // Check if they already have a github user in the database.
    const existingUser = await supabase
      .from("github_users")
      .select()
      .eq("user_id", session.user.id)
      // order by the most recent user.
      .order("created_at", { ascending: false })

    console.log("existing user data", existingUser)

    if (existingUser.data?.length ?? 0 > 0) {
      console.log(
        "User already has a github user in the database, need to remove them first"
      )

      try {
        // Fetch the user from the api with their id since they could've changed their name.
        const existingGitHubUser = (await octokit.request(
          `GET /user/${existingUser.data![0].github_id}`
        )) as { data: { login: string; id: number } }

        console.log("original user fetched", existingGitHubUser.data)

        // Check if they are in the org.
        if (
          members.some((member) => member.id === existingGitHubUser.data.id)
        ) {
          console.error("User is a member of the organization")
          // Need to remove them if they are a member of the organization.
          const removedUser = await octokit.rest.orgs.removeMember({
            org: process.env.GITHUB_ORGANIZATION_ID!,
            username: existingGitHubUser.data.login,
          })
          console.log("removed user")
        }

        console.log("invitations", invitations, existingGitHubUser.data.login)

        // Need to cancel any invites too if they have any.
        const existingInvitation = invitations.find(
          (invitation) => invitation.login === existingGitHubUser.data.login
        )
        if (existingInvitation) {
          const cancelInvite = await octokit.rest.orgs.cancelInvitation({
            org: process.env.GITHUB_ORGANIZATION_ID!,
            invitation_id: existingInvitation!.id,
          })
          console.log("cancelled invite", cancelInvite.data)
        }
      } catch (error) {
        console.log("error removing user", error)
      }
    }

    // Add the user to the database.
    const res = await supabase.from("github_users").insert({
      github_user: user.data.login,
      github_id: user.data.id,
      user_id: session.user.id,
    })

    console.log("database response", res)

    // Now invite them to the organization.
    const invite = await octokit.rest.orgs.createInvitation({
      org: process.env.GITHUB_ORGANIZATION_ID!,
      invitee_id: user.data.id,
    })

    console.log("invite", invite.data)

    return new Response(null, { status: 200 })
  } catch (error) {
    console.error(error)
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response("An unexpected error occurred", { status: 500 })
  }
}
