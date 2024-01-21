import { SiteConfig } from "types"

export const siteConfig: SiteConfig = {
  name: "Interviews",
  description:
    "A library of real-world programming scenarios to use as technical interviews.",
  url: "https://interviews.so",
  ogImage: "https://interviews.so/og.jpg",
  links: {
    twitter: "https://twitter.com/interviews_so",
    github: "https://github.com/interviews-so",
    blog: `https://${process.env.NEXT_PUBLIC_APP_URL}/blog`,
    privacy: `https://${process.env.NEXT_PUBLIC_APP_URL}/privacy`,
    terms: `https://${process.env.NEXT_PUBLIC_APP_URL}/terms`,
  },
}
