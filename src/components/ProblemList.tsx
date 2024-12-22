'use client'

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowUpDown } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { getPublicProblemList } from "@/lib/problemService"
import type { PublicProblem } from "@/lib/problemService"

const difficultyMap = {
  easy: { label: "简单", color: "success" as const },
  medium: { label: "中等", color: "secondary" as const },
  hard: { label: "困难", color: "destructive" as const }
} as const

export default function ProblemList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [problems, setProblems] = React.useState<PublicProblem[]>([])
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  
  const page = Number(searchParams.get("page")) || 1
  const searchTitle = searchParams.get("title") || ""
  const difficulty = searchParams.get("difficulty") || "all"
  
  const fetchProblems = React.useCallback(async () => {
    setLoading(true)
    try {
      const result = await getPublicProblemList({
        page,
        page_size: 20,
        title: searchTitle || undefined,
        difficulty: difficulty !== "all" ? difficulty : undefined,
      })
      setProblems(result.problems)
      setTotal(result.total)
    } catch (error) {
      console.error("Failed to fetch problems:", error)
    } finally {
      setLoading(false)
    }
  }, [page, searchTitle, difficulty])

  React.useEffect(() => {
    fetchProblems()
  }, [fetchProblems])

  const updateSearchParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    router.push(`/?${params.toString()}`)
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">题目列表</h2>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="搜索题目..."
          value={searchTitle}
          onChange={(e) => updateSearchParams({ title: e.target.value, page: "1" })}
          className="max-w-sm"
        />

        <Select
          value={difficulty}
          onValueChange={(value) => updateSearchParams({ difficulty: value, page: "1" })}
        >
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
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>标题</TableHead>
              <TableHead className="w-[100px]">难度</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>标签</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Spinner className="h-6 w-6 mx-auto" />
                </TableCell>
              </TableRow>
            ) : problems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  暂无题目
                </TableCell>
              </TableRow>
            ) : (
              problems.map((problem) => (
                <TableRow key={problem.id}>
                  <TableCell>#{problem.id}</TableCell>
                  <TableCell>
                    <Link
                      href={`/problem/${problem.id}`}
                      className="hover:underline"
                    >
                      {problem.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={difficultyMap[problem.difficulty].color}>
                      {difficultyMap[problem.difficulty].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {problem.categories.map((category) => (
                        <Badge
                          key={category.id}
                          variant="outline"
                        >
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {problem.tags.map((tag) => (
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (page > 1) {
                      updateSearchParams({ page: String(page - 1) })
                    }
                  }}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      updateSearchParams({ page: String(p) })
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
                    if (page < totalPages) {
                      updateSearchParams({ page: String(page + 1) })
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
} 