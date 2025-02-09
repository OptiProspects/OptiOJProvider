'use client'

import * as React from "react"
import { Play, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DebugResult } from '@/lib/debugService'

interface Sample {
  input: string
  output: string
  explanation?: string
}

interface DebugPanelProps {
  input: string
  onInputChange: (value: string) => void
  samples?: Sample[] | null
  onSampleSelect: (index: number) => void
  isDebugging: boolean
  onDebug: () => void
  debugResult: DebugResult | null
  activeTab: string
  onTabChange: (value: string) => void
}

export function DebugPanel({
  input,
  onInputChange,
  samples = [],
  onSampleSelect,
  isDebugging,
  onDebug,
  debugResult,
  activeTab,
  onTabChange
}: DebugPanelProps) {
  const safeSamples = React.useMemo(() => {
    if (!Array.isArray(samples)) return []
    return samples.filter((sample): sample is Sample => 
      sample && 
      typeof sample === 'object' && 
      typeof sample.input === 'string' && 
      typeof sample.output === 'string'
    )
  }, [samples])

  return (
    <div className="p-4 space-y-4">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="w-full grid grid-cols-2 bg-muted/50">
          <TabsTrigger value="input">输入</TabsTrigger>
          <TabsTrigger value="output">输出</TabsTrigger>
        </TabsList>
        <TabsContent value="input" className="space-y-4 mt-4">
          {safeSamples.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <div className="text-sm font-medium w-full">测试样例</div>
              {safeSamples.map((sample, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onSampleSelect(index)}
                  className="flex items-center gap-2"
                >
                  样例 {index + 1}
                  {sample.explanation && (
                    <span className="text-xs text-muted-foreground">
                      ({sample.explanation})
                    </span>
                  )}
                </Button>
              ))}
            </div>
          )}
          <div className="space-y-2">
            <div className="text-sm font-medium">输入数据</div>
            <Textarea
              placeholder="请输入测试数据..."
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              className="h-32 font-mono"
            />
          </div>
          <Button
            className="w-full"
            onClick={onDebug}
            disabled={isDebugging}
          >
            {isDebugging ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                调试中...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                运行代码
              </>
            )}
          </Button>
        </TabsContent>
        <TabsContent value="output" className="mt-4">
          {debugResult && (
            <ScrollArea className="h-[calc(400px-4rem)] pr-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div>状态：
                    <span className={cn(
                      "font-medium",
                      debugResult.status === "accepted" 
                        ? debugResult.is_correct 
                          ? "text-green-500" 
                          : "text-yellow-500"
                        : "text-red-500"
                    )}>
                      {debugResult.status === "accepted"
                        ? debugResult.is_correct
                          ? "Accepted"
                          : "Wrong Answer"
                        : debugResult.status === "compile_error"
                          ? "Compile Error"
                          : debugResult.status === "runtime_error"
                            ? "Runtime Error"
                            : debugResult.status === "time_limit_exceeded"
                              ? "Time Limit Exceeded"
                              : debugResult.status === "memory_limit_exceeded"
                                ? "Memory Limit Exceeded"
                                : "System Error"}
                    </span>
                  </div>
                  <div>
                    运行时间：{debugResult.time_used}ms | 
                    内存使用：{debugResult.memory_used}MB
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">输入数据</div>
                    <div className={cn(
                      "rounded-md border p-4 font-mono text-sm whitespace-pre overflow-auto",
                      "max-h-[80px] min-h-[40px]"
                    )}>
                      {input}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">程序输出</div>
                    <div className={cn(
                      "rounded-md border p-4 font-mono text-sm whitespace-pre overflow-auto",
                      "max-h-[80px] min-h-[40px]",
                      debugResult.error_message 
                        ? "text-red-500"
                        : debugResult.is_correct 
                          ? "text-green-500" 
                          : "text-yellow-500"
                    )}>
                      {debugResult.error_message || debugResult.output}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">预期输出</div>
                    <div className={cn(
                      "rounded-md border p-4 font-mono text-sm whitespace-pre overflow-auto",
                      "max-h-[80px] min-h-[40px]"
                    )}>
                      {debugResult.expected_output}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 