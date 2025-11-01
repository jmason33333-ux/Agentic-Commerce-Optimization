"use client"

import { useState } from "react"
import { Eye, Sparkles, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ComplianceIndicator } from "./compliance-indicator"
import { ProductStatusBadge } from "./product-status-badge"

interface Product {
  id: string
  name: string
  sku: string
  price: number
  stock: "In Stock" | "Low Stock" | "Out of Stock"
  complianceLevel: number
  status: "ready" | "pending" | "missing"
  pendingCount?: number
  missingCount?: number
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    sku: "WH-1000XM5",
    price: 399.99,
    stock: "In Stock",
    complianceLevel: 9,
    status: "ready",
  },
  {
    id: "2",
    name: "Smart Watch Series 8",
    sku: "SW-S8-BLK",
    price: 499.99,
    stock: "In Stock",
    complianceLevel: 7,
    status: "pending",
    pendingCount: 2,
  },
  {
    id: "3",
    name: "Ergonomic Office Chair",
    sku: "EOC-PRO-GRY",
    price: 649.99,
    stock: "Low Stock",
    complianceLevel: 4,
    status: "missing",
    missingCount: 3,
  },
  {
    id: "4",
    name: "4K Webcam Pro",
    sku: "WC-4K-PRO",
    price: 199.99,
    stock: "In Stock",
    complianceLevel: 10,
    status: "ready",
  },
  {
    id: "5",
    name: "Mechanical Keyboard RGB",
    sku: "KB-MECH-RGB",
    price: 159.99,
    stock: "In Stock",
    complianceLevel: 8,
    status: "ready",
  },
  {
    id: "6",
    name: "USB-C Docking Station",
    sku: "DS-USBC-12",
    price: 249.99,
    stock: "Out of Stock",
    complianceLevel: 3,
    status: "missing",
    missingCount: 1,
  },
  {
    id: "7",
    name: "Portable SSD 2TB",
    sku: "SSD-2TB-BLK",
    price: 299.99,
    stock: "In Stock",
    complianceLevel: 9,
    status: "ready",
  },
  {
    id: "8",
    name: "Wireless Mouse Pro",
    sku: "MS-WL-PRO",
    price: 89.99,
    stock: "Low Stock",
    complianceLevel: 5,
    status: "pending",
    pendingCount: 3,
  },
]

export function ProductsTable() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    setSelectedProducts((prev) => (prev.length === mockProducts.length ? [] : mockProducts.map((p) => p.id)))
  }

  const getStockColor = (stock: Product["stock"]) => {
    if (stock === "In Stock") return "text-emerald-600"
    if (stock === "Low Stock") return "text-amber-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-4">
      {selectedProducts.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3">
          <p className="text-sm font-medium">
            {selectedProducts.length} product{selectedProducts.length > 1 ? "s" : ""} selected
          </p>
          <Button size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Optimize Selected
          </Button>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-12">
                <Checkbox checked={selectedProducts.length === mockProducts.length} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead className="font-semibold">Product</TableHead>
              <TableHead className="font-semibold">Price</TableHead>
              <TableHead className="font-semibold">Stock</TableHead>
              <TableHead className="font-semibold">Compliance</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockProducts.map((product) => (
              <TableRow key={product.id} className="hover:bg-muted/20">
                <TableCell>
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={() => toggleProduct(product.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-semibold">${product.price.toFixed(2)}</span>
                </TableCell>
                <TableCell>
                  <span className={getStockColor(product.stock)}>{product.stock}</span>
                </TableCell>
                <TableCell>
                  <ComplianceIndicator level={product.complianceLevel} />
                </TableCell>
                <TableCell>
                  <ProductStatusBadge status={product.status} count={product.pendingCount || product.missingCount} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {product.status !== "ready" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary">
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Product</DropdownMenuItem>
                        <DropdownMenuItem>View History</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Showing 8 of 247 products</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
