import { ReservationDetail } from "@/components/reservation-detail"

interface ReservationPageProps {
  params: Promise<{ id: string }>
}

export default async function ReservationPage({ params }: ReservationPageProps) {
  const { id } = await params

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 py-10 sm:px-6">
        <ReservationDetail id={id} />
      </div>
    </main>
  )
}
