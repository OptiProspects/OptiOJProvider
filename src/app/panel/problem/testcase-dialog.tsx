'use client'

import * as React from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import { Trash2, Upload, FolderInput } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"
import { getTestCases, uploadTestCase, deleteTestCase, type TestCase } from "@/lib/problemService"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TestCaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  problemId: number
}

function FileInput({
  id,
  label,
  inputRef,
  multiple = false
}: {
  id: string
  label: string
  inputRef: React.MutableRefObject<HTMLInputElement | null>
  multiple?: boolean
}) {
  const [fileName, setFileName] = React.useState<string>("")

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <input
                ref={inputRef}
                id={id}
                type="file"
                multiple={multiple}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
                onChange={(e) => {
                  const files = e.target.files
                  if (files?.length) {
                    if (multiple) {
                      setFileName(`已选择 ${files.length} 个文件`)
                    } else {
                      setFileName(files[0].name)
                    }
                  } else {
                    setFileName("")
                  }
                }}
              />
              <div className="w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm bg-background">
                <div className="truncate">
                  {fileName || "选择文件..."}
                </div>
              </div>
            </div>
          </TooltipTrigger>
          {fileName && (
            <TooltipContent>
              {multiple ? (
                <div className="max-w-sm">
                  {Array.from(inputRef.current?.files || []).map((file, index) => (
                    <div key={index} className="truncate">
                      {file.name}
                    </div>
                  ))}
                </div>
              ) : (
                fileName
              )}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

export function TestCaseDialog({
  open,
  onOpenChange,
  problemId
}: TestCaseDialogProps) {
  const [testcases, setTestcases] = React.useState<TestCase[]>([])
  const [loading, setLoading] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const outputRef = React.useRef<HTMLInputElement>(null)
  const [isSample, setIsSample] = React.useState(false)
  const batchInputRef = React.useRef<HTMLInputElement>(null)
  const batchOutputRef = React.useRef<HTMLInputElement>(null)

  const fetchTestCases = React.useCallback(async () => {
    if (!open) return
    setLoading(true)
    try {
      const data = await getTestCases(problemId)
      setTestcases(data)
    } catch (error: any) {
      toast.error("加载失败", {
        description: error.message || "获取测试用例列表时发生错误"
      })
    } finally {
      setLoading(false)
    }
  }, [problemId, open])

  React.useEffect(() => {
    fetchTestCases()
  }, [fetchTestCases])

  const handleUpload = async () => {
    const input = inputRef.current?.files?.[0]
    const output = outputRef.current?.files?.[0]

    if (!input || !output) {
      toast.error("请选择文件", {
        description: "输入和输出文件都必须选择"
      })
      return
    }

    setUploading(true)
    try {
      await uploadTestCase({
        problem_id: problemId,
        input,
        output,
        is_sample: isSample
      })
      toast.success("上传成功")
      fetchTestCases()
      // 清空文件选择
      if (inputRef.current) inputRef.current.value = ''
      if (outputRef.current) outputRef.current.value = ''
      setIsSample(false)
    } catch (error: any) {
      toast.error("上传失败", {
        description: error.response?.data?.message || "请稍后重试"
      })
    } finally {
      setUploading(false)
    }
  }

  const handleBatchUpload = async () => {
    const inputFiles = batchInputRef.current?.files
    const outputFiles = batchOutputRef.current?.files

    if (!inputFiles?.length || !outputFiles?.length) {
      toast.error("请选择文件", {
        description: "输入和输出文件都必须选择"
      })
      return
    }

    if (inputFiles.length !== outputFiles.length) {
      toast.error("文件数量不匹配", {
        description: "输入文件和输出文件的数量必须相同"
      })
      return
    }

    setUploading(true)
    let successCount = 0
    let failCount = 0

    try {
      for (let i = 0; i < inputFiles.length; i++) {
        try {
          await uploadTestCase({
            problem_id: problemId,
            input: inputFiles[i],
            output: outputFiles[i],
            is_sample: isSample
          })
          successCount++
        } catch (error) {
          failCount++
          console.error(`Failed to upload test case ${i + 1}:`, error)
        }
      }

      if (successCount > 0) {
        toast.success(
          `上传完成: ${successCount} 个成功${failCount > 0 ? `, ${failCount} 个失败` : ''}`
        )
        fetchTestCases()
      } else {
        toast.error("上传失败", {
          description: "所有文件上传均失败"
        })
      }

      // 清空文件选择
      if (batchInputRef.current) batchInputRef.current.value = ''
      if (batchOutputRef.current) batchOutputRef.current.value = ''
      setIsSample(false)
    } catch (error: any) {
      toast.error("上传失败", {
        description: error.response?.data?.message || "请稍后重试"
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个测试用例吗？")) return

    try {
      await deleteTestCase(id)
      toast.success("删除成功")
      fetchTestCases()
    } catch (error: any) {
      toast.error("删除失败", {
        description: error.response?.data?.message || "请稍后重试"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>测试用例管理</DialogTitle>
          <DialogDescription>
            管理题目的测试用例，包括样例和非样例数据。
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1" style={{ height: "calc(90vh - 200px)" }}>
          <div className="space-y-4 pr-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-lg border p-4 space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  单个上传
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <FileInput
                    id="input"
                    label="输入文件"
                    inputRef={inputRef}
                  />
                  <FileInput
                    id="output"
                    label="输出文件"
                    inputRef={outputRef}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-sample"
                      checked={isSample}
                      onCheckedChange={setIsSample}
                    />
                    <Label htmlFor="is-sample">作为样例数据</Label>
                  </div>
                  <Button onClick={handleUpload} disabled={uploading}>
                    {uploading ? (
                      <Spinner className="mr-2 h-4 w-4" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    上传测试用例
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <FolderInput className="h-4 w-4" />
                  批量上传
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <FileInput
                    id="batch-input"
                    label="输入文件（可多选）"
                    inputRef={batchInputRef}
                    multiple
                  />
                  <FileInput
                    id="batch-output"
                    label="输出文件（可多选）"
                    inputRef={batchOutputRef}
                    multiple
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <Button onClick={handleBatchUpload} disabled={uploading}>
                    {uploading ? (
                      <Spinner className="mr-2 h-4 w-4" />
                    ) : (
                      <FolderInput className="mr-2 h-4 w-4" />
                    )}
                    批量上传
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead className="w-[100px]">类型</TableHead>
                    <TableHead>输入文件</TableHead>
                    <TableHead>输出文件</TableHead>
                    <TableHead className="w-[180px]">创建时间</TableHead>
                    <TableHead className="w-[100px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <Spinner className="h-6 w-6 mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : testcases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        暂无测试用例
                      </TableCell>
                    </TableRow>
                  ) : (
                    testcases.map((testcase) => (
                      <TableRow key={testcase.id}>
                        <TableCell>#{testcase.id}</TableCell>
                        <TableCell>
                          {testcase.is_sample ? "样例" : "测试"}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="truncate" title={testcase.input_file}>
                            {testcase.input_file}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="truncate" title={testcase.output_file}>
                            {testcase.output_file}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(testcase.created_at), "yyyy-MM-dd HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(testcase.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 