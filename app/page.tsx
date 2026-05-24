import { Boxes } from "lucide-react"
import { ProductList } from "@/components/product-list"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Boxes className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Allo
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-3 text-balance">
            Inventory Catalog
          </h1>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Browse available products and reserve stock from any warehouse. Reservations expire
            in 15 minutes.
          </p>
        </header>

        <ProductList />
      </div>
    </main>
  )
}
