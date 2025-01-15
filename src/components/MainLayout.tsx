import { ReactNode } from "react"
import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  )
} 