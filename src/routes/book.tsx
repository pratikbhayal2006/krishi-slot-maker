import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, SectionTitle } from "@/components/krishi/AppShell";
import {
  CENTERS,
  LANDS,
  centerById,
  formatDate,
  landById,
  runAllocation,
  store,
} from "@/lib/krishislot";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Procurement Slot — KrishiSlot" },
      {
        name: "description",
        content:
          "Choose your verified land and crop, quantity in 5-quintal steps and up to five preferred procurement centres in priority order.",
      },
      { property: "og:title", content: "Book a Procurement Slot — KrishiSlot" },
      {
        property: "og:description",
        content: "Land, crop, quantity and centre priorities — submitted into the fair allocation.",
      },
    ],
  }),
  component: BookPage,
});

const QUANTITIES = [5, 10, 15, 20, 25, 30, 35, 40];

function BookPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [landId, setLandId] = useState("L1");
  const [quantity, setQuantity] = useState(15);
  const [prefs, setPrefs] = useState<string[]>(["C1"]);
  const [result, setResult] = useState<ReturnType<typeof runAllocation> | null>(null);

  const land = landById(landId)!;
  const eligible = QUANTITIES.filter((q) => q <= land.eligibleQuintals);

  const togglePref = (id: string) => {
    setPrefs((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : p.length >= 5 ? p : [...p, id],
    );
  };

  return (
    <AppShell subtitle="Booking request">
      <section className="px-5 pb-4">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-accent" : "bg-border"}`}
            />
          ))}
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Step {step} of 4
        </p>
      </section>

      {step === 1 ? (
        <section className="px-5 pb-6">
          <SectionTitle>Select land & crop</SectionTitle>
          <div className="space-y-2.5">
            {LANDS.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  setLandId(l.id);
                  setQuantity(Math.min(15, l.eligibleQuintals));
                }}
                className={`flex w-full items-center justify-between rounded-xl p-4 text-left ring-1 ${
                  landId === l.id ? "bg-accent/10 ring-accent/40" : "bg-surface ring-border"
                }`}
              >
                <div>
                  <div className="text-sm font-semibold">
                    {l.crop} · {l.cropHindi}
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {l.survey} · {l.acres} acre
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl leading-none">{l.eligibleQuintals}</div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    eligible qtl
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="px-5 pb-6">
          <SectionTitle
            aside={
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                5-quintal steps
              </span>
            }
          >
            Quantity to sell
          </SectionTitle>
          <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
            <div className="text-center">
              <div className="font-display text-6xl leading-none">{quantity}</div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                quintal of {land.crop}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-4 gap-2">
              {eligible.map((q) => (
                <button
                  key={q}
                  onClick={() => setQuantity(q)}
                  className={`rounded-lg py-2.5 font-mono text-sm ring-1 ${
                    quantity === q
                      ? "bg-accent font-bold text-primary-foreground ring-border"
                      : "bg-background text-foreground ring-border"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-snug text-muted-foreground">
              Validated against your declared eligible quantity of {land.eligibleQuintals} quintal
              for {land.survey}.
            </p>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="px-5 pb-6">
          <SectionTitle
            aside={
              <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
                {prefs.length}/5 chosen
              </span>
            }
          >
            Centre priority
          </SectionTitle>
          <div className="space-y-2.5">
            {CENTERS.map((c) => {
              const rank = prefs.indexOf(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => togglePref(c.id)}
                  className={`flex w-full items-center gap-3 rounded-xl p-4 text-left ring-1 ${
                    rank >= 0 ? "bg-accent/10 ring-accent/40" : "bg-surface ring-border"
                  }`}
                >
                  <div
                    className={`grid size-9 shrink-0 place-items-center rounded-lg font-display text-lg leading-none ${
                      rank >= 0
                        ? "bg-accent text-primary-foreground"
                        : "bg-background text-muted-foreground"
                    }`}
                  >
                    {rank >= 0 ? rank + 1 : "–"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{c.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {c.distanceKm} km · capacity {c.dailyCapacity[land.crop] ?? 0} qtl/day
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
            Tap in the order you prefer. Priority 1 is your first choice; nearest centres are listed
            first.
          </p>
        </section>
      ) : null}

      {step === 4 && !result ? (
        <section className="px-5 pb-6">
          <SectionTitle>Review request</SectionTitle>
          <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
            <Row label="Land" value={`${land.survey} · ${land.acres} acre`} />
            <Row label="Crop" value={`${land.crop} · ${land.cropHindi}`} />
            <Row label="Quantity" value={`${quantity} quintal`} />
            <Row
              label="Centres"
              value={prefs.map((p, i) => `${i + 1}. ${centerById(p)?.name}`).join("  ")}
            />
            <p className="mt-4 border-t border-border pt-4 text-[11px] leading-snug text-muted-foreground">
              Your request will be stored and processed together with all other requests after the
              window closes at 12:00. There is no first-come-first-serve advantage.
            </p>
          </div>
        </section>
      ) : null}

      {result ? (
        <section className="px-5 pb-6">
          <SectionTitle>Allocation result</SectionTitle>
          <div className="rounded-2xl bg-gradient-to-b from-surface to-accent/15 p-5 ring-1 ring-accent/30">
            {result.allotted ? (
              <>
                <div className="font-display text-3xl leading-none">
                  SLOT · {String(result.slotNo).padStart(2, "0")}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <Field label="Centre" value={centerById(result.centerId)?.name ?? ""} />
                  <Field label="Date" value={formatDate(result.date!)} />
                  <Field label="Batch" value={result.batch!} />
                  <Field label="Token" value={result.tokenId} />
                </div>
              </>
            ) : (
              <>
                <div className="font-display text-2xl leading-none">SLOT NOT ALLOTTED</div>
                <p className="mt-2 text-[12px] leading-snug text-muted-foreground">
                  Capacity was full at your selected centres. Your waiting history increases, giving
                  you higher fairness priority next cycle.
                </p>
              </>
            )}
            <div className="mt-4 border-t border-border pt-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Fairness audit
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[11px] text-muted-foreground">
                <span>Waiting history: {result.fairness.waitingHistory}</span>
                <span>Crop maturity: {result.fairness.maturityScore}d</span>
                <span>Random seed: {result.fairness.randomSeed}</span>
                <span>Score: {result.fairness.score}</span>
              </div>
              <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
                Batch is decided separately, only by distance from your village to the centre.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="fixed inset-x-0 bottom-[52px] mx-auto max-w-[460px] bg-background/95 px-5 py-3 backdrop-blur">
        <div className="flex gap-2">
          {step > 1 && !result ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="rounded-xl bg-surface px-5 py-3.5 text-sm font-bold ring-1 ring-border"
            >
              Back
            </button>
          ) : null}
          <button
            onClick={() => {
              if (result) {
                router.navigate({ to: "/dashboard" });
                return;
              }
              if (step < 4) {
                setStep((s) => s + 1);
                return;
              }
              const r = runAllocation({ landId, quantity, preferences: prefs });
              store.addBooking(r);
              setResult(r);
            }}
            disabled={step === 3 && prefs.length === 0}
            className="flex-1 rounded-xl bg-gradient-to-b from-accent to-accent/80 py-3.5 text-sm font-bold tracking-tight text-primary-foreground ring-1 ring-border disabled:opacity-50"
          >
            {result ? "Go to dashboard" : step === 4 ? "Submit request" : "Continue"}
          </button>
        </div>
      </section>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-sm font-semibold">{value}</span>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
