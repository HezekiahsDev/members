"use client"

import { redirect } from "next/navigation"
import { MembersArea } from "@/components/members-area"
import { useSearchParams } from "next/navigation"

export default function MembersPage() {
  const searchParams = useSearchParams()
  const startBotAt = searchParams.get("startBotAt")

  // In a real implementation, we would check if the user is logged in
  // For now, we'll just show the members area
  const isLoggedIn = true

  if (!isLoggedIn) {
    redirect("/")
  }

  return <MembersArea startBotAt={startBotAt ? Number.parseInt(startBotAt) : null} />
}
