import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "PyroShield Geo-Sensors", template: "%s · PyroShield" },
  description:
    "Self-powered, biodegradable soil sensor nodes that detect subterranean smoldering hours before wildfires break through the canopy.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <SiteNav />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
