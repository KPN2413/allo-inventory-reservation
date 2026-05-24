import { prisma } from "@/lib/prisma"

export async function releaseExpiredReservations() {
  const rows = await prisma.$queryRaw<{ releasedCount: number }[]>`
    WITH expired AS (
      UPDATE "Reservation"
      SET
        "status" = 'RELEASED',
        "releasedAt" = COALESCE("releasedAt", NOW()),
        "updatedAt" = NOW()
      WHERE "status" = 'PENDING'
        AND "expiresAt" <= NOW()
      RETURNING "productId", "warehouseId", "quantity"
    ),
    released AS (
      SELECT
        "productId",
        "warehouseId",
        SUM("quantity")::int AS "quantity"
      FROM expired
      GROUP BY "productId", "warehouseId"
    ),
    updated_stock AS (
      UPDATE "StockLevel" stock
      SET "reservedUnits" = GREATEST(0, stock."reservedUnits" - released."quantity")
      FROM released
      WHERE stock."productId" = released."productId"
        AND stock."warehouseId" = released."warehouseId"
      RETURNING stock."id"
    )
    SELECT COUNT(*)::int AS "releasedCount"
    FROM expired
  `

  return rows[0]?.releasedCount ?? 0
}
