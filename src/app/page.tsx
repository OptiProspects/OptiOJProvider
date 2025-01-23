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
      <main className="flex-grow container max-w-7xl mx-auto py-8 px-4">
        <div className="flex">
          <div className="w-[calc(100%-320px)]">
            <ProblemList />
          </div>
          <div className="w-[300px] pl-8">
            <ContributionCalendar userId={userId} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
