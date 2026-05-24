import { NextResponse } from "next/server"
import { serializeReservation } from "@/lib/api-serializers"
import { prisma } from "@/lib/prisma"
import { releaseExpiredReservations } from "@/lib/reservation-expiry"

export const runtime = "nodejs"

const reservationInclude = {
  product: true,
  warehouse: true,
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  await releaseExpiredReservations()

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: reservationInclude,
  })

  if (!reservation) {
    return NextResponse.json(
      { error: "RESERVATION_NOT_FOUND", message: "Reservation not found" },
      { status: 404 },
    )
  }

  return NextResponse.json(serializeReservation(reservation))
}
