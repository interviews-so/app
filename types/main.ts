import { Database } from "./db"

export interface PageMeta {
  title: string
  description: string
  cardImage: string
  url: string
  robots?: string
  favicon?: string
  type?: string
}

export type User = Database["public"]["Tables"]["users"]["Row"]
