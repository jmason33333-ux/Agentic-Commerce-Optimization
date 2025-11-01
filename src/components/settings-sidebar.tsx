"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Settings, ShoppingBag, CreditCard, Users, Code } from "lucide-react"

const settingsSections = [
  { name: "General", href: "/settings", icon: Settings },
  { name: "Shopify", href: "/settings/shopify", icon: ShoppingBag },
  { name: "Billing", href: "/settings/billing", icon: CreditCard },
  { name: "Team", href: "/settings/team", icon: Users },
  { name: "API", href: "/settings/api", icon: Code },
]

export function SettingsSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r border-border/40 bg-muted/20 p-6">
      <nav className="space-y-1">
        {settingsSections.map((section) => {
          const Icon = section.icon
          const isActive = pathname === section.href

          return (
            <Link key={section.name} href={section.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 ${isActive ? "bg-background shadow-sm" : ""}`}
              >
                <Icon className="h-4 w-4" />
                {section.name}
              </Button>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
