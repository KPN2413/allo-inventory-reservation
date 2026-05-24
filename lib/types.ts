export interface Warehouse {
  id: string
  name: string
  location: string
}

export interface WarehouseStock {
  warehouseId: string
  warehouseName: string
  warehouseLocation: string
  availableQty: number
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
  createdAt: string
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
