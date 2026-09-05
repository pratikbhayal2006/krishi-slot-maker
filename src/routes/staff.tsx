import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, SectionTitle } from "@/components/krishi/AppShell";
import { QrCode } from "@/components/krishi/QrCode";
import { useKrishi } from "@/components/krishi/use-krishi";
import { centerById, formatDate, rupees, store } from "@/lib/krishislot";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Mandi Staff Portal — KrishiSlot" },
      {
        name: "description",
        content:
          "Scan a farmer's QR token, verify the booking and record weighed quantity, quality grade, price and buyer to release payment.",
      },
      { property: "og:title", content: "Mandi Staff Portal — KrishiSlot" },
      {
        property: "og:description",
        content: "QR verification and procurement entry for procurement centre staff.",
      },
    ],
  }),
  component: StaffPage,
});

function StaffPage() {
  const { bookings } = useKrishi();
  const booking = bookings.find((b) => b.allotted);
  const [scanned, setScanned] = useState(false);
  const [weight, setWeight] = useState("15.2");
  const [grade, setGrade] = useState("A1");
  const [rate, setRate] = useState("2345");
  const [buyer, setBuyer] = useState("FCI Nanded");

  if (!booking) {
    return (
      <AppShell subtitle="Centre portal" nav={false}>
        <section className="px-5">
          <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
            <p className="text-sm font-semibold">No allotted bookings to verify</p>
          </div>
        </section>
      </AppShell>
    );
  }

  const center = centerById(booking.centerId);
  const total = Math.round(parseFloat(weight || "0") * parseFloat(rate || "0"));

  return (
    <AppShell subtitle="Centre portal" nav={false}>
      <section className="px-5 pb-6">
        <SectionTitle
          aside={
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {center?.name}
            </span>
          }
        >
          QR verification
        </SectionTitle>

        {!scanned ? (
          <div className="grid place-items-center rounded-2xl bg-surface p-6 ring-1 ring-border">
            <QrCode value={booking.tokenId} className="size-40" />
            <p className="mt-4 text-center text-[12px] text-muted-foreground">
              Point the scanner at the farmer's digital token.
            </p>
            <button
              onClick={() => {
                setScanned(true);
                store.advance(booking.id, "verified");
              }}
              className="mt-4 w-full rounded-xl bg-gradient-to-b from-green to-green/80 py-3.5 text-sm font-bold text-primary-foreground ring-1 ring-border"
            >
              Scan token
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
            <div className="flex items-center justify-between rounded-lg bg-green/10 px-3 py-2.5">
              <span className="text-sm font-semibold text-green">Token verified</span>
              <span className="font-mono text-[11px] text-muted-foreground">{booking.tokenId}</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Field label="Farmer" value={booking.farmerName} />
              <Field label="Aadhaar" value={booking.farmerId} />
              <Field label="Crop" value={`${booking.crop} · ${booking.cropHindi}`} />
              <Field label="Booked qty" value={`${booking.quantity} qtl`} />
              <Field label="Date" value={booking.date ? formatDate(booking.date) : "—"} />
              <Field label="Batch" value={booking.batch ?? "—"} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
              <Input label="Weight (qtl)" value={weight} onChange={setWeight} />
              <Input label="Quality grade" value={grade} onChange={setGrade} />
              <Input label="Rate / quintal" value={rate} onChange={setRate} />
              <Input label="Buyer" value={buyer} onChange={setBuyer} />
            </div>

            <div className="mt-3 flex items-center justify-between rounded-lg bg-background p-3 ring-1 ring-border">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Rate / quintal
                </div>
                <div className="mt-0.5 font-display text-2xl leading-none">
                  {rupees(parseFloat(rate || "0"))}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Total
                </div>
                <div className="mt-0.5 font-display text-2xl leading-none text-green">
                  {rupees(total)}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                store.update(booking.id, (b) => ({
                  ...b,
                  procurement: {
                    actualQuantity: parseFloat(weight || "0"),
                    grade,
                    ratePerQuintal: parseFloat(rate || "0"),
                    buyer,
                    total,
                  },
                  payment: {
                    status: "paid",
                    account: b.payment?.account ?? "",
                    reference: "UTR" + Math.floor(Math.random() * 900000 + 100000),
                    paidOn: formatDate(new Date().toISOString()),
                  },
                }));
                store.advance(booking.id, "payment_completed");
              }}
              className="mt-4 w-full rounded-xl bg-gradient-to-b from-accent to-accent/80 py-3.5 text-sm font-bold tracking-tight text-primary-foreground ring-1 ring-border"
            >
              Record & release for payment
            </button>

            {booking.status === "payment_completed" ? (
              <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-wider text-green">
                Procurement recorded · payment released
              </p>
            ) : null}
          </div>
        )}
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

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg bg-background px-3 py-2.5 font-mono text-sm ring-1 ring-border outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}
