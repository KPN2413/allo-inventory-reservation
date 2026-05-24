import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { serializeWarehouse } from "@/lib/api-serializers"

export const runtime = "nodejs"

export async function GET() {
  const warehouses = await prisma.warehouse.findMany({
    orderBy: {
      name: "asc",
    },
  })

  return NextResponse.json(warehouses.map(serializeWarehouse))
}
