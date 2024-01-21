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
    blog: process.env.NEXT_PUBLIC_APP_URL
      ? `https://${process.env.NEXT_PUBLIC_APP_URL}/blog`
      : "http://localhost:3000/blog",
    privacy: process.env.NEXT_PUBLIC_APP_URL
      ? `https://${process.env.NEXT_PUBLIC_APP_URL}/privacy`
      : "http://localhost:3000/privacy",
    terms: process.env.NEXT_PUBLIC_APP_URL
      ? `https://${process.env.NEXT_PUBLIC_APP_URL}/terms`
      : "http://localhost:3000/terms",
  },
}
