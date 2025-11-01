import { Search, Bell, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-[1920px] mx-auto flex h-16 items-center justify-between px-8">
        <div className="flex items-center gap-8">
          <Link href="/">
            <svg
              width="260"
              height="54"
              viewBox="0 0 260 54"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-9 w-auto cursor-pointer"
            >
              <rect x="14" y="10" width="28" height="34" rx="6" stroke="#0F172A" strokeWidth="2" />
              <rect x="22" y="18" width="12" height="3" rx="1.5" fill="#8B5CF6" />
              <rect x="22" y="25" width="16" height="3" rx="1.5" fill="#8B5CF6" opacity="0.85" />
              <rect x="22" y="32" width="10" height="3" rx="1.5" fill="#8B5CF6" opacity="0.7" />
              <text
                x="56"
                y="24"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                fontSize="15"
                fontWeight="700"
                fill="#0F172A"
              >
                Agent-Ready Catalog
              </text>
              <text
                x="56"
                y="40"
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                fontSize="11"
                fill="#94A3B8"
              >
                by Nobo Studio
              </text>
            </svg>
          </Link>

          <nav className="flex items-center gap-1">
            <Link href="/">
              <Button variant="ghost" className="text-sm font-medium">
                Dashboard
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="ghost" className="text-sm font-medium">
                Products
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="ghost" className="text-sm font-medium">
                Demo
              </Button>
            </Link>
            <Link href="/approvals">
              <Button variant="ghost" className="text-sm font-medium">
                Approvals
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="ghost" className="text-sm font-medium">
                Analytics
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" className="text-sm font-medium">
                Settings
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-center px-12">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products, insights..."
              className="w-full pl-10 bg-muted/50 border-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-foreground" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Nobo Studio" />
                  <AvatarFallback className="bg-[#8B5CF6] text-white font-semibold">NS</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Nobo Studio</p>
                  <p className="text-xs leading-none text-muted-foreground">team@nobo.studio</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
