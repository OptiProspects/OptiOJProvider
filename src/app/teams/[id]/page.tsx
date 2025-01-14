'use client'

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { format } from "date-fns"
import { Users, Settings, UserPlus, Trash2, MoreVertical } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "@/lib/teamService"
import type { TeamDetail, TeamMember } from "@/lib/teamService"
import { TeamInviteDialog } from "@/components/team/team-invite-dialog"
import { TeamSettingsDialog } from "@/components/team/team-settings-dialog"
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
  const [deletingMember, setDeletingMember] = React.useState<{
    id: number;
    displayName: string;
  } | null>(null)
  const [memberAvatars, setMemberAvatars] = React.useState<Record<number, string>>({})

  const fetchTeam = React.useCallback(async () => {
    try {
      setLoading(true)
      const data = await getTeamDetail(Number(params.id))
      setTeam(data)
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

  const handleDeleteTeam = async () => {
    try {
      await deleteTeam(Number(params.id))
      toast.success("团队已删除")
      router.push('/teams')
    } catch (error) {
      toast.error("删除团队失败")
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">团队不存在</h1>
          <p className="text-muted-foreground mt-2">
            该团队可能已被删除或您没有访问权限
          </p>
        </div>
      </div>
    )
  }

  const isAdmin = team.user_role === "owner" || team.user_role === "admin"
  const isOwner = team.user_role === "owner"

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <Avatar className="h-20 w-20">
            {loading ? (
              <Skeleton className="h-20 w-20 rounded-full animate-pulse" />
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
          <div>
            <h1 className="text-2xl font-bold">{team.name}</h1>
            {team.description && (
              <p className="text-muted-foreground mt-1">{team.description}</p>
            )}
            <div className="flex items-center space-x-4 mt-2">
              <div className="text-sm text-muted-foreground">
                创建于 {format(new Date(team.created_at), "yyyy-MM-dd")}
              </div>
              <div className="text-sm text-muted-foreground">
                {team.member_count} 位成员
              </div>
              {team.owner && (
                <div className="text-sm text-muted-foreground flex items-center space-x-1">
                  <span>创建者:</span>
                  <span className="font-medium">{team.owner.username}</span>
                  {team.owner.real_name && (
                    <span>({team.owner.real_name})</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isAdmin && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowSettingsDialog(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                团队设置
              </Button>
              <Button onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                邀请成员
              </Button>
              {isOwner && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除团队
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
        </TabsList>
        <TabsContent value="members" className="space-y-4">
          <div className="rounded-md border">
            <div className="p-4">
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
                      const subText = member.real_name;

                      return (
                        <tr key={member.user_id}>
                          <td className="py-3">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                {loadingMembers ? (
                                  <Skeleton className="h-10 w-10 rounded-full animate-pulse" />
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
                          <td className="py-3">
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
                                        displayName: member.real_name ? `${member.username} (${member.real_name})` : member.username
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
            <DialogTitle>确定要删除团队吗？</DialogTitle>
            <DialogDescription>
              此操作不可撤销。删除团队后，所有成员将被移除，团队的所有数据将被永久删除。
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
              删除团队
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
    </div>
  )
} 