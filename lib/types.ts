export interface Warehouse {
  id: string
  name: string
  code?: string
  city?: string
  location: string
}

export interface WarehouseStock {
  warehouseId: string
  warehouseName: string
  warehouseCode?: string
  warehouseCity?: string
  warehouseLocation: string
  totalUnits?: number
  reservedUnits?: number
  availableUnits: number
  availableQty: number
  warehouse?: Warehouse
}

export interface Product {
  id: string
  name: string
  sku: string
  description: string
  price: number
  stock: WarehouseStock[]
}

export type ReservationStatus = "pending" | "confirmed" | "released" | "expired"

export interface Reservation {
  id: string
  productId: string
  productName: string
  productSku: string
  warehouseId: string
  warehouseName: string
  quantity: number
  status: ReservationStatus
  expiresAt: string // ISO string
  confirmedAt?: string
  releasedAt?: string
  createdAt: string
  updatedAt?: string
  product?: Pick<Product, "id" | "name" | "sku" | "description">
  warehouse?: Warehouse
}

export interface ApiError {
  code: number
  message: string
}

export interface CreateReservationPayload {
  productId: string
  warehouseId: string
  quantity: number
}
