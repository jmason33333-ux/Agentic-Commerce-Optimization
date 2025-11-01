import Link from "next/link"
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
import { ArrowLeft, User, Settings, LogOut, ExternalLink } from "lucide-react"

interface ProductDetailHeaderProps {
  productName: string
  productId: string
}

export function ProductDetailHeader({ productName, productId }: ProductDetailHeaderProps) {
  return (
    <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Back button and product name */}
          <div className="flex items-center gap-6">
            <Link href="/products">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Products
              </Button>
            </Link>
            <div className="h-6 w-px bg-border/50" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Product Details</p>
              <h1 className="text-lg font-semibold text-foreground tracking-tight">{productName}</h1>
            </div>
          </div>

          {/* Right: Actions and user menu */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <ExternalLink className="h-4 w-4" />
              View in Store
            </Button>

            <div className="h-6 w-px bg-border/50" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" alt="User" />
                    <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-medium">NS</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Nobo Studio</p>
                    <p className="text-xs text-muted-foreground">studio@nobo.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
