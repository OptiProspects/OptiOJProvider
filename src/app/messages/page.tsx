'use client'

import { MessageList } from "@/components/message/message-list"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function MessagesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <MessageList />
        </div>
      </main>
      <Footer />
    </div>
  )
} 