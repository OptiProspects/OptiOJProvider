'use client'

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Plus } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Spinner } from "@/components/ui/spinner"
import { getProblemList, deleteProblem } from "@/lib/problemService"
import type { Problem } from "@/lib/problemService"
import { CreateProblemDialog } from "./create-dialog"
import { TestCaseDialog } from "./testcase-dialog"

const difficultyMap = {
  easy: { label: "简单", color: "success" as const },
  medium: { label: "中等", color: "secondary" as const },
  hard: { label: "困难", color: "destructive" as const }
} as const

export default function ProblemPage() {
  const [data, setData] = React.useState<Problem[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(10)
  const [loading, setLoading] = React.useState(false)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  
  const [searchTitle, setSearchTitle] = React.useState("")
  const [difficulty, setDifficulty] = React.useState<string>("all")
  const [isPublic, setIsPublic] = React.useState<string>("all")

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [testcaseDialogOpen, setTestcaseDialogOpen] = React.useState(false)
  const [selectedProblemId, setSelectedProblemId] = React.useState<number>(0)

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const result = await getProblemList({
        page,
        page_size: pageSize,
        title: searchTitle || undefined,
        difficulty: difficulty !== "all" ? difficulty : undefined,
        is_public: isPublic !== "all" ? isPublic === "public" : undefined
      });
      
      setData(result.problems)
      setTotal(result.total)
    } catch (error: any) {
      toast.error("加载失败", {
        description: error.message || "获取题目列表时发生错误",
      })
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchTitle, difficulty, isPublic])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const columns: ColumnDef<Problem>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 w-full justify-center font-medium"
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          #{row.getValue("id")}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 w-full justify-center font-medium"
          >
            标题
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="flex h-full items-center justify-center">
          {row.getValue("title")}
        </div>
      ),
    },
    {
      accessorKey: "difficulty",
      header: () => <div className="font-medium">难度</div>,
      cell: ({ row }) => {
        const difficulty = row.getValue("difficulty") as keyof typeof difficultyMap
        return (
          <div className="flex h-full items-center justify-center">
            <Badge variant={difficultyMap[difficulty].color}>
              {difficultyMap[difficulty].label}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "categories",
      header: () => <div className="font-medium">分类</div>,
      cell: ({ row }) => {
        const categories = row.getValue("categories") as Problem["categories"]
        return (
          <div className="flex h-full items-center justify-center gap-1">
            {categories.map(category => (
              <Badge key={category.id} variant="outline">
                {category.name}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: "tags",
      header: () => <div className="font-medium">标签</div>,
      cell: ({ row }) => {
        const tags = row.getValue("tags") as Problem["tags"]
        return (
          <div className="flex h-full items-center justify-center gap-1">
            {tags.map(tag => (
              <Badge 
                key={tag.id} 
                style={{
                  backgroundColor: tag.color,
                  color: '#fff'
                }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: "is_public",
      header: () => <div className="font-medium">状态</div>,
      cell: ({ row }) => {
        const isPublic = row.getValue("is_public") as boolean
        return (
          <div className="flex h-full items-center justify-center">
            <Badge variant={isPublic ? "success" : "secondary"}>
              {isPublic ? "公开" : "私有"}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: () => <div className="text-center">创建时间</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {format(new Date(row.getValue("created_at")), "yyyy-MM-dd HH:mm:ss")}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const problem = row.original

        return (
          <div className="flex h-full items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>操作</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    // TODO: 实现编辑功能
                    toast.info("编辑功能开发中")
                  }}
                >
                  编辑题目
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedProblemId(problem.id)
                    setTestcaseDialogOpen(true)
                  }}
                >
                  测试数据
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    if (confirm("确定要删除该题目吗？")) {
                      deleteProblem(problem.id)
                        .then(() => {
                          toast.success("删除成功")
                          fetchData()
                        })
                        .catch((error) => {
                          toast.error("删除失败", {
                            description: error.response?.data?.message || "请稍后重试"
                          })
                        })
                    }
                  }}
                  className="text-red-600"
                >
                  删除题目
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">题目管理</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="搜索题目标题..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="难度" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部难度</SelectItem>
            <SelectItem value="easy">简单</SelectItem>
            <SelectItem value="medium">中等</SelectItem>
            <SelectItem value="hard">困难</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={isPublic} onValueChange={setIsPublic}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="public">公开</SelectItem>
            <SelectItem value="private">私有</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新建题目
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <Spinner className="h-6 w-6 mx-auto" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  暂无数据
                </TableCell>
              </TableRow>
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

      <CreateProblemDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchData}
      />

      <TestCaseDialog
        open={testcaseDialogOpen}
        onOpenChange={setTestcaseDialogOpen}
        problemId={selectedProblemId}
      />
    </div>
  )
}
