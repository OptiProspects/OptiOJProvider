'use client'

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface BanTimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
}

export function BanTimePicker({ date, setDate, className }: BanTimePickerProps) {
  // 获取当前时间作为最小值
  const now = new Date()
  const currentYear = now.getFullYear()

  // 生成时间选项
  const days = Array.from({ length: 365 }, (_, i) => i + 1) // 最多一年
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

  // 获取选中的值
  const selectedDays = date ? Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : undefined
  const selectedHour = date?.getHours().toString().padStart(2, '0')
  const selectedMinute = date?.getMinutes().toString().padStart(2, '0')

  const updateDateTime = (
    type: 'days' | 'hour' | 'minute',
    value: string
  ) => {
    const newDate = new Date()

    switch (type) {
      case 'days':
        newDate.setDate(newDate.getDate() + parseInt(value))
        if (date) {
          newDate.setHours(date.getHours(), date.getMinutes())
        }
        break
      case 'hour':
        newDate.setHours(parseInt(value))
        if (date) {
          newDate.setMinutes(date.getMinutes())
          const days = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          newDate.setDate(newDate.getDate() + days)
        }
        break
      case 'minute':
        newDate.setMinutes(parseInt(value))
        if (date) {
          newDate.setHours(date.getHours())
          const days = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          newDate.setDate(newDate.getDate() + days)
        }
        break
    }

    setDate(newDate)
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <Select
        value={selectedDays?.toString()}
        onValueChange={(value) => updateDateTime('days', value)}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="封禁天数" />
        </SelectTrigger>
        <SelectContent>
          {days.map((day) => (
            <SelectItem key={day} value={day.toString()}>
              {day}天
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedHour}
        onValueChange={(value) => updateDateTime('hour', value)}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="小时" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((hour) => (
            <SelectItem key={hour} value={hour}>
              {hour}时
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedMinute}
        onValueChange={(value) => updateDateTime('minute', value)}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="分钟" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((minute) => (
            <SelectItem key={minute} value={minute}>
              {minute}分
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 