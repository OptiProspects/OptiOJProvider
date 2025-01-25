'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Plus, Search } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { getTeamList, getTeamAvatarUrl } from "@/lib/teamService"
import type { TeamDetail } from "@/lib/teamService"
import { CreateTeamDialog } from "@/components/team/create-team-dialog"
import { TeamApplyDialog } from "@/components/team/team-apply-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

export default function TeamsPage() {
  const router = useRouter()
  const [teams, setTeams] = React.useState<TeamDetail[]>([])
  const [loading, setLoading] = React.useState(true)
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(10)
  const [keyword, setKeyword] = React.useState("")
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)
  const [showApplyDialog, setShowApplyDialog] = React.useState(false)
  const [applyingTeamId, setApplyingTeamId] = React.useState<number | null>(null)
  const [showAllTeams, setShowAllTeams] = React.useState(true)
  const debouncedKeyword = useDebounce(keyword, 500)
  const abortControllerRef = React.useRef<AbortController | null>(null)

  const fetchTeams = React.useCallback(async () => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      const abortController = new AbortController()
      abortControllerRef.current = abortController
      
      setLoading(true)
      const response = await getTeamList({
        page,
        page_size: pageSize,
        scope: showAllTeams ? 'all' : 'joined',
        keyword: debouncedKeyword || undefined,
      })
      
      if (abortControllerRef.current === abortController) {
        setTeams(response.teams)
        setTotal(response.total)
        setLoading(false)
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return
      console.error("获取团队列表失败:", error)
      setLoading(false)
    }
  }, [page, pageSize, debouncedKeyword, showAllTeams])

  React.useEffect(() => {
    fetchTeams()
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchTeams])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value)
    setPage(1)
  }

  const handleApply = (teamId: number) => {
    setApplyingTeamId(teamId)
    setShowApplyDialog(true)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8 max-w-[1200px]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
            <h1 className="text-xl sm:text-2xl font-bold">团队</h1>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              创建团队
            </Button>
          </div>

          <Tabs defaultValue="all-teams" className="w-full px-2" onValueChange={(value) => setShowAllTeams(value === 'all-teams')}>
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="all-teams" className="flex-1 sm:flex-none">所有团队</TabsTrigger>
              <TabsTrigger value="teams" className="flex-1 sm:flex-none">我加入的团队</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 px-2">
            <div className="relative flex-1 max-w-full sm:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索团队..."
                value={keyword}
                onChange={handleSearch}
                className="pl-8 w-full"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48 sm:h-64">
              <Spinner className="h-8 w-8" />
            </div>
          ) : showAllTeams ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-2">
              {teams.map((team) => (
                <Card
                  key={team.id}
                  className="transition-colors hover:bg-muted/50"
                >
                  <CardHeader className="space-y-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage 
                          src={getTeamAvatarUrl(team)} 
                          alt={team.name}
                        />
                        <AvatarFallback>
                          {getTeamAvatarUrl(team) ? (
                            <Skeleton className="h-full w-full rounded-full animate-pulse" />
                          ) : (
                            team.name.slice(0, 2).toUpperCase()
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 flex-1">
                        <h3 className="font-semibold text-lg leading-none">{team.name}</h3>
                        {team.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {team.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span>成员数量: {team.member_count}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>创建者: {team.owner?.nickname || team.owner?.username}</span>
                        </div>
                      </div>
                      <div>
                        创建于 {format(new Date(team.created_at), "yyyy-MM-dd")}
                      </div>
                    </div>
                  </CardContent>
                  <CardContent className="pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        if (team.is_joined) {
                          router.push(`/teams/${team.id}`)
                        } else {
                          handleApply(team.id)
                        }
                      }}
                    >
                      {team.is_joined ? "进入团队" : "申请加入"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {teams.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  {debouncedKeyword ? "无搜索结果" : "暂无团队"}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">团队名称</TableHead>
                    <TableHead className="min-w-[100px]">成员数量</TableHead>
                    <TableHead className="min-w-[150px]">创建时间</TableHead>
                    <TableHead className="min-w-[120px]">我的角色</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow
                      key={team.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/teams/${team.id}`)}
                    >
                      <TableCell>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                            <AvatarImage 
                              src={getTeamAvatarUrl(team)} 
                              alt={team.name}
                            />
                            <AvatarFallback>
                              {getTeamAvatarUrl(team) ? (
                                <Skeleton className="h-full w-full rounded-full animate-pulse" />
                              ) : (
                                team.name.slice(0, 2).toUpperCase()
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="font-medium">{team.name}</div>
                            {team.description && (
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                {team.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{team.member_count}</TableCell>
                      <TableCell>
                        {format(new Date(team.created_at), "yyyy-MM-dd HH:mm")}
                      </TableCell>
                      <TableCell>
                        {team.user_role ? (
                          <Badge
                            variant={
                              team.user_role === "owner"
                                ? "default"
                                : team.user_role === "admin"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {team.user_role}
                          </Badge>
                        ) : team.is_joined === false ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApply(team.id)
                            }}
                          >
                            申请加入
                          </Button>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {teams.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        {debouncedKeyword ? (
                          "无搜索结果"
                        ) : (
                          "您还没有加入任何团队"
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <CreateTeamDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onSuccess={() => {
              setShowCreateDialog(false)
              fetchTeams()
            }}
          />

          {applyingTeamId && (
            <TeamApplyDialog
              teamId={applyingTeamId}
              open={showApplyDialog}
              onOpenChange={(open) => {
                setShowApplyDialog(open)
                if (!open) {
                  setApplyingTeamId(null)
                }
              }}
              onSuccess={fetchTeams}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
} 