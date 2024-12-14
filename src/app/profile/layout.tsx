'use client'

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { ProfileSidebar } from "@/components/ProfileSidebar"
import { Spinner } from "@/components/ui/spinner"
import { useState, useEffect } from "react"
import { getUserData, UserData } from '@/lib/profileService'

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data: UserData = await getUserData()
        setUserData(data)
      } catch (error) {
        console.error('获取用户数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <Spinner size={48} className="mx-auto" />
        </div>
      ) : (
        <div className="container mx-auto py-10 flex-grow">
          <div className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-1/5">
              <ProfileSidebar userData={userData} />
            </aside>
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}
