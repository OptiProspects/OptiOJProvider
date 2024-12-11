import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Calendar from "@/components/Calendar";
import Announcement from "@/components/Announcement";
import Carousel from "@/components/Carousel";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-8">
        <h1 className="text-3xl font-bold">欢迎来到在线评测系统</h1>
        <p className="text-lg">这是一个用于编程练习和评测的平台。</p>
        
        <Announcement message="新公告：请查看最新的编程题目！" />
        
        <Calendar />
        
        <Carousel />
      </main>
      <Footer />
    </div>
  );
}
