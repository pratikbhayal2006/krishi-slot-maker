import { Link, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { store } from "@/lib/krishislot";
import { useKrishi } from "./use-krishi";

const farmerNav = [
  { to: "/dashboard", label: "Home" },
  { to: "/book", label: "Book" },
  { to: "/token", label: "Token" },
  { to: "/tracking", label: "Track" },
] as const;

export function AppShell({
  children,
  subtitle = "Mandi · मंडी",
  nav = true,
}: {
  children: ReactNode;
  subtitle?: string;
  nav?: boolean;
}) {
  const { role } = useKrishi();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[460px] pb-24">
        <header className="flex items-center justify-between px-5 pt-5 pb-3">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-md bg-gradient-to-b from-chrome to-green font-display text-lg leading-none text-primary-foreground">
              K
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-bold">KrishiSlot</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {subtitle}
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                store.setRole(null);
                router.navigate({ to: "/" });
              }}
              className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              Sign out
            </button>
            <div className="grid size-9 place-items-center rounded-full bg-gradient-to-b from-accent to-green text-xs font-bold text-primary-foreground">
              {role === "staff" ? "MS" : "RN"}
            </div>
          </div>
        </header>

        {children}
      </div>

      {nav && role === "farmer" ? (
        <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-surface/95 backdrop-blur">
          <div className="mx-auto grid max-w-[460px] grid-cols-4">
            {farmerNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="py-3.5 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
                activeProps={{ className: "text-accent font-bold" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[15px] font-bold">{children}</h2>
      {aside}
    </div>
  );
}
