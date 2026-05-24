import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { releaseExpiredReservations } from "@/lib/reservation-expiry"
import { serializeProduct } from "@/lib/api-serializers"

export const runtime = "nodejs"

export async function GET() {
  await releaseExpiredReservations()

  const products = await prisma.product.findMany({
    include: {
      stockLevels: {
        include: {
          warehouse: true,
        },
        orderBy: {
          warehouseId: "asc",
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })

  return NextResponse.json(products.map(serializeProduct))
}
