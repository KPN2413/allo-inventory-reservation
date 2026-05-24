import { NextResponse } from "next/server"
import { reservations } from "@/lib/mock-store"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const reservation = reservations.get(id)

  if (!reservation) {
    return NextResponse.json({ message: "Reservation not found." }, { status: 404 })
  }

  // Auto-expire
  if (
    reservation.status === "pending" &&
    new Date() > new Date(reservation.expiresAt)
  ) {
    reservation.status = "expired"
    reservations.set(id, reservation)
  }

  return NextResponse.json(reservation)
}
