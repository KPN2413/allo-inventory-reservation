import type {
  Product,
  Reservation,
  CreateReservationPayload,
} from "@/lib/types"

const BASE_URL = "/api"

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.message || "An unexpected error occurred") as Error & {
      status: number
    }
    err.status = res.status
    throw err
  }
  return res.json() as Promise<T>
}

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/products`)
  return handleResponse<Product[]>(res)
}

export async function createReservation(
  payload: CreateReservationPayload
): Promise<Reservation> {
  const res = await fetch(`${BASE_URL}/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  return handleResponse<Reservation>(res)
}

export async function getReservation(id: string): Promise<Reservation> {
  const res = await fetch(`${BASE_URL}/reservations/${id}`)
  return handleResponse<Reservation>(res)
}

export async function confirmReservation(id: string): Promise<Reservation> {
  const res = await fetch(`${BASE_URL}/reservations/${id}/confirm`, {
    method: "POST",
  })
  return handleResponse<Reservation>(res)
}

export async function releaseReservation(id: string): Promise<Reservation> {
  const res = await fetch(`${BASE_URL}/reservations/${id}/release`, {
    method: "POST",
  })
  return handleResponse<Reservation>(res)
}
