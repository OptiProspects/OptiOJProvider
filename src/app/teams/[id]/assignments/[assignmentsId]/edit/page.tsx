'use client'

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { getAssignmentDetail, getTeamDetail } from "@/lib/teamService"
import type { TeamAssignment, TeamDetail } from "@/lib/teamService"
import { AssignmentEditForm } from "@/components/team/assignment-edit-form"
import Navbar from "@/components/Navbar"

export default function AssignmentEditPage() {
  const router = useRouter()
  const params = useParams()
  const [assignment, setAssignment] = React.useState<TeamAssignment | null>(null)
  const [team, setTeam] = React.useState<TeamDetail | null>(null)
  const [loading, setLoading] = React.useState(true)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      const [assignmentData, teamData] = await Promise.all([
        getAssignmentDetail(Number(params.assignmentsId)),
        getTeamDetail(Number(params.id))
      ])
      setAssignment(assignmentData)
      setTeam(teamData)
    } catch (error) {
      console.error("获取作业详情失败:", error)
      toast.error("获取作业详情失败")
    } finally {
      setLoading(false)
    }
  }, [params.assignmentsId, params.id])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

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

  if (!assignment || !team) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-65px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold">作业不存在</h1>
            <p className="text-muted-foreground mt-2">
              该作业可能已被删除或您没有访问权限
            </p>
          </div>
        </div>
      </>
    )
  }

  const isAdmin = team.user_role === "owner" || team.user_role === "admin"
  if (!isAdmin) {
    router.push(`/teams/${params.id}/assignments/${params.assignmentsId}`)
    return null
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-7xl">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/teams/${params.id}/assignments/${params.assignmentsId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">编辑作业</h1>
            <p className="text-muted-foreground mt-1">{team.name}</p>
          </div>
        </div>

        <AssignmentEditForm
          teamId={team.id}
          assignment={assignment}
          onSuccess={() => router.push(`/teams/${params.id}/assignments/${params.assignmentsId}`)}
          onCancel={() => router.push(`/teams/${params.id}/assignments/${params.assignmentsId}`)}
        />
      </div>
    </>
  )
} 