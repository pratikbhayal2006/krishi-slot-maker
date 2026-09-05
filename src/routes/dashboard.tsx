import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, SectionTitle } from "@/components/krishi/AppShell";
import { QrCode } from "@/components/krishi/QrCode";
import { useKrishi } from "@/components/krishi/use-krishi";
import {
  centerById,
  formatDate,
  FARMER,
  LANDS,
  STATUS_ORDER,
  statusIndex,
  formatTime,
} from "@/lib/krishislot";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Farmer Dashboard — KrishiSlot" },
      {
        name: "description",
        content:
          "See your booking window, allocated procurement slot, digital QR token and live procurement status in one place.",
      },
      { property: "og:title", content: "Farmer Dashboard — KrishiSlot" },
      {
        property: "og:description",
        content: "Booking window countdown, allocated slot, QR token and procurement status.",
      },
    ],
  }),
  component: Dashboard,
});

function useWindowCountdown() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!now) return { label: "--:--:--", open: true, progress: 0 };

  const close = new Date(now);
  close.setHours(12, 0, 0, 0);
  const open = new Date(now);
  open.setHours(10, 0, 0, 0);

  const isOpen = now >= open && now < close;
  const target = isOpen ? close : new Date(open.getTime() + (now >= close ? 86400000 : 0));
  const diff = Math.max(0, target.getTime() - now.getTime());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const progress = isOpen ? 1 - diff / 7200000 : 0;
  return { label: `${pad(h)}:${pad(m)}:${pad(s)}`, open: isOpen, progress };
}

function Dashboard() {
  const { bookings } = useKrishi();
  const latest = bookings[0];
  const center = centerById(latest?.centerId);
  const cd = useWindowCountdown();

  return (
    <AppShell>
      <section className="px-5 pb-5">
        <div className="animate-rise relative overflow-hidden rounded-2xl bg-gradient-to-b from-chrome/90 to-green p-5 text-primary-foreground ring-1 ring-border">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider opacity-75">
              Booking window · 10:00–12:00
            </span>
            <span className="size-2 animate-softpulse rounded-full bg-primary-foreground" />
          </div>
          <div className="mt-2 flex items-end gap-2">
            <span className="font-display text-5xl leading-none tabular-nums">{cd.label}</span>
            <span className="mb-1 font-mono text-[11px] opacity-75">
              {cd.open ? "left to submit" : "until window opens"}
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary-foreground/20">
            <div
              className="h-full rounded-full bg-primary-foreground transition-all"
              style={{ width: `${Math.round(Math.min(1, Math.max(0, cd.progress)) * 100)}%` }}
            />
          </div>
          <p className="mt-3 text-[11px] leading-snug opacity-80">
            All requests in this window are allocated together after 12:00. Submitting early gives
            no advantage.
          </p>
        </div>
      </section>

      <section className="px-5 pb-6">
        <SectionTitle
          aside={
            <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
              {latest ? (latest.allotted ? "Confirmed" : "Not allotted") : "No booking"}
            </span>
          }
        >
          Your allocated slot
        </SectionTitle>

        {latest && latest.allotted ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-surface to-accent/15 p-5 ring-1 ring-accent/30 shadow-[0_10px_30px_-14px_var(--accent)]">
            <div className="flex items-start justify-between">
              <div className="font-display text-3xl leading-none tracking-tight">
                SLOT · {String(latest.slotNo).padStart(2, "0")}
              </div>
              <span className="rounded-full bg-green/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-green">
                {latest.batch}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Field label="Crop" value={`${latest.crop} · ${latest.cropHindi}`} />
              <Field label="Quantity" value={`${latest.quantity} quintal`} />
              <Field label="Mandi" value={center?.name ?? "—"} />
              <Field
                label="Date"
                value={latest.date ? `${formatDate(latest.date)} · ${latest.batch}` : "—"}
              />
            </div>

            <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
              <QrCode value={latest.tokenId} />
              <div className="min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Token ID
                </div>
                <div className="font-mono text-sm font-bold tracking-tight">{latest.tokenId}</div>
                <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
                  Show this at the mandi gate. Staff will scan to verify crop, weight and price.
                </p>
              </div>
            </div>

            <Link
              to="/token"
              className="mt-4 block w-full rounded-xl bg-gradient-to-b from-accent to-accent/80 py-3.5 text-center text-sm font-bold tracking-tight text-primary-foreground ring-1 ring-border"
            >
              Open digital token
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
            <p className="text-sm font-semibold">
              {latest ? "Slot not allotted this cycle" : "No booking yet"}
            </p>
            <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
              {latest
                ? "Capacity was full at your selected centres. Your waiting history has increased, so your fairness priority will be higher in the next cycle."
                : "Submit a request during the 10:00–12:00 window to enter the allocation."}
            </p>
            <Link
              to="/book"
              className="mt-4 block w-full rounded-xl bg-gradient-to-b from-accent to-accent/80 py-3.5 text-center text-sm font-bold text-primary-foreground ring-1 ring-border"
            >
              Start a booking request
            </Link>
          </div>
        )}
      </section>

      {latest ? (
        <section className="px-5 pb-6">
          <SectionTitle
            aside={
              <Link
                to="/tracking"
                className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                Full history
              </Link>
            }
          >
            Procurement status
          </SectionTitle>
          <div className="relative pl-1">
            <div className="absolute bottom-3 left-[15px] top-3 w-0.5 bg-gradient-to-b from-green via-accent to-border" />
            <div className="space-y-5">
              {STATUS_ORDER.slice(
                Math.max(0, statusIndex(latest.status) - 2),
                statusIndex(latest.status) + 2,
              ).map((s) => {
                const done = statusIndex(s.key) < statusIndex(latest.status);
                const current = s.key === latest.status;
                const at = latest.history.find((h) => h.key === s.key)?.at;
                return (
                  <div key={s.key} className="animate-rise relative flex items-start gap-4">
                    <div
                      className={`grid size-8 place-items-center rounded-full text-xs font-bold ring-4 ring-background ${
                        done
                          ? "bg-green text-primary-foreground"
                          : current
                            ? "animate-softpulse bg-accent text-primary-foreground"
                            : "bg-surface text-muted-foreground"
                      }`}
                    >
                      {statusIndex(s.key) + 1}
                    </div>
                    <div>
                      <div
                        className={`text-sm font-semibold ${done || current ? "" : "text-muted-foreground"}`}
                      >
                        {s.label}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {at ? `${formatDate(at)} · ${formatTime(at)}` : current ? "In progress" : "Upcoming"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-5 pb-8">
        <SectionTitle>Verified land & crop</SectionTitle>
        <div className="space-y-2.5">
          {LANDS.map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between rounded-xl bg-surface p-4 ring-1 ring-border"
            >
              <div>
                <div className="text-sm font-semibold">
                  {l.crop} · {l.cropHindi}
                </div>
                <div className="font-mono text-[11px] text-muted-foreground">
                  {l.survey} · {l.acres} acre · {l.village}
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-xl leading-none">{l.eligibleQuintals}</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  eligible qtl
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Aadhaar {FARMER.aadhaarMasked} · land records verified
        </p>
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
