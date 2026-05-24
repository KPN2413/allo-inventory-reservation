import { NextResponse } from "next/server"
import type { Reservation, CreateReservationPayload } from "@/lib/types"
import { reservations } from "@/lib/mock-store"

export async function POST(request: Request) {
  const body = (await request.json()) as CreateReservationPayload
  const { productId, warehouseId, quantity } = body

  if (!productId || !warehouseId || !quantity || quantity < 1) {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 })
  }

  // Simulate insufficient stock for warehouseId "wh-3" + product "prod-1" combo as example
  if (productId === "prod-1" && warehouseId === "wh-3") {
    return NextResponse.json(
      { message: "Not enough stock available in this warehouse." },
      { status: 409 }
    )
  }

  const id = `res-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000) // 15 minutes

  // Placeholder - in production, look up product/warehouse names from DB.
  const productNameMap: Record<string, string> = {
    "prod-1": "Industrial Hydraulic Pump",
    "prod-2": "Pneumatic Control Valve",
    "prod-3": "Electric Motor 5HP",
    "prod-4": "Stainless Steel Ball Valve",
  }
  const skuMap: Record<string, string> = {
    "prod-1": "HYD-PUMP-001",
    "prod-2": "PNEU-VALVE-200",
    "prod-3": "ELEC-MOT-5HP",
    "prod-4": "SS-BVALVE-75",
  }
  const warehouseNameMap: Record<string, string> = {
    "wh-1": "Austin Central",
    "wh-2": "Denver North",
    "wh-3": "Seattle West",
  }

  const reservation: Reservation = {
    id,
    productId,
    productName: productNameMap[productId] ?? "Unknown Product",
    productSku: skuMap[productId] ?? "N/A",
    warehouseId,
    warehouseName: warehouseNameMap[warehouseId] ?? "Unknown Warehouse",
    quantity,
    status: "pending",
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
  }

  reservations.set(id, reservation)

  return NextResponse.json(reservation, { status: 201 })
}
