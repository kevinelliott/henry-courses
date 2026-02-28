import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Henry Courses — Sell Courses, Keep Your Revenue",
  description: "The affordable alternative to Teachable and Thinkific. Sell courses at $9/mo flat.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
