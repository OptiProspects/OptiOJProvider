import { Github } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer className="border-t bg-secondary/20 mt-auto">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 左侧内容 */}
          <div className="flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">OptiOJ</h3>
              <p className="text-sm text-muted-foreground">
                我也不知道该写什么
              </p>
            </div>
            
            <nav className="flex flex-wrap gap-6 text-sm text-muted-foreground mt-4">
              <Link href="/about" className="hover:underline">
                关于我们
              </Link>
              <Link href="/terms" className="hover:underline">
                使用条款
              </Link>
              <Link href="/privacy" className="hover:underline">
                隐私政策
              </Link>
              <Link href="/contact" className="hover:underline">
                联系我们
              </Link>
            </nav>
          </div>

          {/* 右侧内容 */}
          <div className="flex flex-col items-end justify-between space-y-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="https://github.com/opti-oj" target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5" />
              </Link>
            </Button>

            <div className="text-sm text-muted-foreground text-right">
              <p>Copyright © {new Date().getFullYear()} OptiProspects. All Rights Reserved.</p>
              <p>上海天色初晓教育科技有限公司 版权所有</p>
              <p className="text-xs mt-2">
                <Link href="https://beian.miit.gov.cn/#/Integrated/index" className="hover:underline">
                  沪ICP备2024100181号-1
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
