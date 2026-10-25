import type { Metadata } from "next";
import HealthDashboard from "@/components/health/HealthDashboard";

export const metadata: Metadata = {
  title: "Service Health | Tax Help",
  robots: { index: false, follow: false },
};

export default function HealthPage() {
  return <HealthDashboard />;
}
