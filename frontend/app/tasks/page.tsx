import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TaskDashboard from "@/components/tasks/TaskDashboard";

export const metadata: Metadata = {
  title: "My Tasks | Tax Help",
  description: "Review and manage your saved tax topic tasks.",
  robots: { index: false, follow: false },
};

export default function TasksPage() {
  return <>
    <Navbar />
    <main id="main-content" className="min-h-[70vh] bg-cream-100">
      <section className="container-max section-pad py-12 sm:py-16">
        <TaskDashboard />
      </section>
    </main>
    <Footer />
  </>;
}
