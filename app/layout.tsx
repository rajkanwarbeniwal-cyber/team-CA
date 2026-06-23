import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Suspense } from "react"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Taksha — Smart Mock Test Platform",
  description:
    "Prepare for UPSC, SSC, Banking and state exams with timed mock tests, instant analytics, leaderboards and detailed answer explanations.",
  icons: {
    icon: "/taksha-icon.png",
    apple: "/taksha-icon.png",
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfcfe" },
    { media: "(prefers-color-scheme: dark)", color: "#171b26" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="bg-background font-sans antialiased">
        <Suspense fallback={null}>
          <Providers>{children}</Providers>
        </Suspense>
        <Toaster richColors position="top-center" />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
