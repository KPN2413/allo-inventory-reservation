"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Minus, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { createReservation } from "@/lib/api"
import type { WarehouseStock } from "@/lib/types"

interface WarehouseRowProps {
  productId: string
  stock: WarehouseStock
}

export function WarehouseRow({ productId, stock }: WarehouseRowProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOutOfStock = stock.availableQty === 0
  const maxQty = stock.availableQty

  function decrement() {
    setQuantity((q) => Math.max(1, q - 1))
    setError(null)
  }

  function increment() {
    setQuantity((q) => Math.min(maxQty, q + 1))
    setError(null)
  }

  async function handleReserve() {
    setError(null)
    setLoading(true)
    try {
      const reservation = await createReservation({
        productId,
        warehouseId: stock.warehouseId,
        quantity,
      })
      router.push(`/reservations/${reservation.id}`)
    } catch (err: unknown) {
      const e = err as Error & { status?: number }
      if (e.status === 409) {
        setError("Not enough stock available.")
      } else {
        setError(e.message || "Failed to create reservation.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4 py-2.5 px-3 rounded-lg bg-secondary/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{stock.warehouseName}</p>
            <p className="text-xs text-muted-foreground truncate">{stock.warehouseLocation}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium px-2 py-0.5 border",
              isOutOfStock
                ? "border-destructive/40 text-destructive bg-destructive/5"
                : stock.availableQty <= 5
                ? "border-amber-400/50 text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400"
                : "border-emerald-400/50 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400"
            )}
          >
            {isOutOfStock ? "Out of stock" : `${stock.availableQty} available`}
          </Badge>

          {!isOutOfStock && (
            <>
              <div className="flex items-center border border-border rounded-md overflow-hidden">
                <button
                  onClick={decrement}
                  disabled={quantity <= 1 || loading}
                  className="px-2 py-1.5 hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3 text-foreground" />
                </button>
                <span className="px-3 py-1 text-sm font-medium text-foreground min-w-[2.5rem] text-center border-x border-border">
                  {quantity}
                </span>
                <button
                  onClick={increment}
                  disabled={quantity >= maxQty || loading}
                  className="px-2 py-1.5 hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3 text-foreground" />
                </button>
              </div>

              <Button
                size="sm"
                onClick={handleReserve}
                disabled={loading}
                className="min-w-[90px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Reserving
                  </>
                ) : (
                  "Reserve"
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive font-medium px-3">{error}</p>
      )}
    </div>
  )
}
