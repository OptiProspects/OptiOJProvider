'use client'

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserActivity, type ActivityResponse, type ActivityData } from "@/lib/userService"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

const levelColors = [
  "bg-muted hover:bg-muted/80",                  // 0: 无提交
  "bg-emerald-100 hover:bg-emerald-200",         // 1: 低活跃度
  "bg-emerald-300 hover:bg-emerald-400",         // 2: 中活跃度
  "bg-emerald-500 hover:bg-emerald-600",         // 3: 高活跃度
  "bg-emerald-700 hover:bg-emerald-800",         // 4: 非常活跃
]

interface ContributionCalendarProps {
  userId: number | null
}

type ActivityDay = ActivityData & { level: number }

export function ContributionCalendar({ userId }: ContributionCalendarProps) {
  const [data, setData] = React.useState<ActivityResponse | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false)
        return
      }
      
      try {
        const response = await getUserActivity(userId, 90)
        setData(response)
      } catch (error) {
        console.error('获取活动数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  // 将活动数据转换为90天的数组，没有活动的日期level为0
  const activityDays = React.useMemo(() => {
    if (!data) return Array(90).fill({ level: 0, count: 0, date: '' })

    const days: ActivityDay[] = Array(90).fill({ level: 0, count: 0, date: '' })
    const now = new Date()
    
    data.activities.forEach(activity => {
      const date = new Date(activity.date)
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 90) {
        days[90 - diffDays] = activity
      }
    })

    return days
  }, [data])

  // 将天数分组为每行15天
  const rows = React.useMemo(() => {
    const result: ActivityDay[][] = []
    for (let i = 0; i < activityDays.length; i += 15) {
      result.push(activityDays.slice(i, i + 15))
    }
    return result
  }, [activityDays])

  if (loading) {
    return (
      <Card className="w-[296px]">
        <CardHeader className="p-2">
          <CardTitle className="text-sm">90 日内数据</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="space-y-1">
              <Skeleton className="h-7 w-[60px]" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-7 w-[60px]" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-7 w-[60px]" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
          </div>
          <Separator className="mb-3" />
          <Skeleton className="h-[100px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!userId) {
    return (
      <Card className="w-[296px]">
        <CardHeader className="p-2">
          <CardTitle className="text-sm">90 日内数据</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="flex items-center justify-center h-[180px] text-muted-foreground text-sm">
            登录后即可查看提交动态
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  return (
    <Card className="w-[296px]">
      <CardHeader className="p-2">
        <CardTitle className="text-sm">90 日内数据</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <div className="text-xl font-medium">{data.total_count}</div>
            <div className="text-xs text-muted-foreground">总提交</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-medium">{data.max_count}</div>
            <div className="text-xs text-muted-foreground">最高提交</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-medium">{data.accept_rate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">总通过率</div>
          </div>
        </div>
        <Separator className="mb-3" />
        <div className="flex flex-col gap-1">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1">
              {row.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={cn(
                    "w-4 h-4 rounded transition-colors",
                    levelColors[day.level].split(' ')[0],
                    "hover:cursor-pointer group relative"
                  )}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50">
                    <div className="bg-popover text-popover-foreground text-xs rounded px-2 py-1 whitespace-nowrap shadow-md">
                      {day.count || 0} 次提交
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 