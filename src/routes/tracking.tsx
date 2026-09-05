import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionTitle } from "@/components/krishi/AppShell";
import { useKrishi } from "@/components/krishi/use-krishi";
import {
  centerById,
  formatDate,
  formatTime,
  rupees,
  STATUS_ORDER,
  statusIndex,
} from "@/lib/krishislot";

export const Route = createFileRoute("/tracking")({
  head: () => ({
    meta: [
      { title: "Procurement & Payment Tracking — KrishiSlot" },
      {
        name: "description",
        content:
          "Track every stage from slot booked to payment completed, with weighed quantity, quality grade, price and payment reference.",
      },
      { property: "og:title", content: "Procurement & Payment Tracking — KrishiSlot" },
      {
        property: "og:description",
        content: "Stage-by-stage procurement status, amount payable and payment reference.",
      },
    ],
  }),
  component: TrackingPage,
});

function TrackingPage() {
  const { bookings } = useKrishi();

  return (
    <AppShell subtitle="Tracking">
      {bookings.map((b) => {
        const center = centerById(b.centerId);
        return (
          <section key={b.id} className="px-5 pb-8">
            <SectionTitle
              aside={
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {b.tokenId}
                </span>
              }
            >
              {b.crop} · {b.quantity} qtl
            </SectionTitle>

            <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Field label="Centre" value={center?.name ?? "Not allotted"} />
                <Field
                  label="Slot"
                  value={b.date ? `${formatDate(b.date)} · ${b.batch}` : "—"}
                />
              </div>

              {b.procurement ? (
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
                  <Field label="Actual weighed" value={`${b.procurement.actualQuantity} qtl`} />
                  <Field label="Quality grade" value={b.procurement.grade} />
                  <Field label="Rate / quintal" value={rupees(b.procurement.ratePerQuintal)} />
                  <Field label="Buyer" value={b.procurement.buyer} />
                  <div className="col-span-2 flex items-center justify-between rounded-lg bg-background p-3 ring-1 ring-border">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Total payable
                    </span>
                    <span className="font-display text-2xl leading-none text-green">
                      {rupees(b.procurement.total)}
                    </span>
                  </div>
                </div>
              ) : null}

              {b.payment ? (
                <div className="mt-4 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Payment · {b.payment.account}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${
                        b.payment.status === "paid"
                          ? "bg-green/15 text-green"
                          : "bg-accent/15 text-accent"
                      }`}
                    >
                      {b.payment.status}
                    </span>
                  </div>
                  {b.payment.reference ? (
                    <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                      Ref {b.payment.reference} · {b.payment.paidOn}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="relative mt-5 pl-1">
              <div className="absolute bottom-3 left-[15px] top-3 w-0.5 bg-gradient-to-b from-green via-accent to-border" />
              <div className="space-y-4">
                {STATUS_ORDER.map((s, i) => {
                  const done = statusIndex(s.key) < statusIndex(b.status);
                  const current = s.key === b.status;
                  const at = b.history.find((h) => h.key === s.key)?.at;
                  return (
                    <div key={s.key} className="relative flex items-start gap-4">
                      <div
                        className={`grid size-8 place-items-center rounded-full text-xs font-bold ring-4 ring-background ${
                          done
                            ? "bg-green text-primary-foreground"
                            : current
                              ? "animate-softpulse bg-accent text-primary-foreground"
                              : "bg-surface text-muted-foreground ring-1 ring-border"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <div
                          className={`text-sm font-semibold ${done || current ? "" : "text-muted-foreground"}`}
                        >
                          {s.label}
                        </div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          {at
                            ? `${formatDate(at)} · ${formatTime(at)}`
                            : current
                              ? "In progress"
                              : "Upcoming"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}
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
