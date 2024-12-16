import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"
import { flexRender } from "@tanstack/react-table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface FormLayoutProps {
  title: string;
  searchColumn?: string;
  searchPlaceholder?: string;
  showColumnVisibility?: boolean;
  table: any;
  columns: any[];
  loading: boolean;
  children?: React.ReactNode;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (value: string) => void;
  searchValue?: string;
}

export function FormLayout({
  title,
  searchColumn,
  searchPlaceholder = "搜索...",
  showColumnVisibility = true,
  table,
  columns,
  loading,
  children,
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  onSearch,
  searchValue,
}: FormLayoutProps) {
  const totalPages = Math.ceil(total / pageSize)
  
  const getPageNumbers = () => {
    const pages: (number | null)[] = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push(null)
        pages.push(totalPages)
      } else if (page >= totalPages - 2) {
        pages.push(1)
        pages.push(null)
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push(null)
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i)
        }
        pages.push(null)
        pages.push(totalPages)
      }
    }
    return pages
  }

  return (
    <div className="h-full p-6">
      <div className="h-full flex flex-col space-y-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-2xl font-bold">{title}</h1>
          {children}
        </div>

        <div className="flex items-center justify-between px-4">
          {searchColumn && (
            <Input
              placeholder={searchPlaceholder}
              value={searchValue ?? ""}
              onChange={(event) => {
                const value = event.target.value
                if (onSearch) {
                  onSearch(value)
                } else {
                  table.getColumn(searchColumn)?.setFilterValue(value)
                }
              }}
              className="max-w-sm"
            />
          )}
          {showColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  显示列 <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column: any) => column.getCanHide())
                  .map((column: any) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex-1 px-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup: any) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header: any) => (
                      <TableHead key={header.id} className="h-12 px-4 text-center">
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
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Spinner className="text-muted-foreground" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row: any) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell: any) => (
                        <TableCell key={cell.id} className="h-12 px-4 text-center">
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
        </div>

        <div className="px-4 py-2 flex justify-end">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => {
                    if (page > 1) onPageChange?.(page - 1);
                  }}
                  isActive={page > 1}
                />
              </PaginationItem>
              
              {getPageNumbers().map((pageNum, index) => (
                pageNum === null ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      isActive={page === pageNum}
                      onClick={() => onPageChange?.(pageNum)}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              ))}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => {
                    if (page < totalPages) onPageChange?.(page + 1);
                  }}
                  isActive={page < totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
} 