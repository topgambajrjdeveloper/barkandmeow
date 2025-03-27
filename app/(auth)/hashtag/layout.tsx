import type React from "react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function HashtagLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return <div className="container mx-auto">{children}</div>
}

