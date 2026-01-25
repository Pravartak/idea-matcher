import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/react"
import "./globals.css"
import { JetBrains_Mono } from "next/font/google"
import { Suspense } from "react"

const jetBrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Idea Matcher",
  description: "Find developers who share your vision.",
  generator: "v0.app",
  other: {
    "google-adsense-account": "ca-pub-6553407246371441",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${jetBrains.variable} ${GeistSans.variable} ${GeistMono.variable} dark antialiased`}>
      <body className="font-sans">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
