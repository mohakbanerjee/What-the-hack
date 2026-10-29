import type { Metadata } from "next";
import { OverthinkTool } from "@/components/tools/OverthinkTool";

export const metadata: Metadata = { title: "Overthink Meter" };

export default function Page() {
  return <OverthinkTool />;
}
