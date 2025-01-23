'use client'

import * as React from "react"
import { format, parseISO } from "date-fns"
import { toast } from "sonner"
import { MoreHorizontal, Plus, Pencil, Trash2, ChevronRight } from "lucide-react"

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { 
  getTagList, 
  createTag, 
  updateTag, 
  deleteTag, 
  type Tag, 
  type TagCategoryDetail,
  getTagCategoryList,
  getTagCategoryTree,
  createTagCategory,
  updateTagCategory,
  deleteTagCategory
} from "@/lib/tagService"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const tagFormSchema = z.object({
  name: z.string().min(1, "标签名不能为空"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "请输入有效的颜色值，例如：#FF5733"),
  category_id: z.number().optional(),
})

const categoryFormSchema = z.object({
  name: z.string().min(1, "分类名不能为空").max(50, "分类名不能超过50个字符"),
  description: z.string().max(200, "描述不能超过200个字符"),
  parent_id: z.number().nullable(),
})

type TagFormData = z.infer<typeof tagFormSchema>
type CategoryFormData = z.infer<typeof categoryFormSchema>

export default function TagsPage() {
  const [data, setData] = React.useState<Tag[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(10)
  const [loading, setLoading] = React.useState(false)
  const [searchName, setSearchName] = React.useState("")
  const [tagDialogOpen, setTagDialogOpen] = React.useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = React.useState(false)
  const [editingTag, setEditingTag] = React.useState<Tag | null>(null)
  const [editingCategory, setEditingCategory] = React.useState<TagCategoryDetail | null>(null)
  const [selectedCategory, setSelectedCategory] = React.useState<TagCategoryDetail | null>(null)
  const [colorPickerOpen, setColorPickerOpen] = React.useState(false)
  const [categoryTree, setCategoryTree] = React.useState<TagCategoryDetail[]>([])
  const [availableCategories, setAvailableCategories] = React.useState<TagCategoryDetail[]>([])
  const [deleteTagId, setDeleteTagId] = React.useState<number | null>(null)
  const [deleteCategoryId, setDeleteCategoryId] = React.useState<number | null>(null)
  const [expandedCategories, setExpandedCategories] = React.useState<Set<number>>(new Set())

  const tagForm = useForm<TagFormData>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: "",
      color: "#FF5733",
      category_id: undefined
    }
  })

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      parent_id: null
    }
  })

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const [tagsResult, treeResult, listResult] = await Promise.all([
        getTagList({
          page,
          page_size: pageSize,
          name: searchName || undefined
        }),
        getTagCategoryTree(),
        getTagCategoryList()
      ]);
      
      setData(tagsResult.tags || [])
      setTotal(tagsResult.total || 0)
      setCategoryTree(treeResult.categories || [])
      setAvailableCategories(listResult.categories || [])
    } catch (error: any) {
      toast.error("加载失败", {
        description: error.message || "获取数据时发生错误",
      })
      setData([])
      setTotal(0)
      setCategoryTree([])
      setAvailableCategories([])
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchName])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const onSubmitTag = async (data: TagFormData) => {
    try {
      if (editingTag) {
        await updateTag(editingTag.id, {
          name: data.name,
          color: data.color,
          category_id: data.category_id || undefined
        })
        toast.success("更新成功")
      } else {
        await createTag({
          name: data.name,
          color: data.color,
          category_id: data.category_id || undefined
        })
        toast.success("创建成功")
      }
      tagForm.reset()
      setTagDialogOpen(false)
      setEditingTag(null)
      fetchData()
    } catch (error: any) {
      toast.error(editingTag ? "更新失败" : "创建失败", {
        description: error.response?.data?.message || "请稍后重试"
      })
    }
  }

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag)
    tagForm.reset({
      name: tag.name,
      color: tag.color,
      category_id: tag.category_id || undefined
    })
    setTagDialogOpen(true)
  }

  const handleDeleteTag = async (id: number) => {
    try {
      await deleteTag(id)
      toast.success("删除成功")
      setDeleteTagId(null)
      fetchData()
    } catch (error: any) {
      toast.error("删除失败", {
        description: error.response?.data?.message || "请稍后重试"
      })
    }
  }

  const handleEditCategory = (category: TagCategoryDetail) => {
    setEditingCategory(category)
    categoryForm.reset({
      name: category.name,
      description: category.description,
      parent_id: category.parent_id || null
    })
    setCategoryDialogOpen(true)
  }

  const handleDeleteCategory = async (id: number) => {
    try {
      await deleteTagCategory(id)
      toast.success("删除成功")
      setDeleteCategoryId(null)
      fetchData()
    } catch (error: any) {
      toast.error("删除失败", {
        description: error.response?.data?.message || "请稍后重试"
      })
    }
  }

  const onSubmitCategory = async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        await updateTagCategory(editingCategory.id, data)
        toast.success("更新分类成功")
      } else {
        await createTagCategory({
          name: data.name,
          description: data.description,
          parent_id: data.parent_id || undefined
        })
        toast.success("创建分类成功")
      }
      categoryForm.reset()
      setCategoryDialogOpen(false)
      setEditingCategory(null)
      fetchData()
    } catch (error: any) {
      toast.error(editingCategory ? "更新分类失败" : "创建分类失败", {
        description: error.response?.data?.message || "请稍后重试"
      })
    }
  }

  const toggleExpand = (categoryId: number) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const renderCategoryTree = (categories: TagCategoryDetail[], level: number = 0) => {
    if (!categories?.length) return null;
    
    return categories.map((category) => (
      <React.Fragment key={category.id}>
        <div 
          className={`flex items-center justify-between py-2 px-4 hover:bg-gray-100 ${
            selectedCategory?.id === category.id ? 'bg-gray-100' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 16}px` }}
        >
          <div className="flex items-center gap-2 flex-1">
            {category.children?.length > 0 ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpand(category.id)
                }}
              >
                <ChevronRight 
                  className={`h-4 w-4 transition-transform duration-200 ${
                    expandedCategories.has(category.id) ? 'rotate-90' : ''
                  }`}
                />
              </Button>
            ) : (
              <div className="w-4" />
            )}
            <span 
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category.name || '未命名分类'}
            </span>
            {category.description && (
              <span className="text-sm text-gray-500">
                ({category.description})
              </span>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                <Pencil className="mr-2 h-4 w-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteCategoryId(category.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {category.children?.length > 0 && expandedCategories.has(category.id) && (
          renderCategoryTree(category.children, level + 1)
        )}
      </React.Fragment>
    ))
  }

  const totalPages = Math.ceil(total / pageSize)

  // 获取所有二级分类
  const getSecondLevelCategories = (categories: TagCategoryDetail[]): TagCategoryDetail[] => {
    const result: TagCategoryDetail[] = [];
    categories.forEach(category => {
      if (category.children) {
        result.push(...category.children);
      }
    });
    return result;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">标签管理</h2>
      </div>

      <div className="flex gap-8">
        {/* 左侧分类树 */}
        <div className="w-64 border rounded-md">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-medium">标签分类</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                categoryForm.reset({
                  name: "",
                  description: "",
                  parent_id: selectedCategory?.id || null
                })
                setCategoryDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="py-2">
            {renderCategoryTree(categoryTree)}
          </div>
        </div>

        {/* 右侧标签列表 */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
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
              tagForm.reset({
                name: "",
                color: "#FF5733",
                category_id: undefined
              })
              setTagDialogOpen(true)
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
                            <DropdownMenuItem onClick={() => handleEditTag(tag)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteTagId(tag.id)}
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
        </div>
      </div>

      {/* 标签对话框 */}
      <Dialog 
        open={tagDialogOpen} 
        onOpenChange={(open) => {
          setTagDialogOpen(open)
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

          <Form {...tagForm}>
            <form onSubmit={tagForm.handleSubmit(onSubmitTag)} className="space-y-4">
              <FormField
                control={tagForm.control}
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
                control={tagForm.control}
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

              <FormField
                control={tagForm.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>所属分类</FormLabel>
                    <Select
                      value={field.value?.toString() || "0"}
                      onValueChange={(value) => {
                        field.onChange(value === "0" ? undefined : parseInt(value))
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择所属分类（必须是二级分类）" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">无分类</SelectItem>
                        {categoryTree.map((category) => (
                          <SelectGroup key={category.id}>
                            <SelectLabel className="font-bold">{category.name}</SelectLabel>
                            {category.children?.map((subCategory) => (
                              <SelectItem
                                key={subCategory.id}
                                value={subCategory.id.toString()}
                                className="pl-6"
                              >
                                {subCategory.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
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

      {/* 分类对话框 */}
      <Dialog 
        open={categoryDialogOpen} 
        onOpenChange={setCategoryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "编辑分类" : "创建分类"}</DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? "编辑标签分类信息" 
                : selectedCategory 
                  ? `在 "${selectedCategory.name}" 下创建子分类`
                  : "创建一个新的标签分类"}
            </DialogDescription>
          </DialogHeader>

          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)} className="space-y-4">
              <FormField
                control={categoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>分类名称</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={categoryForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>分类描述</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={categoryForm.control}
                name="parent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>父分类</FormLabel>
                    <Select
                      value={field.value?.toString() || "0"}
                      onValueChange={(value) => {
                        field.onChange(value === "0" ? null : parseInt(value))
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择父分类（可选）" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">无父分类（作为一级分类）</SelectItem>
                        {availableCategories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">
                  {editingCategory ? "更新分类" : "创建分类"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ColorPicker
        open={colorPickerOpen}
        onOpenChange={setColorPickerOpen}
        value={tagForm.getValues("color")}
        onChange={(color) => tagForm.setValue("color", color)}
      />

      {/* 删除标签确认对话框 */}
      <AlertDialog 
        open={deleteTagId !== null}
        onOpenChange={(open) => !open && setDeleteTagId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除标签</AlertDialogTitle>
            <AlertDialogDescription>
              此操作不可撤销，确定要删除这个标签吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTagId && handleDeleteTag(deleteTagId)}
              className="bg-red-600 hover:bg-red-700"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除分类确认对话框 */}
      <AlertDialog
        open={deleteCategoryId !== null}
        onOpenChange={(open) => !open && setDeleteCategoryId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除分类</AlertDialogTitle>
            <AlertDialogDescription>
              删除分类会同时删除其下的所有子分类，此操作不可撤销，确定要继续吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCategoryId && handleDeleteCategory(deleteCategoryId)}
              className="bg-red-600 hover:bg-red-700"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
