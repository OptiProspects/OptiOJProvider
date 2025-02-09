import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 检查是否是管理员路由
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('access_token')?.value
    
    // 如果没有token，重定向到登录页
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      // 这里可以解析token检查用户角色
      // 为了简单演示，这里假设token中包含了role信息
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.role !== 'admin' && payload.role !== 'super_admin') {
        // 如果不是管理员，重定向到首页
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch {
      // token解析失败，重定向到登录页
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
} 