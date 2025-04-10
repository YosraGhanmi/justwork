import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Navigation from "@/components/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "FeelTrack - Emotional Wellness Companion",
  description: "Track and improve your emotional wellbeing with FeelTrack",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen">
            <div className="flex-1">{children}</div>
            <Navigation />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'