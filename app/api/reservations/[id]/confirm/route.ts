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
  expiresAt: Date
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
        "status",
        "expiresAt"
      FROM "Reservation"
      WHERE "id" = ${id}
      FOR UPDATE
    `

    if (!reservation) {
      return { type: "not_found" as const }
    }

    if (reservation.status === ReservationStatus.CONFIRMED) {
      const currentReservation = await tx.reservation.findUniqueOrThrow({
        where: { id },
        include: reservationInclude,
      })

      return { type: "ok" as const, reservation: currentReservation }
    }

    if (reservation.status === ReservationStatus.RELEASED) {
      return { type: "released_conflict" as const }
    }

    if (reservation.expiresAt <= new Date()) {
      await tx.reservation.update({
        where: { id },
        data: {
          status: ReservationStatus.RELEASED,
          releasedAt: new Date(),
        },
      })

      await tx.$executeRaw`
        UPDATE "StockLevel"
        SET "reservedUnits" = "reservedUnits" - ${reservation.quantity}
        WHERE "productId" = ${reservation.productId}
          AND "warehouseId" = ${reservation.warehouseId}
      `

      return { type: "expired" as const }
    }

    await tx.$executeRaw`
      UPDATE "StockLevel"
      SET
        "totalUnits" = "totalUnits" - ${reservation.quantity},
        "reservedUnits" = "reservedUnits" - ${reservation.quantity}
      WHERE "productId" = ${reservation.productId}
        AND "warehouseId" = ${reservation.warehouseId}
    `

    const updatedReservation = await tx.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.CONFIRMED,
        confirmedAt: new Date(),
      },
      include: reservationInclude,
    })

    return { type: "ok" as const, reservation: updatedReservation }
  })

  if (result.type === "not_found") {
    return jsonError("RESERVATION_NOT_FOUND", "Reservation not found", 404)
  }

  if (result.type === "expired") {
    return jsonError("RESERVATION_EXPIRED", "Reservation has expired", 410)
  }

  if (result.type === "released_conflict") {
    return jsonError(
      "RESERVATION_RELEASED",
      "Cannot confirm a released reservation",
      409,
    )
  }

  return NextResponse.json(serializeReservation(result.reservation))
}
