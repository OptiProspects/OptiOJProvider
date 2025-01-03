'use client'

import { MessageList } from "@/components/message/message-list"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function MessagesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto py-8">
        <MessageList />
      </main>
      <Footer />
    </div>
  )
} 