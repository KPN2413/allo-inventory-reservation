import { NextResponse } from "next/server"
import { ReservationStatus } from "@/lib/generated/prisma/client"
import { serializeReservation } from "@/lib/api-serializers"
import { prisma } from "@/lib/prisma"
import { releaseExpiredReservations } from "@/lib/reservation-expiry"
import type { CreateReservationPayload } from "@/lib/types"

export const runtime = "nodejs"

const reservationInclude = {
  product: true,
  warehouse: true,
}

function jsonError(error: string, message: string, status: number) {
  return NextResponse.json({ error, message }, { status })
}

export async function POST(request: Request) {
  let body: CreateReservationPayload

  try {
    body = (await request.json()) as CreateReservationPayload
  } catch {
    return jsonError("INVALID_REQUEST_BODY", "Invalid request body", 400)
  }

  const { productId, warehouseId, quantity } = body

  if (
    typeof productId !== "string" ||
    typeof warehouseId !== "string" ||
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    return jsonError("INVALID_REQUEST_BODY", "Invalid request body", 400)
  }

  await releaseExpiredReservations()

  const reservation = await prisma.$transaction(async (tx) => {
    const updatedStockLevels = await tx.$queryRaw<{ id: string }[]>`
      UPDATE "StockLevel"
      SET "reservedUnits" = "reservedUnits" + ${quantity}
      WHERE "productId" = ${productId}
        AND "warehouseId" = ${warehouseId}
        AND ("totalUnits" - "reservedUnits") >= ${quantity}
      RETURNING "id"
    `

    if (updatedStockLevels.length === 0) {
      return null
    }

    return tx.reservation.create({
      data: {
        productId,
        warehouseId,
        quantity,
        status: ReservationStatus.PENDING,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
      include: reservationInclude,
    })
  })

  if (!reservation) {
    return jsonError("NOT_ENOUGH_STOCK", "Not enough stock available", 409)
  }

  return NextResponse.json(serializeReservation(reservation), { status: 201 })
}
