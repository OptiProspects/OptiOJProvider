'use client'

import * as React from "react"
import { Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import apiClient from "@/config/apiConfig"

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
import { getPublicProblemList, getCurrentDifficultySystem, type DifficultySystemResponse, type Difficulty } from "@/lib/problemService"
import type { PublicProblem } from "@/lib/problemService"
import { CheckCircle2, Circle, XCircle } from "lucide-react"
import { TagFilterDialog } from "@/components/tag-filter-dialog"
import { Tag } from "@/lib/tagService"
import { normalDifficultyMap, oiDifficultyMap } from "@/lib/difficulty"

const statusMap = {
  accepted: { icon: CheckCircle2, color: "text-green-500" },
  attempted: { icon: XCircle, color: "text-red-500" },
  null: { icon: Circle, color: "text-muted-foreground" }
} as const

interface TagListResponse {
  tags: Tag[];
  total: number;
  page: number;
  page_size: number;
}

function ProblemListContent({ showFilters = false }: { showFilters?: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [problems, setProblems] = React.useState<PublicProblem[]>([])
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [difficultySystem, setDifficultySystem] = React.useState<DifficultySystemResponse | null>(null)
  const [tags, setTags] = React.useState<Tag[]>([])
  
  const page = Number(searchParams.get("page")) || 1
  const searchTitle = searchParams.get("title") || ""
  const difficulty = searchParams.get("difficulty") || "all"
  const selectedTagsStr = searchParams.get("tags") || ""
  const selectedTags = React.useMemo(() => 
    selectedTagsStr ? selectedTagsStr.split(",").filter(Boolean) : []
  , [selectedTagsStr])
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchTags = React.useCallback(async () => {
    try {
      const response = await apiClient.get<{ code: number; data: TagListResponse }>("/tags/getTagList", {
        params: {
          page: 1,
          page_size: 100,
        }
      });
      if (response.data.code === 200) {
        setTags(response.data.data.tags);
      }
    } catch (error) {
      console.error("获取标签列表失败:", error);
    }
  }, []);

  React.useEffect(() => {
    if (showFilters) {
      fetchTags();
    }
  }, [showFilters, fetchTags]);

  const fetchProblems = React.useCallback(async () => {
    setLoading(true)
    try {
      const result = await getPublicProblemList({
        page,
        page_size: 20,
        title: searchTitle || undefined,
        difficulty: difficulty !== "all" ? difficulty : undefined,
        tag_ids: selectedTags.length > 0 ? selectedTags.map(Number) : undefined,
      })
      setProblems(result.problems || [])
      setTotal(result.total)
    } catch (error) {
      console.error("Failed to fetch problems:", error)
    } finally {
      setLoading(false)
    }
  }, [page, searchTitle, difficulty, selectedTagsStr])

  React.useEffect(() => {
    fetchProblems()
  }, [fetchProblems])

  React.useEffect(() => {
    getCurrentDifficultySystem()
      .then(system => {
        setDifficultySystem(system)
      })
      .catch(error => {
        console.error("获取难度系统失败:", error)
      })
  }, [])

  const updateSearchParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    router.push(`/problems?${params.toString()}`)
  }

  const totalPages = Math.ceil(total / 20)

  const getDifficultyLabel = (difficulty: Difficulty) => {
    if (!difficultySystem) return { label: difficulty, color: "outline" as const }
    
    const currentSystemInfo = difficultySystem.systems.find(
      sys => sys.system === difficultySystem.current_system
    )
    if (!currentSystemInfo) return { label: difficulty, color: "outline" as const }

    const difficultyInfo = currentSystemInfo.difficulties.find(
      diff => diff.code === difficulty
    )
    if (!difficultyInfo) return { label: difficulty, color: "outline" as const }

    const isOiSystem = difficultySystem.current_system === "oi"
    const map = isOiSystem ? oiDifficultyMap : normalDifficultyMap
    return map[difficulty as keyof typeof map] || { label: difficultyInfo.display, color: "outline" as const }
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">难度：</span>
              <Select
                value={difficulty}
                onValueChange={(value) => updateSearchParams({ difficulty: value, page: "1" })}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="难度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部难度</SelectItem>
                  {difficultySystem && difficultySystem.systems
                    .find(sys => sys.system === difficultySystem.current_system)
                    ?.difficulties.map(diff => (
                      <SelectItem key={diff.code} value={diff.code}>
                        {diff.display}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">搜索：</span>
              <Input
                placeholder="搜索题目..."
                value={searchTitle}
                onChange={(e) => updateSearchParams({ title: e.target.value, page: "1" })}
                className="max-w-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <TagFilterDialog
              selectedTags={selectedTags}
              onTagsChange={(tags) => updateSearchParams({ tags: tags.join(","), page: "1" })}
              tags={tags}
            />
            
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {selectedTags.map(tagId => {
                  const tag = tags.find(t => String(t.id) === tagId)
                  if (!tag) return null
                  return (
                    <Badge
                      key={tag.id}
                      className="cursor-pointer gap-1.5"
                      style={{
                        backgroundColor: tag.color,
                        color: '#fff'
                      }}
                      onClick={() => {
                        const newTags = selectedTags.filter(id => id !== String(tag.id))
                        updateSearchParams({ tags: newTags.join(","), page: "1" })
                      }}
                    >
                      {tag.name}
                      <XCircle className="h-3 w-3" />
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] text-center">状态</TableHead>
              <TableHead className="w-[80px] text-center">ID</TableHead>
              <TableHead>标题</TableHead>
              <TableHead className="w-[100px] text-center">难度</TableHead>
              <TableHead className="text-center">分类</TableHead>
              <TableHead className="text-center">标签</TableHead>
              <TableHead className="w-[120px] text-center">提交次数</TableHead>
              <TableHead className="w-[100px] text-center">通过率</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <Spinner className="h-6 w-6 mx-auto" />
                </TableCell>
              </TableRow>
            ) : problems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  暂无题目
                </TableCell>
              </TableRow>
            ) : (
              problems.map((problem) => {
                const StatusIcon = statusMap[problem.user_status || 'null'].icon
                return (
                  <TableRow key={problem.id}>
                    <TableCell className="text-center">
                      <StatusIcon 
                        className={cn(
                          "h-5 w-5 mx-auto",
                          statusMap[problem.user_status || 'null'].color
                        )}
                      />
                    </TableCell>
                    <TableCell className="text-center">#{problem.id}</TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-left"
                        onClick={() => router.push(`/problem/${problem.id}`)}
                      >
                        {problem.title}
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getDifficultyLabel(problem.difficulty).color}>
                        {getDifficultyLabel(problem.difficulty).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap justify-center gap-1">
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
                      <div className="flex flex-wrap justify-center gap-1">
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
                    <TableCell className="text-center">
                      <div className="text-sm">
                        <span className="text-green-500">{problem.accept_count}</span>
                        {' / '}
                        <span>{problem.submission_count}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm">
                        {problem.accept_rate.toFixed(1)}%
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
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

export default function ProblemList({ showFilters = false }: { showFilters?: boolean }) {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        {showFilters && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-10 w-[120px] bg-gray-100 animate-pulse rounded-md" />
            <div className="h-10 w-[150px] bg-gray-100 animate-pulse rounded-md" />
            <div className="h-10 w-[200px] bg-gray-100 animate-pulse rounded-md" />
          </div>
        )}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">题目列表</h2>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] text-center">状态</TableHead>
                <TableHead className="w-[80px] text-center">ID</TableHead>
                <TableHead>标题</TableHead>
                <TableHead className="w-[100px] text-center">难度</TableHead>
                <TableHead className="text-center">分类</TableHead>
                <TableHead className="text-center">标签</TableHead>
                <TableHead className="w-[120px] text-center">提交次数</TableHead>
                <TableHead className="w-[100px] text-center">通过率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <Spinner className="h-6 w-6 mx-auto" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    }>
      <ProblemListContent showFilters={showFilters} />
    </Suspense>
  )
} 