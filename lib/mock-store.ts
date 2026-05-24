import type { Reservation } from "@/lib/types"

// In-memory store - replace with Prisma once DB is connected.
export const reservations: Map<string, Reservation> = new Map()
