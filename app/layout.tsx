import type { Metadata, Viewport } from "next";
import { Outfit, Syne } from "next/font/google";
import { Shell } from "@/components/Shell";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: {
    default: "ConfidentlyWrong.ai",
    template: "%s · ConfidentlyWrong.ai",
  },
  description:
    "Sir Brainless, the AI therapist for life's 4 biggest problems. 100% confident. 0% qualified.",
};

export const viewport: Viewport = {
  themeColor: "#07060f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${syne.variable} h-full antialiased`}>
      <body className="min-h-full font-sans text-white">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
