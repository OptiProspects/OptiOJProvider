"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function PanelPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">管理面板</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>题目统计</CardTitle>
            <CardDescription>系统中的题目总数和分类统计</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">150</div>
            <p className="text-sm text-muted-foreground">总题目数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>用户统计</CardTitle>
            <CardDescription>注册用户和活跃用户统计</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-sm text-muted-foreground">注册用户数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>提交统计</CardTitle>
            <CardDescription>代码提交和通过率统计</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-sm text-muted-foreground">平均通过率</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
