'use client'

import * as React from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ProblemList from "@/components/ProblemList"
import { ContributionCalendar } from "@/components/ContributionCalendar"

export default function Home() {
  const [userId, setUserId] = React.useState<number | null>(null)

  React.useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      setUserId(userData.id)
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container max-w-7xl mx-auto py-8">
        <div className="flex gap-8">
          <div className="flex-1">
            <ProblemList />
          </div>
          <div className="flex-none pr-6">
            <ContributionCalendar userId={userId} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
