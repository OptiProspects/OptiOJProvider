import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { ProfileSidebar } from "@/components/ProfileSidebar"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="container mx-auto py-10 flex-grow">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-1/5">
            <ProfileSidebar />
          </aside>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}
