"use client"

import { Search, Filter, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ProductsFilters() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" placeholder="Search products by name, SKU..." className="pl-10 bg-white border-border" />
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuItem>All Products</DropdownMenuItem>
            <DropdownMenuItem>Ready</DropdownMenuItem>
            <DropdownMenuItem>Pending</DropdownMenuItem>
            <DropdownMenuItem>Missing Data</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter by Stock</DropdownMenuLabel>
            <DropdownMenuItem>In Stock</DropdownMenuItem>
            <DropdownMenuItem>Low Stock</DropdownMenuItem>
            <DropdownMenuItem>Out of Stock</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter by Compliance</DropdownMenuLabel>
            <DropdownMenuItem>High (8-10)</DropdownMenuItem>
            <DropdownMenuItem>Medium (5-7)</DropdownMenuItem>
            <DropdownMenuItem>Low (1-4)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <ArrowUpDown className="h-4 w-4" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuItem>Compliance (High to Low)</DropdownMenuItem>
            <DropdownMenuItem>Compliance (Low to High)</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Name (A to Z)</DropdownMenuItem>
            <DropdownMenuItem>Name (Z to A)</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Price (High to Low)</DropdownMenuItem>
            <DropdownMenuItem>Price (Low to High)</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Stock Level</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
