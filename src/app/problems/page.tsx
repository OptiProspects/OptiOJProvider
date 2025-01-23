import { Metadata } from "next"
import ProblemList from "@/components/ProblemList"
import Navbar from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "题目列表 - OptiOJ",
  description: "OptiOJ 题目列表",
}

export default function ProblemsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50/50 py-4 sm:py-6">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>题目列表</CardTitle>
              <CardDescription>
                在这里你可以浏览所有可用的题目
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <ProblemList showFilters={true} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 