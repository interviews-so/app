import * as React from "react"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

import { Logo } from "./logo-icon"

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn(className)}>
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Logo />
          <p className="text-center text-sm leading-loose md:text-left">
            Made with ❤️ by{" "}
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              interviews
            </a>
            . Hosted on{" "}
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Vercel
            </a>
            . The source code for this site is available on{" "}
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose md:text-left">
            Here&apos;s our{" "}
            <a
              href={siteConfig.links.terms}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href={siteConfig.links.privacy}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
