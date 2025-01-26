'use client';
 
import * as React from "react";
import { format } from "date-fns";
import { Clock } from "lucide-react";
 
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface DateTimePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
}
 
export function DateTimePicker({ date, onDateChange, placeholder = "请选择日期和时间" }: DateTimePickerProps) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && date) {
      // 保持原有的时间
      selectedDate.setHours(date.getHours());
      selectedDate.setMinutes(date.getMinutes());
    } else if (selectedDate) {
      // 如果是第一次选择日期，设置默认时间为上午 8:00
      selectedDate.setHours(8);
      selectedDate.setMinutes(0);
    }
    onDateChange?.(selectedDate);
  };
 
  const handleTimeChange = (
    type: "hour" | "minute" | "ampm",
    value: string
  ) => {
    if (date) {
      const newDate = new Date(date);
      if (type === "hour") {
        newDate.setHours(
          (parseInt(value) % 12) + (newDate.getHours() >= 12 ? 12 : 0)
        );
      } else if (type === "minute") {
        newDate.setMinutes(parseInt(value));
      } else if (type === "ampm") {
        const currentHours = newDate.getHours();
        newDate.setHours(
          value === "PM" ? currentHours + 12 : currentHours - 12
        );
      }
      onDateChange?.(newDate);
    }
  };
 
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 text-sm">
          {date ? format(date, "yyyy-MM-dd HH:mm") : placeholder}
        </div>
        {date && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDateChange?.(undefined)}
          >
            清除
          </Button>
        )}
      </div>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="date-time">
          <AccordionTrigger>选择日期和时间</AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="h-[400px] rounded-md border">
              <div className="p-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="mx-auto"
                />
                <div className="mt-4 space-y-4">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    选择时间
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {hours.map((hour) => (
                      <Button
                        key={hour}
                        size="sm"
                        variant={
                          date && date.getHours() % 12 === hour % 12
                            ? "default"
                            : "outline"
                        }
                        onClick={() => handleTimeChange("hour", hour.toString())}
                      >
                        {hour}
                      </Button>
                    ))}
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                      <Button
                        key={minute}
                        size="sm"
                        variant={
                          date && date.getMinutes() === minute
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          handleTimeChange("minute", minute.toString())
                        }
                      >
                        {minute.toString().padStart(2, '0')}
                      </Button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {["AM", "PM"].map((ampm) => (
                      <Button
                        key={ampm}
                        size="sm"
                        variant={
                          date &&
                          ((ampm === "AM" && date.getHours() < 12) ||
                            (ampm === "PM" && date.getHours() >= 12))
                            ? "default"
                            : "outline"
                        }
                        onClick={() => handleTimeChange("ampm", ampm)}
                      >
                        {ampm}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
