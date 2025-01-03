import * as React from "react"
import { format } from "date-fns"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { getMessageList, type Message, type MessageType } from "@/lib/messageService"
import { handleTeamApply } from "@/lib/teamService"
import { markMessageAsRead, markAllMessagesAsRead, deleteMessage } from "@/lib/messageActionService"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Check, Trash2, Eye, CircleCheck, CircleX } from "lucide-react"

interface MessageListProps {
  defaultType?: keyof MessageType
}

export function MessageList({ defaultType }: MessageListProps) {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [loading, setLoading] = React.useState(true)
  const [currentType, setCurrentType] = React.useState<keyof MessageType | undefined>(defaultType)
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(10)
  const [total, setTotal] = React.useState(0)
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [actionDialogOpen, setActionDialogOpen] = React.useState(false)
  const [selectedAction, setSelectedAction] = React.useState<{
    messageId: number;
    action: string;
    name: string;
    needReason: boolean;
  } | null>(null)
  const [actionReason, setActionReason] = React.useState("")

  // 获取操作对应的图标
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'mark_read':
        return <Eye className="h-4 w-4" />
      case 'approve':
        return <CircleCheck className="h-4 w-4" />
      case 'reject':
        return <CircleX className="h-4 w-4" />
      case 'delete':
        return <Trash2 className="h-4 w-4" />
      default:
        return <Check className="h-4 w-4" />
    }
  }

  // 获取操作对应的颜色
  const getActionColor = (type: 'default' | 'primary' | 'danger') => {
    switch (type) {
      case 'primary':
        return 'text-primary hover:text-primary/80'
      case 'danger':
        return 'text-destructive hover:text-destructive/80'
      default:
        return 'text-muted-foreground hover:text-foreground'
    }
  }

  const fetchMessages = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await getMessageList({
        page,
        page_size: pageSize,
        type: currentType,
      })
      setMessages(response.messages)
      setTotal(response.total)
      setUnreadCount(response.unread_count)
    } catch (error) {
      toast.error('获取消息列表失败')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, currentType])

  React.useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const handleAction = async (messageId: number, action: string, name: string, needReason: boolean) => {
    if (needReason) {
      setSelectedAction({
        messageId,
        action,
        name,
        needReason
      })
      setActionDialogOpen(true)
    } else {
      await performAction(messageId, action)
    }
  }

  const performAction = async (messageId: number, action: string, reason?: string) => {
    try {
      const message = messages.find(msg => msg.id === messageId);
      if (!message) return;
      
      switch (action) {
        case 'mark_read':
          await markMessageAsRead(messageId);
          setMessages(messages.map(msg =>
            msg.id === messageId ? { 
              ...msg, 
              is_read: true,
              read_at: new Date().toISOString(),
              actions: msg.actions?.filter(a => a.action !== 'mark_read')
            } : msg
          ));
          setUnreadCount(prev => Math.max(0, prev - 1));
          break;

        case 'delete':
          await deleteMessage(messageId);
          setMessages(messages.filter(msg => msg.id !== messageId));
          setTotal(prev => Math.max(0, prev - 1));
          if (!message.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
          break;

        case 'approve':
        case 'reject':
          if (message?.type === 'team_application' && message.application_id) {
            await handleTeamApply({
              application_id: message.application_id,
              status: action === 'approve' ? 'approved' : 'rejected',
              message: reason || ''
            });
            // 更新消息状态：标记为已处理，移除操作按钮
            setMessages(messages.map(msg =>
              msg.id === messageId ? {
                ...msg,
                is_processed: true,
                actions: msg.actions?.filter(a => a.action === 'delete'),
                is_read: true,
                read_at: new Date().toISOString()
              } : msg
            ));
            if (!message.is_read) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          }
          break;
      }
      
      toast.success('操作成功');
      setActionDialogOpen(false);
      setActionReason("");
    } catch (error) {
      toast.error('操作失败');
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllMessagesAsRead();
      setMessages(messages.map(msg => ({ ...msg, is_read: true })));
      setUnreadCount(0);
      toast.success('已全部标记为已读');
    } catch (error) {
      toast.error('标记全部已读失败');
    }
  }

  const messageTypes: { value: keyof MessageType; label: string }[] = [
    { value: 'system', label: '系统消息' },
    { value: 'team_application', label: '团队申请' },
    { value: 'team_invitation', label: '团队邀请' },
    { value: 'team_notice', label: '团队通知' },
  ]

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>消息中心</CardTitle>
          <CardDescription>
            您有 {unreadCount} 条未读消息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={currentType || 'all'} onValueChange={(value) => {
            setCurrentType(value === 'all' ? undefined : value as keyof MessageType)
            setPage(1)
          }}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="all">全部</TabsTrigger>
                {messageTypes.map(type => (
                  <TabsTrigger key={type.value} value={type.value}>
                    {type.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button variant="outline" onClick={handleMarkAllAsRead}>
                全部标为已读
              </Button>
            </div>

            <TabsContent value="all">
              {renderMessageList()}
            </TabsContent>
            {messageTypes.map(type => (
              <TabsContent key={type.value} value={type.value}>
                {renderMessageList()}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAction?.name}</DialogTitle>
            <DialogDescription>
              请输入{selectedAction?.name}的原因
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            placeholder="请输入原因..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setActionDialogOpen(false)
              setActionReason("")
            }}>
              取消
            </Button>
            <Button
              variant={selectedAction?.action === 'reject' ? 'destructive' : 'default'}
              onClick={() => {
                if (selectedAction) {
                  performAction(selectedAction.messageId, selectedAction.action, actionReason)
                }
              }}
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )

  function renderMessageList() {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Spinner className="h-8 w-8" />
        </div>
      )
    }

    if (messages.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          暂无消息
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-lg border ${
              message.is_read ? 'bg-background' : 'bg-accent'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{message.title}</h4>
                  {message.type === 'team_application' && message.is_processed && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      message.actions ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {message.actions ? '待处理' : '已处理'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                  {message.content}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>创建于 {format(new Date(message.created_at), 'yyyy-MM-dd HH:mm')}</span>
                  {message.read_at && (
                    <span>已读于 {format(new Date(message.read_at), 'yyyy-MM-dd HH:mm')}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <TooltipProvider>
                  {message.actions?.map((action) => (
                    <Tooltip key={action.action}>
                      <TooltipTrigger asChild>
                        <button
                          className={`p-2 rounded-full hover:bg-accent transition-colors ${
                            getActionColor(action.type)
                          } ${
                            message.is_processed && action.action !== 'delete'
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                          onClick={() => {
                            if (!message.is_processed || action.action === 'delete') {
                              handleAction(message.id, action.action, action.name, action.need_reason)
                            }
                          }}
                          disabled={message.is_processed && action.action !== 'delete'}
                        >
                          {getActionIcon(action.action)}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{action.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
}
