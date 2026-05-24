import { Package } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { WarehouseRow } from "@/components/warehouse-row"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const totalStock = product.stock.reduce((sum, s) => sum + s.availableQty, 0)

  return (
    <Card className="flex flex-col border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground leading-tight text-balance">
              {product.name}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono tracking-wide">
              {product.sku}
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-base font-semibold text-foreground">
              ${product.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">{totalStock} total units</p>
          </div>
        </div>
        {product.description && (
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            {product.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 pt-0">
        <div className="border-t border-border pt-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
            Warehouse Availability
          </p>
          <div className="flex flex-col gap-1.5">
            {product.stock.map((s) => (
              <WarehouseRow key={s.warehouseId} productId={product.id} stock={s} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
