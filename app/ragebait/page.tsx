import type { Metadata } from "next";
import { RagebaitTool } from "@/components/tools/RagebaitTool";

export const metadata: Metadata = { title: "Ragebait Engine" };

export default function Page() {
  return <RagebaitTool />;
}
