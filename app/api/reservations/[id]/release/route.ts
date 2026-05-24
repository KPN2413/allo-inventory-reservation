import { NextResponse } from "next/server"
import { ReservationStatus } from "@/lib/generated/prisma/client"
import { serializeReservation } from "@/lib/api-serializers"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

type LockedReservation = {
  id: string
  productId: string
  warehouseId: string
  quantity: number
  status: "PENDING" | "CONFIRMED" | "RELEASED"
}

const reservationInclude = {
  product: true,
  warehouse: true,
}

function jsonError(error: string, message: string, status: number) {
  return NextResponse.json({ error, message }, { status })
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const result = await prisma.$transaction(async (tx) => {
    const [reservation] = await tx.$queryRaw<LockedReservation[]>`
      SELECT
        "id",
        "productId",
        "warehouseId",
        "quantity",
        "status"
      FROM "Reservation"
      WHERE "id" = ${id}
      FOR UPDATE
    `

    if (!reservation) {
      return { type: "not_found" as const }
    }

    if (reservation.status === ReservationStatus.RELEASED) {
      const currentReservation = await tx.reservation.findUniqueOrThrow({
        where: { id },
        include: reservationInclude,
      })

      return { type: "ok" as const, reservation: currentReservation }
    }

    if (reservation.status === ReservationStatus.CONFIRMED) {
      return { type: "confirmed_conflict" as const }
    }

    await tx.$executeRaw`
      UPDATE "StockLevel"
      SET "reservedUnits" = "reservedUnits" - ${reservation.quantity}
      WHERE "productId" = ${reservation.productId}
        AND "warehouseId" = ${reservation.warehouseId}
    `

    const updatedReservation = await tx.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.RELEASED,
        releasedAt: new Date(),
      },
      include: reservationInclude,
    })

    return { type: "ok" as const, reservation: updatedReservation }
  })

  if (result.type === "not_found") {
    return jsonError("RESERVATION_NOT_FOUND", "Reservation not found", 404)
  }

  if (result.type === "confirmed_conflict") {
    return jsonError(
      "RESERVATION_CONFIRMED",
      "Cannot release an already confirmed reservation",
      409,
    )
  }

  return NextResponse.json(serializeReservation(result.reservation))
}
