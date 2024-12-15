'use client'

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface DateTimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
}

export function DateTimePicker({ date, setDate, className }: DateTimePickerProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)

  React.useEffect(() => {
    setSelectedDate(date)
  }, [date])

  const selectedYear = selectedDate?.getFullYear()
  const selectedMonth = selectedDate?.getMonth()
  const selectedHour = selectedDate?.getHours().toString().padStart(2, '0')
  const selectedMinute = selectedDate?.getMinutes().toString().padStart(2, '0')

  const currentYear = new Date().getFullYear()
  const years = Array.from(
    { length: 21 }, 
    (_, i) => (currentYear - 10 + i).toString()
  )

  const months = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月"
  ]

  const updateDateTime = (
    type: 'year' | 'month' | 'hour' | 'minute',
    value: string
  ) => {
    const newDate = new Date(selectedDate || new Date())

    switch (type) {
      case 'year':
        newDate.setFullYear(parseInt(value))
        break
      case 'month':
        newDate.setMonth(months.indexOf(value))
        break
      case 'hour':
        newDate.setHours(parseInt(value))
        break
      case 'minute':
        newDate.setMinutes(parseInt(value))
        break
    }

    setSelectedDate(newDate)
    setDate(newDate)
  }

  const handleCalendarSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const hours = selectedDate?.getHours() || 0
      const minutes = selectedDate?.getMinutes() || 0
      newDate.setHours(hours)
      newDate.setMinutes(minutes)
    }
    setSelectedDate(newDate)
    setDate(newDate)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex gap-2">
        <Select
          value={selectedYear?.toString()}
          onValueChange={(value) => updateDateTime('year', value)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="年份" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}年
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={months[selectedMonth ?? 0]}
          onValueChange={(value) => updateDateTime('month', value)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="月份" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleCalendarSelect}
        className="rounded-md border"
        disabled={(date) => date < new Date()}
      />

      <div className="flex gap-2">
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
    </div>
  )
} 