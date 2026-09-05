import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { FARMER, store } from "@/lib/krishislot";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KrishiSlot — Fair Mandi Procurement Slot Booking" },
      {
        name: "description",
        content:
          "KrishiSlot gives farmers a fair procurement slot: Aadhaar login, verified land, booking window, allocated date and batch, QR token and payment tracking.",
      },
      { property: "og:title", content: "KrishiSlot — Fair Mandi Procurement Slot Booking" },
      {
        property: "og:description",
        content:
          "Book a mandi procurement slot without queues. Fair allocation, digital QR token, live procurement and payment status.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"farmer" | "staff">("farmer");
  const [aadhaar, setAadhaar] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [staffId, setStaffId] = useState("");
  const [pwd, setPwd] = useState("");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[460px] flex-col px-5 py-10">
        <div className="animate-rise">
          <div className="grid size-14 place-items-center rounded-xl bg-gradient-to-b from-chrome to-green font-display text-3xl leading-none text-primary-foreground">
            K
          </div>
          <h1 className="mt-5 font-display text-5xl leading-none tracking-tight">KRISHISLOT</h1>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Smart procurement slot booking · SIH26032
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            No queues, no first-come-first-serve. Requests are collected between 10:00 and 12:00 and
            allocated fairly using centre capacity, your waiting history and crop readiness.
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-surface p-5 ring-1 ring-border">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-background p-1 ring-1 ring-border">
            {(["farmer", "staff"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-lg py-2.5 font-mono text-[11px] uppercase tracking-wider ${
                  tab === t
                    ? "bg-gradient-to-b from-accent to-accent/80 font-bold text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {t === "farmer" ? "Farmer" : "Mandi staff"}
              </button>
            ))}
          </div>

          {tab === "farmer" ? (
            <div className="mt-5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Aadhaar number
              </label>
              <input
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
                inputMode="numeric"
                placeholder="XXXX XXXX 4417"
                className="mt-1.5 w-full rounded-lg bg-background px-3 py-3 font-mono text-sm ring-1 ring-border outline-none focus:ring-2 focus:ring-ring"
              />

              {otpSent ? (
                <div className="mt-4">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    OTP sent to {FARMER.mobile}
                  </label>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    inputMode="numeric"
                    placeholder="6-digit OTP"
                    className="mt-1.5 w-full rounded-lg bg-background px-3 py-3 font-mono text-sm tracking-[0.4em] ring-1 ring-border outline-none focus:ring-2 focus:ring-ring"
                  />
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Prototype: any 6 digits work. Real deployment uses authorised Aadhaar OTP and
                    land-record services.
                  </p>
                </div>
              ) : null}

              <button
                onClick={() => {
                  if (!otpSent) {
                    setOtpSent(true);
                    return;
                  }
                  store.setRole("farmer");
                  router.navigate({ to: "/dashboard" });
                }}
                className="mt-5 w-full rounded-xl bg-gradient-to-b from-accent to-accent/80 py-3.5 text-sm font-bold tracking-tight text-primary-foreground ring-1 ring-border"
              >
                {otpSent ? "Verify & continue" : "Send OTP"}
              </button>
            </div>
          ) : (
            <div className="mt-5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Staff ID
              </label>
              <input
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="NAN-CTR-014"
                className="mt-1.5 w-full rounded-lg bg-background px-3 py-3 font-mono text-sm ring-1 ring-border outline-none focus:ring-2 focus:ring-ring"
              />
              <label className="mt-4 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-lg bg-background px-3 py-3 font-mono text-sm ring-1 ring-border outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={() => {
                  store.setRole("staff");
                  router.navigate({ to: "/staff" });
                }}
                className="mt-5 w-full rounded-xl bg-gradient-to-b from-green to-green/80 py-3.5 text-sm font-bold tracking-tight text-primary-foreground ring-1 ring-border"
              >
                Open centre portal
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            ["Fair", "No queue priority"],
            ["Tracked", "Live status"],
            ["Paid", "Direct to bank"],
          ].map(([a, b]) => (
            <div key={a} className="rounded-xl bg-surface p-3 ring-1 ring-border">
              <div className="font-display text-xl leading-none">{a}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{b}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
