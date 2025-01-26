'use client'

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { format } from "date-fns"
import { Users, Settings, UserPlus, Trash2, MoreVertical, UserCog, GraduationCap, Plus } from "lucide-react"
import { toast } from "sonner"

import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
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
import {
  getTeamDetail,
  getTeamAvatarUrl,
  deleteTeam,
  removeTeamMember,
  updateTeamMemberRole,
  getTeamMembers,
  updateTeamNickname,
  getAssignmentList,
  type TeamAssignment
} from "@/lib/teamService"
import type { TeamDetail, TeamMember } from "@/lib/teamService"
import { TeamInviteDialog } from "@/components/team/team-invite-dialog"
import { TeamSettingsDialog } from "@/components/team/team-settings-dialog"
import { CreateAssignmentDialog } from "@/components/team/create-assignment-dialog"
import { getApiEndpoint } from '@/config/apiConfig';

export default function TeamDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [team, setTeam] = React.useState<TeamDetail | null>(null)
  const [members, setMembers] = React.useState<TeamMember[]>([])
  const [membersTotal, setMembersTotal] = React.useState(0)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize] = React.useState(10)
  const [loading, setLoading] = React.useState(true)
  const [loadingMembers, setLoadingMembers] = React.useState(false)
  const [showInviteDialog, setShowInviteDialog] = React.useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [showCreateAssignmentDialog, setShowCreateAssignmentDialog] = React.useState(false)
  const [deletingMember, setDeletingMember] = React.useState<{
    id: number;
    displayName: string;
  } | null>(null)
  const [memberAvatars, setMemberAvatars] = React.useState<Record<number, string>>({})
  const [showNicknameDialog, setShowNicknameDialog] = React.useState(false)
  const [nickname, setNickname] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [currentUserNickname, setCurrentUserNickname] = React.useState<string>("")
  const [assignments, setAssignments] = React.useState<TeamAssignment[]>([])
  const [loadingAssignments, setLoadingAssignments] = React.useState(false)

  const fetchTeam = React.useCallback(async () => {
    try {
      setLoading(true)
      const data = await getTeamDetail(Number(params.id))
      setTeam(data)
      
      // 获取当前用户的昵称
      const members = await getTeamMembers(data.id, { page: 1, page_size: 100 })
      const currentUser = members.members.find(member => 
        member.role === data.user_role && 
        (data.user_role === 'owner' ? member.user_id === data.created_by : true)
      )
      if (currentUser) {
        setCurrentUserNickname(currentUser.nickname || "")
      }
    } catch (error) {
      console.error("获取团队详情失败:", error)
      toast.error("获取团队详情失败")
    } finally {
      setLoading(false)
    }
  }, [params.id])

  const fetchMembers = React.useCallback(async () => {
    if (!team) return
    try {
      setLoadingMembers(true)
      const data = await getTeamMembers(team.id, {
        page: currentPage,
        page_size: pageSize
      })
      setMembers(data.members)
      setMembersTotal(data.total)
    } catch (error) {
      console.error("获取团队成员列表失败:", error)
      toast.error("获取团队成员列表失败")
    } finally {
      setLoadingMembers(false)
    }
  }, [team, currentPage, pageSize])

  const fetchMemberAvatars = React.useCallback(async (members: TeamMember[]) => {
    const avatars: Record<number, string> = {}
    members.forEach((member) => {
      if (member.avatar) {
        avatars[member.user_id] = `${getApiEndpoint()}/user/getAvatar?filename=${member.avatar}`
      }
    })
    setMemberAvatars(avatars)
  }, [])

  const fetchAssignments = React.useCallback(async () => {
    if (!team) return
    try {
      setLoadingAssignments(true)
      const data = await getAssignmentList(team.id)
      setAssignments(data)
    } catch (error) {
      console.error("获取作业列表失败:", error)
      toast.error("获取作业列表失败")
    } finally {
      setLoadingAssignments(false)
    }
  }, [team])

  React.useEffect(() => {
    if (members.length > 0) {
      fetchMemberAvatars(members)
    }
  }, [members, fetchMemberAvatars])

  React.useEffect(() => {
    fetchTeam()
  }, [fetchTeam])

  React.useEffect(() => {
    if (team) {
      fetchMembers()
    }
  }, [team, fetchMembers])

  React.useEffect(() => {
    if (team) {
      fetchAssignments()
    }
  }, [team, fetchAssignments])

  const handleDeleteTeam = async () => {
    try {
      await deleteTeam(Number(params.id))
      toast.success("团队已删除")
      router.push('/teams')
    } catch (error) {
      toast.error("解散团队失败")
    }
  }

  const handleRemoveMember = async (userId: number) => {
    try {
      await removeTeamMember(Number(params.id), userId)
      toast.success("成员已移除")
      setDeletingMember(null)
      fetchTeam()
    } catch (error) {
      toast.error("移除成员失败")
    }
  }

  const handleUpdateRole = async (userId: number, newRole: 'admin' | 'member') => {
    try {
      await updateTeamMemberRole(Number(params.id), userId, newRole)
      toast.success("成员角色已更新")
      fetchTeam()
    } catch (error) {
      toast.error("更新成员角色失败")
    }
  }

  const handleUpdateNickname = async () => {
    try {
      setSubmitting(true)
      await updateTeamNickname(Number(params.id), nickname)
      toast.success("团队内昵称已更新")
      setShowNicknameDialog(false)
      setCurrentUserNickname(nickname)
      fetchTeam()
      fetchMembers()
    } catch (error) {
      toast.error("更新团队内昵称失败")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-65px)]">
          <Spinner className="h-8 w-8" />
        </div>
      </>
    )
  }

  if (!team) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-65px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold">团队不存在</h1>
            <p className="text-muted-foreground mt-2">
              该团队可能已被删除或您没有访问权限
            </p>
          </div>
        </div>
      </>
    )
  }

  const isAdmin = team.user_role === "owner" || team.user_role === "admin"
  const isOwner = team.user_role === "owner"

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Avatar className="h-16 w-16 lg:h-20 lg:w-20">
              {loading ? (
                <Skeleton className="h-full w-full rounded-full animate-pulse" />
              ) : (
                <>
                  <AvatarImage 
                    src={team ? getTeamAvatarUrl(team) : undefined} 
                    alt={team?.name} 
                  />
                  <AvatarFallback>
                    {team.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </>
              )}
            </Avatar>
            <div className="space-y-2">
              <h1 className="text-xl lg:text-2xl font-bold">{team.name}</h1>
              {team.description && (
                <p className="text-muted-foreground text-sm lg:text-base">{team.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="text-muted-foreground">
                  创建于 {format(new Date(team.created_at), "yyyy-MM-dd")}
                </div>
                <div className="text-muted-foreground">
                  {team.member_count} 位成员
                </div>
                {team.owner && (
                  <div className="text-muted-foreground flex items-center gap-1">
                    <span>创建者:</span>
                    <span className="font-medium">{team.owner.username}</span>
                    {team.owner.nickname && (
                      <span>({team.owner.nickname})</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setNickname(currentUserNickname)
                setShowNicknameDialog(true)
              }}
              className="w-full sm:w-auto"
            >
              <UserCog className="h-4 w-4 mr-2" />
              修改团队内昵称
            </Button>
            {isAdmin && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowSettingsDialog(true)}
                  className="w-full sm:w-auto"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  团队设置
                </Button>
                <Button 
                  onClick={() => setShowInviteDialog(true)}
                  className="w-full sm:w-auto"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  邀请成员
                </Button>
                {isOwner && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    解散团队
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="members" className="space-y-4">
          <TabsList>
            <TabsTrigger value="members" className="space-x-2">
              <Users className="h-4 w-4" />
              <span>成员列表</span>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="space-x-2">
              <GraduationCap className="h-4 w-4" />
              <span>作业列表</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="members" className="space-y-4">
            <div className="rounded-md border overflow-x-auto">
              <div className="min-w-[800px] p-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="font-medium">成员</th>
                      <th className="font-medium">角色</th>
                      <th className="font-medium">加入时间</th>
                      {isAdmin && <th className="font-medium">操作</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loadingMembers ? (
                      <tr>
                        <td colSpan={isAdmin ? 4 : 3} className="py-8 text-center">
                          <Spinner className="h-8 w-8 mx-auto" />
                        </td>
                      </tr>
                    ) : members.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 4 : 3} className="py-8 text-center text-muted-foreground">
                          暂无成员
                        </td>
                      </tr>
                    ) : (
                      members.map((member) => {
                        const displayName = member.username;
                        const subText = member.nickname;

                        return (
                          <tr key={member.user_id}>
                            <td className="py-3">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                                  {loadingMembers ? (
                                    <Skeleton className="h-full w-full rounded-full animate-pulse" />
                                  ) : (
                                    <>
                                      <AvatarImage 
                                        src={memberAvatars[member.user_id]} 
                                        alt={displayName} 
                                      />
                                      <AvatarFallback>
                                        {displayName.slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </>
                                  )}
                                </Avatar>
                                <div>
                                  <div className="font-medium">{displayName}</div>
                                  {subText && (
                                    <div className="text-sm text-muted-foreground">
                                      {subText}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <Badge
                                variant={
                                  member.role === "owner"
                                    ? "default"
                                    : member.role === "admin"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {member.role}
                              </Badge>
                            </td>
                            <td className="py-3 whitespace-nowrap">
                              {format(new Date(member.joined_at), "yyyy-MM-dd HH:mm")}
                            </td>
                            {isAdmin && (
                              <td className="py-3">
                                {member.role !== "owner" && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {isOwner && member.role === 'admin' && (
                                        <DropdownMenuItem
                                          onClick={() => handleUpdateRole(member.user_id, "member")}
                                        >
                                          降级为普通成员
                                        </DropdownMenuItem>
                                      )}
                                      {isOwner && member.role === 'member' && (
                                        <DropdownMenuItem
                                          onClick={() => handleUpdateRole(member.user_id, "admin")}
                                        >
                                          升级为管理员
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => setDeletingMember({
                                          id: member.user_id,
                                          displayName: member.nickname ? `${member.username} (${member.nickname})` : member.username
                                        })}
                                      >
                                        移除成员
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </td>
                            )}
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
                {membersTotal > pageSize && (
                  <div className="mt-4 flex justify-center">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || loadingMembers}
                      >
                        上一页
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        第 {currentPage} 页，共 {Math.ceil(membersTotal / pageSize)} 页
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => p + 1)}
                        disabled={currentPage >= Math.ceil(membersTotal / pageSize) || loadingMembers}
                      >
                        下一页
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="assignments" className="space-y-4">
            {isAdmin && (
              <div className="flex justify-end">
                <Button
                  onClick={() => setShowCreateAssignmentDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  创建作业
                </Button>
              </div>
            )}
            <div className="rounded-md border">
              <div className="p-4">
                {loadingAssignments ? (
                  <div className="py-8 text-center">
                    <Spinner className="h-8 w-8 mx-auto" />
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    暂无作业
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border gap-4"
                      >
                        <div className="space-y-1">
                          <h3 className="font-medium">{assignment.title}</h3>
                          {assignment.description && (
                            <p className="text-sm text-muted-foreground">
                              {assignment.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div>
                              开始时间：{format(new Date(assignment.start_time), "yyyy-MM-dd HH:mm")}
                            </div>
                            <div>
                              截止时间：{format(new Date(assignment.end_time), "yyyy-MM-dd HH:mm")}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/teams/${team?.id}/assignments/${assignment.id}`)}
                        >
                          查看详情
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {showInviteDialog && (
          <TeamInviteDialog
            teamId={team.id}
            open={showInviteDialog}
            onOpenChange={setShowInviteDialog}
          />
        )}

        {showSettingsDialog && (
          <TeamSettingsDialog
            team={team}
            open={showSettingsDialog}
            onOpenChange={setShowSettingsDialog}
            onSuccess={fetchTeam}
          />
        )}

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确定要解散团队吗？</DialogTitle>
              <DialogDescription>
                此操作不可撤销。解散团队后，所有成员将被移除，团队的所有数据将被永久删除。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteTeam}
              >
                解散团队
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog 
          open={!!deletingMember} 
          onOpenChange={() => setDeletingMember(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确定要移除该成员吗？</DialogTitle>
              <DialogDescription>
                {deletingMember && `确定要将 ${deletingMember.displayName} 从团队中移除吗？此操作不可撤销。`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeletingMember(null)}
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={() => deletingMember && handleRemoveMember(deletingMember.id)}
              >
                移除成员
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showNicknameDialog} onOpenChange={setShowNicknameDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>修改团队内昵称</DialogTitle>
              <DialogDescription>
                设置您在团队内显示的昵称，留空则使用默认用户名
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  id="nickname"
                  placeholder="请输入昵称"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowNicknameDialog(false)}
                disabled={submitting}
              >
                取消
              </Button>
              <Button
                onClick={handleUpdateNickname}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    保存中
                  </>
                ) : (
                  "保存"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {showCreateAssignmentDialog && team && (
          <CreateAssignmentDialog
            teamId={team.id}
            open={showCreateAssignmentDialog}
            onOpenChange={setShowCreateAssignmentDialog}
            onSuccess={fetchAssignments}
          />
        )}
      </div>
    </>
  )
} 