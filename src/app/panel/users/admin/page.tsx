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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus } from "lucide-react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getAdminList, addAdmin, removeAdmin, getUserList } from "@/lib/userService"
import { FormLayout } from "@/components/ui/form-layout"

interface Admin {
  id: number;
  user_id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  last_login_time: string;
  last_login_ip: string;
}

const columns: ColumnDef<Admin>[] = [
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
      const badgeVariant = role === "super_admin" ? "default" : "secondary"
      const roleText = role === "super_admin" ? "超级管理员" : "管理员"
      
      return (
        <div className="flex h-full items-center justify-center">
          <Badge variant={badgeVariant}>{roleText}</Badge>
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
    accessorKey: "last_login_time",
    header: () => <div className="text-center">最后登录</div>,
    cell: ({ row }) => {
      const date = new Date(row.getValue("last_login_time"))
      return (
        <div className="text-center">
          {isNaN(date.getTime()) ? "从未登录" : format(date, "yyyy-MM-dd HH:mm:ss")}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const admin = row.original

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
                  if (confirm("确定要移除该管理员吗？")) {
                    removeAdmin(admin.id)
                      .then(() => {
                        toast.success("移除管理员成功")
                        // 刷新列表
                        window.location.reload()
                      })
                      .catch((error) => {
                        toast.error("移除管理员失败", {
                          description: error.response?.data?.error || "未知错误"
                        })
                      })
                  }
                }}
                className="text-red-600"
              >
                移除管理员
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

export default function AdminPage() {
  const [data, setData] = React.useState<Admin[]>([])
  const [loading, setLoading] = React.useState(false)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  
  // 添加管理员对话框状态
  const [open, setOpen] = React.useState(false)
  const [selectedUserId, setSelectedUserId] = React.useState("")
  const [selectedRole, setSelectedRole] = React.useState<string>("")
  const [users, setUsers] = React.useState<Array<{ id: number; username: string }>>([])

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const admins = await getAdminList()
      setData(admins)
    } catch (error: any) {
      toast.error("获取管理员列表失败", {
        description: error.response?.data?.error || "未知错误"
      })
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  // 获取普通用户列表用于添加管理员
  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUserList(1, 100)
        setUsers(response.users.map(user => ({
          id: user.id,
          username: user.username
        })))
      } catch (error) {
        console.error("获取用户列表失败:", error)
      }
    }
    fetchUsers()
  }, [])

  const handleAddAdmin = async () => {
    if (!selectedUserId || !selectedRole) {
      toast.error("请选择用户和角色")
      return
    }

    try {
      await addAdmin(Number(selectedUserId), selectedRole)
      toast.success("添加管理员成功")
      setOpen(false)
      fetchData()
    } catch (error: any) {
      toast.error("添加管理员失败", {
        description: error.response?.data?.error || "未知错误"
      })
    }
  }

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

  return (
    <FormLayout
      title="管理员管理"
      searchColumn="username"
      searchPlaceholder="搜索用户名..."
      table={table}
      columns={columns}
      loading={loading}
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            添加管理员
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加管理员</DialogTitle>
            <DialogDescription>
              选择要添加为管理员的用户和角色类型。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="user" className="text-right">
                选择用户
              </Label>
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="选择用户" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                选择角色
              </Label>
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="super_admin">超级管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddAdmin}>确认添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormLayout>
  )
}
