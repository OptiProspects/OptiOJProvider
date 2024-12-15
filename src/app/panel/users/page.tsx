"use client"

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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
import { User, getUserList, deleteUser, banUser, unbanUser } from "@/lib/userService"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { BanTimePicker } from "@/components/ui/ban-time-picker"
import { FormLayout } from "@/components/ui/form-layout"

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime()) || dateString === "0001-01-01T00:00:00Z") {
    return "从未登录";
  }
  return format(date, "yyyy-MM-dd HH:mm:ss");
};

export const columns = (fetchData: () => Promise<void>): ColumnDef<User>[] => [
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
    enableHiding: false,
  },
  {
    accessorKey: "username",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 w-full justify-center font-medium"
        >
          用户名
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="flex h-full items-center justify-center">
        {row.getValue("username")}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: () => <div className="font-medium">邮箱</div>,
    cell: ({ row }) => (
      <div className="flex h-full items-center justify-center">
        {row.getValue("email")}
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: () => <div className="font-medium">角色</div>,
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      let badgeVariant: "default" | "secondary" | "outline"
      let roleText: string
      
      switch (role) {
        case "super_admin":
          badgeVariant = "default"
          roleText = "超级管理员"
          break
        case "admin":
          badgeVariant = "secondary"
          roleText = "管理员"
          break
        default:
          badgeVariant = "outline"
          roleText = "普通用户"
      }
      
      return (
        <div className="flex h-full items-center justify-center">
          <Badge variant={badgeVariant}>{roleText}</Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="font-medium">状态</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as "normal" | "banned"
      return (
        <div className="flex h-full items-center justify-center">
          <Badge variant={status === "normal" ? "success" : "destructive"}>
            {status === "normal" ? "正常" : "封禁"}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: () => <div className="text-center">创建时间</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatDate(row.getValue("created_at"))}</div>
    ),
  },
  {
    accessorKey: "last_login_time",
    header: () => <div className="text-center">最后登录</div>,
    cell: ({ row }) => (
      <div className="text-center">{formatDate(row.getValue("last_login_time"))}</div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="font-medium">操作</div>,
    cell: ({ row }) => {
      const user = row.original
      const [open, setOpen] = React.useState(false)
      const [banReason, setBanReason] = React.useState("")
      const [banDate, setBanDate] = React.useState<Date>()
      const [banTime, setBanTime] = React.useState("")
      const [isPermanent, setIsPermanent] = React.useState(false)

      const handleBanUser = async () => {
        if (!banReason.trim()) {
          toast("请输入封禁原因");
          return;
        }

        try {
          let banExpires: string | undefined;
          if (!isPermanent && banDate) {
            banExpires = banDate.toISOString();
          }

          await banUser({
            user_id: user.id,
            ban_reason: banReason,
            ...(banExpires ? { ban_expires: banExpires } : {})
          });
          
          toast("用户状态已更新", {
            description: `用户 ${user.username} 已封禁`,
          });
          
          setOpen(false);
          setBanReason("");
          setBanDate(undefined);
          setBanTime("");
          setIsPermanent(false);
          fetchData();
        } catch (error) {
          toast("封禁失败", {
            description: "封禁用户时发生错误",
          });
        }
      };

      return (
        <div className="flex h-full items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8 transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring active:scale-95"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">打开菜单</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>操作</DropdownMenuLabel>
              {user.status === "normal" ? (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      封禁用户
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>封禁用户</DialogTitle>
                      <DialogDescription>
                        请输入封禁该用户的原因，如果需要可以设置封禁结束时间。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="banReason" className="text-right">
                          封禁原因
                        </Label>
                        <Input
                          id="banReason"
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                          className="col-span-3"
                          placeholder="请输入封禁原因"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">永久封禁</Label>
                        <div className="col-span-3 flex items-center space-x-2">
                          <Switch
                            checked={isPermanent}
                            onCheckedChange={setIsPermanent}
                          />
                          <span className="text-sm text-muted-foreground">
                            {isPermanent ? "永久封禁" : "设置结束时间"}
                          </span>
                        </div>
                      </div>
                      {!isPermanent && (
                        <div className="grid grid-cols-4 items-start gap-4">
                          <Label className="text-right pt-2">封禁时长</Label>
                          <div className="col-span-3">
                            <BanTimePicker
                              date={banDate}
                              setDate={setBanDate}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpen(false)}>
                        取消
                      </Button>
                      <Button onClick={handleBanUser}>
                        确认封禁
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    unbanUser(user.id)
                      .then(() => {
                        toast("用户状态已更新", {
                          description: `用户 ${user.username} 已解封`,
                        })
                        fetchData();
                      })
                      .catch(() => {
                        toast("解封失败", {
                          description: "解封用户时发生错误",
                        })
                      })
                  }}
                >
                  解封用户
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (confirm("确定要删除该用户吗？")) {
                    deleteUser(user.id)
                      .then(() => {
                        toast("删除成功", {
                          description: `用户 ${user.username} 已被删除`,
                        })
                      })
                      .catch(() => {
                        toast("删除失败", {
                          description: "删除用户时发生错误",
                          action: {
                            label: "重试",
                            onClick: () => deleteUser(user.id),
                          },
                        })
                      })
                  }
                }}
                className="text-red-600"
              >
                删除用户
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

export default function UsersPage() {
  const [data, setData] = React.useState<User[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(10)
  const [loading, setLoading] = React.useState(false)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await getUserList(page, pageSize)
      setData(response.users)
      setTotal(response.total)
    } catch (error) {
      toast("加载失败", {
        description: "获取用户列表时发生错误",
        action: {
          label: "重试",
          onClick: () => fetchData(),
        },
      })
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const table = useReactTable({
    data,
    columns: columns(fetchData),
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
    <FormLayout
      title="基础用户管理"
      searchColumn="username"
      searchPlaceholder="搜索用户名..."
      table={table}
      columns={columns(fetchData)}
      loading={loading}
    >
      {/* 这里可以添加其他操作按钮 */}
    </FormLayout>
  )
} 