"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft, AlertCircle, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Countdown } from "@/components/countdown"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getReservation, confirmReservation, releaseReservation } from "@/lib/api"
import type { Reservation, ReservationStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ReservationDetailProps {
  id: string
}

const STATUS_CONFIG: Record<
  ReservationStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "border-amber-400/50 text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    className: "border-emerald-400/50 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400",
  },
  released: {
    label: "Cancelled",
    icon: XCircle,
    className: "border-border text-muted-foreground bg-muted/40",
  },
  expired: {
    label: "Expired",
    icon: AlertCircle,
    className: "border-destructive/40 text-destructive bg-destructive/5",
  },
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  )
}

export function ReservationDetail({ id }: ReservationDetailProps) {
  const router = useRouter()
  const [actionError, setActionError] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const { data: reservation, error, isLoading, mutate } = useSWR<Reservation>(
    id ? `/api/reservations/${id}` : null,
    () => getReservation(id),
    { refreshInterval: (data) => (data?.status === "pending" ? 10000 : 0) }
  )

  async function handleConfirm() {
    setActionError(null)
    setIsConfirming(true)
    try {
      const updated = await confirmReservation(id)
      await mutate(updated, { revalidate: false })
    } catch (err: unknown) {
      const e = err as Error & { status?: number }
      if (e.status === 410) {
        setActionError("This reservation has expired and can no longer be confirmed.")
        await mutate()
      } else if (e.status === 409) {
        setActionError(e.message || "Unable to confirm reservation.")
        await mutate()
      } else {
        setActionError(e.message || "Failed to confirm reservation.")
      }
    } finally {
      setIsConfirming(false)
    }
  }

  async function handleCancel() {
    setActionError(null)
    setIsCancelling(true)
    try {
      const updated = await releaseReservation(id)
      await mutate(updated, { revalidate: false })
    } catch (err: unknown) {
      const e = err as Error & { status?: number }
      setActionError(e.message || "Failed to cancel reservation.")
      await mutate()
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-5 w-32" />
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex flex-col gap-3 mt-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between py-3 border-b border-border">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 flex-1 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !reservation) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">Reservation not found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error?.message || "This reservation does not exist or has been removed."}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to catalog
          </Link>
        </Button>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[reservation.status]
  const StatusIcon = statusConfig.icon
  const isPending = reservation.status === "pending"
  const isTerminal = reservation.status === "confirmed" || reservation.status === "released" || reservation.status === "expired"

  return (
    <div className="flex flex-col gap-6">
      {/* Back nav */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to catalog
      </Link>

      {/* Main card */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="px-6 pt-6 pb-4 border-b border-border flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-muted-foreground tracking-wider mb-1">
              RESERVATION
            </p>
            <h1 className="text-lg font-bold text-foreground text-balance">
              {reservation.productName}
            </h1>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {reservation.productSku}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn("flex items-center gap-1.5 text-xs font-semibold flex-shrink-0", statusConfig.className)}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {statusConfig.label}
          </Badge>
        </div>

        {/* Detail rows */}
        <div className="px-6 py-1">
          <DetailRow label="Reservation ID" value={<span className="font-mono text-xs">{reservation.id}</span>} />
          <DetailRow label="Warehouse" value={reservation.warehouseName} />
          <DetailRow
            label="Quantity"
            value={`${reservation.quantity} unit${reservation.quantity !== 1 ? "s" : ""}`}
          />
          <DetailRow
            label="Created"
            value={new Date(reservation.createdAt).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          />
          <DetailRow
            label="Expires"
            value={new Date(reservation.expiresAt).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          />
        </div>

        {/* Timer section */}
        {isPending && (
          <div className="mx-6 mb-4 mt-2 rounded-lg border border-border bg-secondary/40 px-4 py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">
                Time remaining
              </p>
              <Countdown expiresAt={reservation.expiresAt} />
            </div>
            <div className="w-px h-12 bg-border" />
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
              Complete your purchase before the timer runs out or stock will be released.
            </p>
          </div>
        )}

        {/* Terminal state banners */}
        {reservation.status === "confirmed" && (
          <div className="mx-6 mb-4 mt-2 rounded-lg border border-emerald-400/40 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Purchase confirmed. Your order has been placed successfully.
            </p>
          </div>
        )}
        {reservation.status === "released" && (
          <div className="mx-6 mb-4 mt-2 rounded-lg border border-border bg-muted/40 px-4 py-3 flex items-start gap-3">
            <XCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              This reservation was cancelled. Stock has been returned to the warehouse.
            </p>
          </div>
        )}
        {reservation.status === "expired" && (
          <div className="mx-6 mb-4 mt-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">
              This reservation expired before it was confirmed. Please create a new reservation.
            </p>
          </div>
        )}

        {/* Action error */}
        {actionError && (
          <div className="mx-6 mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{actionError}</p>
          </div>
        )}

        {/* Actions */}
        {isPending && (
          <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 sm:order-2"
              onClick={handleConfirm}
              disabled={isConfirming || isCancelling}
            >
              {isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Confirming...
                </>
              ) : (
                "Confirm Purchase"
              )}
            </Button>
            <Button
              variant="outline"
              className="flex-1 sm:order-1"
              onClick={handleCancel}
              disabled={isConfirming || isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Reservation"
              )}
            </Button>
          </div>
        )}

        {isTerminal && (
          <div className="px-6 pb-6">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to catalog
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
