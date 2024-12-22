'use client'

import * as React from "react"
import { format, parseISO } from "date-fns"
import { toast } from "sonner"
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { ColorPicker } from "@/components/ui/color-picker"
import { getTagList, createTag, updateTag, deleteTag, type Tag } from "@/lib/tagService"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const formSchema = z.object({
  name: z.string().min(1, "标签名不能为空"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "请输入有效的颜色值，例如：#FF5733"),
})

type FormData = z.infer<typeof formSchema>

export default function TagsPage() {
  const [data, setData] = React.useState<Tag[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(10)
  const [loading, setLoading] = React.useState(false)
  const [searchName, setSearchName] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingTag, setEditingTag] = React.useState<Tag | null>(null)
  const [colorPickerOpen, setColorPickerOpen] = React.useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: "#FF5733"
    }
  })

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const result = await getTagList({
        page,
        page_size: pageSize,
        name: searchName || undefined
      });
      
      setData(result.tags)
      setTotal(result.total)
    } catch (error: any) {
      toast.error("加载失败", {
        description: error.message || "获取标签列表时发生错误",
      })
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchName])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const onSubmit = async (data: FormData) => {
    try {
      if (editingTag) {
        await updateTag(editingTag.id, data)
        toast.success("更新成功")
      } else {
        await createTag(data)
        toast.success("创建成功")
      }
      form.reset()
      setDialogOpen(false)
      setEditingTag(null)
      fetchData()
    } catch (error: any) {
      toast.error(editingTag ? "更新失败" : "创建失败", {
        description: error.response?.data?.message || "请稍后重试"
      })
    }
  }

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag)
    form.reset({
      name: tag.name,
      color: tag.color
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个标签吗？")) return

    try {
      await deleteTag(id)
      toast.success("删除成功")
      fetchData()
    } catch (error: any) {
      toast.error("删除失败", {
        description: error.response?.data?.message || "请稍后重试"
      })
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">标签管理</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="搜索标签名称..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <Button onClick={() => {
          setEditingTag(null)
          form.reset({
            name: "",
            color: "#FF5733"
          })
          setDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          新建标签
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>标签名称</TableHead>
              <TableHead>颜色</TableHead>
              <TableHead className="w-[180px]">创建时间</TableHead>
              <TableHead className="w-[180px]">更新时间</TableHead>
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
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              data.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>#{tag.id}</TableCell>
                  <TableCell>
                    <Badge style={{ backgroundColor: tag.color }}>
                      {tag.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.color}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(parseISO(tag.created_at), "yyyy-MM-dd HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    {tag.updated_at ? format(parseISO(tag.updated_at), "yyyy-MM-dd HH:mm:ss") : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(tag)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(tag.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (page > 1) setPage(page - 1)
                  }}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(p)
                    }}
                    isActive={page === p}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (page < totalPages) setPage(page + 1)
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <Dialog 
        open={dialogOpen} 
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setColorPickerOpen(false)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTag ? "编辑标签" : "创建标签"}</DialogTitle>
            <DialogDescription>
              {editingTag ? "编辑标签信息" : "创建一个新的标签"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标签名称</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标签颜色</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input 
                            {...field} 
                            value={field.value.toUpperCase()}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-[60px] px-0"
                          style={{ backgroundColor: field.value }}
                          onClick={() => setColorPickerOpen(true)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">
                  {editingTag ? "更新标签" : "创建标签"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ColorPicker
        open={colorPickerOpen}
        onOpenChange={setColorPickerOpen}
        value={form.getValues("color")}
        onChange={(color) => form.setValue("color", color)}
      />
    </div>
  )
}
