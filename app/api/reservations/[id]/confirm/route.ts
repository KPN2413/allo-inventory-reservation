import { NextResponse } from "next/server"
import { reservations } from "@/lib/mock-store"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const reservation = reservations.get(id)

  if (!reservation) {
    return NextResponse.json({ message: "Reservation not found." }, { status: 404 })
  }

  if (
    reservation.status === "pending" &&
    new Date() > new Date(reservation.expiresAt)
  ) {
    reservation.status = "expired"
    reservations.set(id, reservation)
    return NextResponse.json(
      { message: "This reservation has expired and can no longer be confirmed." },
      { status: 410 }
    )
  }

  if (reservation.status !== "pending") {
    return NextResponse.json(
      { message: `Cannot confirm a reservation with status: ${reservation.status}.` },
      { status: 409 }
    )
  }

  reservation.status = "confirmed"
  reservations.set(id, reservation)

  return NextResponse.json(reservation)
}
