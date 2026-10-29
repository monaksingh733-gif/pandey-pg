import { DataPipeline } from "@/lib/dataPipeline";
import { PassView } from "./PassView";

export const dynamic = "force-dynamic";

export default async function PassPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const result = await DataPipeline.bookings.getByCode(code);
  const booking = result?.booking ?? null;

  return (
    <PassView
      booking={
        booking
          ? {
              ...booking,
              addons: Array.isArray(booking.addons) ? (booking.addons as string[]) : [],
              createdAt: booking.createdAt ? new Date(booking.createdAt).toISOString() : null,
            }
          : null
      }
      searchedFor={decodeURIComponent(code).trim()}
    />
  );
}
