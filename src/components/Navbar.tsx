import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex space-x-4">
        <li><Link href="/" className="hover:underline">首页</Link></li>
        <li><Link href="/problems" className="hover:underline">题目列表</Link></li>
        <li><Link href="/about" className="hover:underline">关于我们</Link></li>
        <li><Link href="/register" className="hover:underline">注册</Link></li>
        <li><Link href="/login" className="hover:underline">登录</Link></li>
      </ul>
    </nav>
  );
} 
