"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageCircle, BarChart2, Bell, Flower,Book } from "lucide-react"

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/chat", icon: MessageCircle, label: "Chat" },
    { href: "/check-in", icon: BarChart2, label: "Check-in" },
    { href: "/notifications", icon: Bell, label: "Reminders" },
    { href: "/garden", icon: Flower, label: "Garden" },
    { href: "/stories", icon: Book, label: "Stories" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg py-2 px-4">
      <nav className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive ? "text-rose-500" : "text-slate-500 hover:text-rose-400"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
