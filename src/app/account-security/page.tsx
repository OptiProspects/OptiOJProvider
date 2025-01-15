'use client'

import { useEffect, useState } from 'react';
import { fetchActiveSessions, logoutAllDevices, revokeSession } from '@/lib/sessionService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Smartphone, 
  Globe, 
  Clock,
  Calendar,
  Chrome,
  Tablet,
  Computer,
  Info,
  MonitorSmartphone,
  LogOut,
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { UAParser } from 'ua-parser-js';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';

interface DeviceInfo {
  user_agent: string;
  ip: string;
  last_active: string;
  last_refresh: string;
}

interface SessionInfo {
  session_id: string;
  device_info: DeviceInfo;
  created_at: string;
}

function SessionCard({ session, onRevoke, isCurrentSession }: { 
  session: SessionInfo; 
  onRevoke: (sessionId: string) => Promise<void>;
  isCurrentSession: boolean;
}) {
  const { browser, device, os } = new UAParser(session.device_info.user_agent).getResult();
  const [revoking, setRevoking] = useState(false);

  const getDeviceIcon = () => {
    if (device.type === 'mobile') {
      return <Smartphone className="h-5 w-5" />;
    }
    if (device.type === 'tablet') {
      return <Tablet className="h-5 w-5" />;
    }
    return <Computer className="h-5 w-5" />;
  };

  const getBrowserIcon = () => {
    if (browser.name?.toLowerCase().includes('chrome')) {
      return <Chrome className="h-4 w-4" />;
    }
    if (browser.name?.toLowerCase().includes('mobile')) {
      return <MonitorSmartphone className="h-4 w-4" />;
    }
    return <Globe className="h-4 w-4" />;
  };

  const getDeviceName = () => {
    if (device.vendor && device.model) {
      return `${device.vendor} ${device.model}`;
    }
    if (device.type) {
      const typeMap: Record<string, string> = {
        mobile: '移动',
        tablet: '平板',
        smarttv: '智能电视',
        console: '游戏主机',
        embedded: '嵌入式设备',
        wearable: '可穿戴设备',
      };
      return `${typeMap[device.type] || '未知'} 设备`;
    }
    return '桌面设备';
  };

  const handleRevoke = async () => {
    if (revoking) return;
    setRevoking(true);
    try {
      await onRevoke(session.session_id);
      toast.success('成功退出设备');
    } catch (error) {
      toast.error('退出设备失败');
    } finally {
      setRevoking(false);
    }
  };

  return (
    <Card className={isCurrentSession ? 'border-primary' : undefined}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getDeviceIcon()}
            <div>
              <CardTitle className="text-lg">{getDeviceName()}</CardTitle>
              <CardDescription>
                {os.name} {os.version}
              </CardDescription>
            </div>
          </div>
          {isCurrentSession && (
            <span className="text-xs text-primary font-medium px-2 py-1 bg-primary/10 rounded-full">
              当前设备
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Globe className="h-4 w-4" />
          <span>{session.device_info.ip}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          {getBrowserIcon()}
          <span>{browser.name} {browser.version}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>登录时间: {format(new Date(session.created_at), 'yyyy年MM月dd日 HH:mm:ss', { locale: zhCN })}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>最后活跃: {format(new Date(session.device_info.last_active), 'yyyy年MM月dd日 HH:mm:ss', { locale: zhCN })}</span>
        </div>
        <div className="flex items-start space-x-2 text-xs text-muted-foreground mt-2 pt-2 border-t">
          <Info className="h-4 w-4 flex-shrink-0" />
          <span className="break-all line-clamp-2 hover:line-clamp-none transition-all duration-200">{session.device_info.user_agent}</span>
        </div>
      </CardContent>
      <CardFooter className="mt-auto pt-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant={isCurrentSession ? "outline" : "destructive"} 
              className="w-full"
              disabled={revoking}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {revoking ? '退出中...' : isCurrentSession ? '退出此设备' : '退出设备'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认退出设备？</AlertDialogTitle>
              <AlertDialogDescription>
                此操作将终止该设备的登录状态，需要重新登录才能继续使用。
                {isCurrentSession && ' 这是您当前正在使用的设备，退出后将返回登录页面。'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleRevoke}>确认退出</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}

function SessionList({ sessions, onRevoke, currentSessionId }: { 
  sessions: SessionInfo[]; 
  onRevoke: (sessionId: string) => Promise<void>;
  currentSessionId: string;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sessions.map((session) => (
        <SessionCard 
          key={session.session_id || Math.random()} 
          session={session} 
          onRevoke={onRevoke}
          isCurrentSession={session.session_id === currentSessionId}
        />
      ))}
    </div>
  );
}

export default function AccountSecurity() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const sessionsData = await fetchActiveSessions();
      setSessions(sessionsData);
      // 获取当前会话ID
      const currentSession = sessionsData.find(session => 
        session.device_info.user_agent === navigator.userAgent
      );
      if (currentSession) {
        setCurrentSessionId(currentSession.session_id);
      }
    } catch (error) {
      console.error('获取活跃会话失败:', error);
      toast.error('获取会话信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (sessionId: string) => {
    try {
      await revokeSession(sessionId);
      if (sessionId === currentSessionId) {
        router.push('/login');
      } else {
        loadSessions();
      }
    } catch (error) {
      throw error;
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAllDevices();
      router.push('/login');
    } catch (error) {
      toast.error('退出所有设备失败');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">账号安全</h1>
          <p className="text-muted-foreground">
            查看并管理您的所有登录设备，保护账号安全
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="bg-orange-50 hover:bg-orange-100 border-orange-200">
              <LogOut className="mr-2 h-4 w-4 text-orange-600" />
              <span className="text-orange-600">退出所有设备</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认退出所有设备？</AlertDialogTitle>
              <AlertDialogDescription>
                此操作将终止所有设备的登录状态，包括当前设备。所有设备需要重新登录才能继续使用。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleLogoutAll}
                className="bg-orange-600 hover:bg-orange-700"
              >
                确认退出
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Spinner className="h-8 w-8" />
        </div>
      ) : sessions.length > 0 ? (
        <SessionList 
          sessions={sessions} 
          onRevoke={handleRevoke}
          currentSessionId={currentSessionId}
        />
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-6">
            <p className="text-muted-foreground">暂无活跃会话</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
