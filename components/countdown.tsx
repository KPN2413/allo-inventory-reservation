"use client"

import { useEffect, useState } from "react"

interface CountdownProps {
  expiresAt: string
}

export function Countdown({ expiresAt }: CountdownProps) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
    return Math.max(0, diff)
  })

  useEffect(() => {
    if (secondsLeft <= 0) return

    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        const next = s - 1
        if (next <= 0) {
          clearInterval(timer)
          return 0
        }
        return next
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [secondsLeft, expiresAt])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  const isExpired = secondsLeft <= 0
  const isUrgent = secondsLeft <= 60 && !isExpired

  return (
    <div
      className={`flex items-baseline gap-1 tabular-nums font-mono text-2xl font-bold ${
        isExpired
          ? "text-destructive"
          : isUrgent
          ? "text-amber-600 dark:text-amber-400"
          : "text-foreground"
      }`}
      aria-live="polite"
      aria-label={isExpired ? "Reservation expired" : `Time remaining: ${minutes} minutes and ${seconds} seconds`}
    >
      {isExpired ? (
        <span className="text-base font-semibold">Expired</span>
      ) : (
        <>
          <span>{String(minutes).padStart(2, "0")}</span>
          <span className="opacity-60">:</span>
          <span>{String(seconds).padStart(2, "0")}</span>
        </>
      )}
    </div>
  )
}
