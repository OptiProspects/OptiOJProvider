import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import ProblemList from "@/components/ProblemList";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-8">
        <div className="flex space-x-4">
          <div className="flex-1">
            <ProblemList />
          </div>
          <Card className="flex-none h-full">
            <ShadcnCalendar />
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
