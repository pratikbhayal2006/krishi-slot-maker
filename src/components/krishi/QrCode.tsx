import { qrMatrix } from "@/lib/krishislot";

export function QrCode({
  value,
  className = "size-24",
  scan = true,
}: {
  value: string;
  className?: string;
  scan?: boolean;
}) {
  const grid = qrMatrix(value);
  const size = grid.length;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg bg-surface p-2 ring-1 ring-border ${className}`}
    >
      <div
        className="grid size-full gap-[1px]"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0,1fr))` }}
        aria-label={`QR code for token ${value}`}
        role="img"
      >
        {grid.flatMap((row, r) =>
          row.map((on, c) => (
            <span key={`${r}-${c}`} className={on ? "bg-foreground" : "bg-transparent"} />
          )),
        )}
      </div>
      {scan ? (
        <div className="pointer-events-none absolute inset-x-0 h-6 animate-scanline bg-gradient-to-b from-transparent via-chrome/60 to-transparent" />
      ) : null}
    </div>
  );
}
