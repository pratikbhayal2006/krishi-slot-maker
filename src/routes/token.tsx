import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, SectionTitle } from "@/components/krishi/AppShell";
import { QrCode } from "@/components/krishi/QrCode";
import { useKrishi } from "@/components/krishi/use-krishi";
import { centerById, formatDate, FARMER } from "@/lib/krishislot";

export const Route = createFileRoute("/token")({
  head: () => ({
    meta: [
      { title: "Digital Procurement Token — KrishiSlot" },
      {
        name: "description",
        content:
          "Your downloadable KrishiSlot token with QR code, centre, date, batch and booked quantity for mandi gate verification.",
      },
      { property: "og:title", content: "Digital Procurement Token — KrishiSlot" },
      {
        property: "og:description",
        content: "QR token with centre, date, batch and quantity for mandi verification.",
      },
    ],
  }),
  component: TokenPage,
});

function TokenPage() {
  const { bookings } = useKrishi();
  const b = bookings.find((x) => x.allotted);

  if (!b) {
    return (
      <AppShell subtitle="Digital token">
        <section className="px-5 pb-6">
          <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
            <p className="text-sm font-semibold">No token yet</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              A token is generated once a slot is allotted to you.
            </p>
            <Link
              to="/book"
              className="mt-4 block rounded-xl bg-gradient-to-b from-accent to-accent/80 py-3.5 text-center text-sm font-bold text-primary-foreground ring-1 ring-border"
            >
              Book a slot
            </Link>
          </div>
        </section>
      </AppShell>
    );
  }

  const center = centerById(b.centerId);

  return (
    <AppShell subtitle="Digital token">
      <section className="px-5 pb-6">
        <SectionTitle
          aside={
            <span className="font-mono text-[10px] uppercase tracking-wider text-green">
              {b.allotted ? "Valid" : "Invalid"}
            </span>
          }
        >
          Procurement token
        </SectionTitle>

        <div className="animate-rise overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
          <div className="bg-gradient-to-b from-chrome/90 to-green px-5 py-4 text-primary-foreground">
            <div className="font-mono text-[10px] uppercase tracking-wider opacity-75">
              KrishiSlot · Government procurement
            </div>
            <div className="mt-1 font-display text-3xl leading-none">
              SLOT · {String(b.slotNo).padStart(2, "0")}
            </div>
            <div className="mt-1 font-mono text-[11px] opacity-85">{b.tokenId}</div>
          </div>

          <div className="grid place-items-center px-5 py-6">
            <QrCode value={b.tokenId} className="size-48" />
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Scanned by centre staff at the gate
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-border px-5 py-4 text-sm">
            <Field label="Farmer" value={b.farmerName} />
            <Field label="Aadhaar" value={FARMER.aadhaarMasked} />
            <Field label="Crop" value={`${b.crop} · ${b.cropHindi}`} />
            <Field label="Booked qty" value={`${b.quantity} quintal`} />
            <Field label="Centre" value={center?.name ?? "—"} />
            <Field label="Distance" value={`${center?.distanceKm} km`} />
            <Field label="Date" value={b.date ? formatDate(b.date) : "—"} />
            <Field label="Batch" value={b.batch ?? "—"} />
          </div>

          <div className="px-5 pb-5">
            <button
              onClick={() => window.print()}
              className="w-full rounded-xl bg-gradient-to-b from-accent to-accent/80 py-3.5 text-sm font-bold tracking-tight text-primary-foreground ring-1 ring-border"
            >
              Download / print token
            </button>
            <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
              An SMS with this token link is sent to {FARMER.mobile}. The token stays available in
              your dashboard.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
