import type { Metadata } from "next";
import { OpsConsole } from "@/components/dashboard/ops-console";

export const metadata: Metadata = { title: "Operations" };

export default function DashboardPage() {
  return <OpsConsole />;
}
