import type { Metadata } from "next";
import { NotHimTool } from "@/components/tools/NotHimTool";

export const metadata: Metadata = { title: "U R NOT HIM" };

export default function Page() {
  return <NotHimTool />;
}
