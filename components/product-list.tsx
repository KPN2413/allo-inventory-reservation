"use client"

import useSWR from "swr"
import { AlertCircle, PackageSearch, RefreshCw } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getProducts } from "@/lib/api"
import type { Product } from "@/lib/types"

function ProductSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-4/5" />
      <div className="border-t border-border pt-3 flex flex-col gap-2">
        <Skeleton className="h-3 w-1/4 mb-1" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  )
}

export function ProductList() {
  const { data, error, isLoading, mutate } = useSWR<Product[]>("/api/products", getProducts)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[...Array(4)].map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">Failed to load products</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error.message || "An unexpected error occurred."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => mutate()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <PackageSearch className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">No products found</p>
          <p className="text-sm text-muted-foreground mt-1">
            There are no products in the catalog yet.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {data.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
