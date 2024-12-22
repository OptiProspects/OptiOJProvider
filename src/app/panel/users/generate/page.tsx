'use client'

import { useState } from "react";
import apiClient from "@/config/apiConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";

interface GeneratedUser {
  username: string;
  password: string;
  email: string;
}

interface GenerateResponse {
  code: number;
  data: {
    users: GeneratedUser[];
    total: number;
  };
  message: string;
}

const GenerateResultDialog = ({ 
  isOpen, 
  setIsOpen, 
  users 
}: { 
  isOpen: boolean; 
  setIsOpen: (open: boolean) => void; 
  users: GeneratedUser[] 
}) => {
  const handleDownload = () => {
    // 格式化用户信息
    const content = users.map(user => 
      `用户名：${user.username}\n密码：${user.password}\n邮箱：${user.email}\n`
    ).join('\n');

    // 创建 Blob 对象
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `generated_users_${new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')}.txt`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>生成结果 - 共 {users.length} 个用户</DialogTitle>
            <Button 
              variant="outline" 
              onClick={handleDownload}
              size="icon"
              className="h-7 w-7"
            >
              <Download className="h-4 w-4" />
              <span className="sr-only">下载用户信息</span>
            </Button>
          </div>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户名</TableHead>
              <TableHead>密码</TableHead>
              <TableHead>邮箱</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={index}>
                <TableCell>{user.username}</TableCell>
                <TableCell className="font-mono">{user.password}</TableCell>
                <TableCell>{user.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

const GenerateUsersForm = () => {
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [count, setCount] = useState<string>("");
  const [domain, setDomain] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [generatedUsers, setGeneratedUsers] = useState<GeneratedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!prefix.trim()) {
      toast.error("请填写必填项", {
        description: "用户名前缀不能为空",
      });
      return false;
    }
    
    if (!count) {
      toast.error("请填写必填项", {
        description: "生成数量不能为空",
      });
      return false;
    }
    
    const countNum = parseInt(count);
    if (isNaN(countNum) || countNum <= 0 || countNum > 1000) {
      toast.error("数值无效", {
        description: "生成数量必须在 1-1000 之间",
      });
      return false;
    }
    
    if (!domain.trim()) {
      toast.error("请填写必填项", {
        description: "邮箱域名不能为空",
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiClient.post<GenerateResponse>("/admin/users/generate", {
        prefix,
        suffix,
        count: parseInt(count),
        domain,
      });
      
      toast.success("用户生成成功", {
        description: `成功生成 ${response.data.data.total} 个用户`,
      });

      setGeneratedUsers(response.data.data.users);
      setIsDialogOpen(true);

      setPrefix("");
      setSuffix("");
      setCount("");
      setDomain("");
      
    } catch (error: any) {
      toast.error("生成用户失败", {
        description: error.response?.data?.message || "请稍后重试",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">批量生成用户</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="用户名前缀"
              />
              <Input
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                placeholder="用户名后缀（可选）"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                placeholder="生成数量"
              />
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="邮箱域名"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? <Spinner className="h-4 w-4" /> : "生成用户"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <GenerateResultDialog 
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        users={generatedUsers}
      />
    </>
  );
};

export default function UsersGeneratePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <GenerateUsersForm />
    </div>
  );
}
