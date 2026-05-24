import { NextResponse } from "next/server"
import type { Product } from "@/lib/types"

// Placeholder data — replace with Prisma queries once DB is connected
const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Industrial Hydraulic Pump",
    sku: "HYD-PUMP-001",
    description: "Heavy-duty hydraulic pump suitable for industrial applications.",
    price: 1299.99,
    stock: [
      { warehouseId: "wh-1", warehouseName: "Austin Central", warehouseLocation: "Austin, TX", availableQty: 14 },
      { warehouseId: "wh-2", warehouseName: "Denver North", warehouseLocation: "Denver, CO", availableQty: 3 },
      { warehouseId: "wh-3", warehouseName: "Seattle West", warehouseLocation: "Seattle, WA", availableQty: 0 },
    ],
  },
  {
    id: "prod-2",
    name: "Pneumatic Control Valve",
    sku: "PNEU-VALVE-200",
    description: "Precision pneumatic control valve, 1/2-inch NPT.",
    price: 349.0,
    stock: [
      { warehouseId: "wh-1", warehouseName: "Austin Central", warehouseLocation: "Austin, TX", availableQty: 0 },
      { warehouseId: "wh-2", warehouseName: "Denver North", warehouseLocation: "Denver, CO", availableQty: 27 },
      { warehouseId: "wh-3", warehouseName: "Seattle West", warehouseLocation: "Seattle, WA", availableQty: 11 },
    ],
  },
  {
    id: "prod-3",
    name: "Electric Motor 5HP",
    sku: "ELEC-MOT-5HP",
    description: "TEFC 5HP single-phase electric motor, 230V.",
    price: 875.5,
    stock: [
      { warehouseId: "wh-1", warehouseName: "Austin Central", warehouseLocation: "Austin, TX", availableQty: 8 },
      { warehouseId: "wh-2", warehouseName: "Denver North", warehouseLocation: "Denver, CO", availableQty: 5 },
      { warehouseId: "wh-3", warehouseName: "Seattle West", warehouseLocation: "Seattle, WA", availableQty: 2 },
    ],
  },
  {
    id: "prod-4",
    name: "Stainless Steel Ball Valve",
    sku: "SS-BVALVE-75",
    description: "Full port stainless steel ball valve, 3/4-inch.",
    price: 89.95,
    stock: [
      { warehouseId: "wh-1", warehouseName: "Austin Central", warehouseLocation: "Austin, TX", availableQty: 52 },
      { warehouseId: "wh-2", warehouseName: "Denver North", warehouseLocation: "Denver, CO", availableQty: 0 },
      { warehouseId: "wh-3", warehouseName: "Seattle West", warehouseLocation: "Seattle, WA", availableQty: 19 },
    ],
  },
]

export async function GET() {
  return NextResponse.json(PRODUCTS)
}
