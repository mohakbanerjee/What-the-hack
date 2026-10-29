import type { Metadata } from "next";
import { ToastTool } from "@/components/tools/ToastTool";

export const metadata: Metadata = { title: "Check My Toast" };

export default function Page() {
  return <ToastTool />;
}
