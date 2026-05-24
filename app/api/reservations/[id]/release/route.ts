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

  if (reservation.status === "confirmed") {
    return NextResponse.json(
      { message: "Cannot release an already confirmed reservation." },
      { status: 409 }
    )
  }

  reservation.status = "released"
  reservations.set(id, reservation)

  return NextResponse.json(reservation)
}
