import type {
  Product as DbProduct,
  Reservation as DbReservation,
  Warehouse as DbWarehouse,
} from "@/lib/generated/prisma/client"
import type { Product, Reservation, ReservationStatus, Warehouse } from "@/lib/types"

type ProductWithStock = DbProduct & {
  stockLevels: Array<{
    totalUnits: number
    reservedUnits: number
    warehouse: DbWarehouse
  }>
}

type ReservationWithRelations = DbReservation & {
  product: DbProduct
  warehouse: DbWarehouse
}

const productPriceBySku: Record<string, number> = {
  "HYD-PUMP-001": 1299.99,
  "PNEU-VALVE-200": 349,
  "ELEC-MOT-5HP": 875.5,
  "SS-BVALVE-75": 89.95,
}

function toApiReservationStatus(status: DbReservation["status"]): ReservationStatus {
  return status.toLowerCase() as ReservationStatus
}

export function serializeWarehouse(warehouse: DbWarehouse): Warehouse {
  return {
    id: warehouse.id,
    name: warehouse.name,
    code: warehouse.code,
    city: warehouse.city,
    location: warehouse.city,
  }
}

export function serializeProduct(product: ProductWithStock): Product {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    description: product.description ?? "",
    price: productPriceBySku[product.sku] ?? 0,
    stock: product.stockLevels.map((stockLevel) => {
      const availableUnits = stockLevel.totalUnits - stockLevel.reservedUnits

      return {
        warehouseId: stockLevel.warehouse.id,
        warehouseName: stockLevel.warehouse.name,
        warehouseCode: stockLevel.warehouse.code,
        warehouseCity: stockLevel.warehouse.city,
        warehouseLocation: stockLevel.warehouse.city,
        totalUnits: stockLevel.totalUnits,
        reservedUnits: stockLevel.reservedUnits,
        availableUnits,
        availableQty: availableUnits,
        warehouse: serializeWarehouse(stockLevel.warehouse),
      }
    }),
  }
}

export function serializeReservation(
  reservation: ReservationWithRelations,
): Reservation {
  return {
    id: reservation.id,
    productId: reservation.productId,
    productName: reservation.product.name,
    productSku: reservation.product.sku,
    warehouseId: reservation.warehouseId,
    warehouseName: reservation.warehouse.name,
    quantity: reservation.quantity,
    status: toApiReservationStatus(reservation.status),
    expiresAt: reservation.expiresAt.toISOString(),
    confirmedAt: reservation.confirmedAt?.toISOString(),
    releasedAt: reservation.releasedAt?.toISOString(),
    createdAt: reservation.createdAt.toISOString(),
    updatedAt: reservation.updatedAt.toISOString(),
    product: {
      id: reservation.product.id,
      name: reservation.product.name,
      sku: reservation.product.sku,
      description: reservation.product.description ?? "",
    },
    warehouse: serializeWarehouse(reservation.warehouse),
  }
}
