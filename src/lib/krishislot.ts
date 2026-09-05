/**
 * KrishiSlot prototype data layer.
 * Mock, in-memory + localStorage store — no backend. Mirrors the workflow:
 * Aadhaar OTP login -> land/crop -> booking request -> fairness allocation
 * -> date + distance batch -> QR token -> staff procurement -> payment.
 */

export type Role = "farmer" | "staff";

export type Land = {
  id: string;
  survey: string;
  village: string;
  acres: number;
  crop: string;
  cropHindi: string;
  eligibleQuintals: number;
  maturityDays: number; // days since crop became ready (higher = earlier ready)
};

export type Center = {
  id: string;
  name: string;
  district: string;
  distanceKm: number;
  dailyCapacity: Record<string, number>; // crop -> quintals/day
};

export type StatusKey =
  | "booked"
  | "confirmed"
  | "arrived"
  | "verified"
  | "weighed"
  | "quality"
  | "completed"
  | "payment_processing"
  | "payment_completed";

export const STATUS_ORDER: { key: StatusKey; label: string }[] = [
  { key: "booked", label: "Slot booked" },
  { key: "confirmed", label: "Slot confirmed" },
  { key: "arrived", label: "Farmer arrived" },
  { key: "verified", label: "Verification completed" },
  { key: "weighed", label: "Produce weighed" },
  { key: "quality", label: "Quality checked" },
  { key: "completed", label: "Procurement completed" },
  { key: "payment_processing", label: "Payment processing" },
  { key: "payment_completed", label: "Payment completed" },
];

export type Booking = {
  id: string;
  tokenId: string;
  farmerName: string;
  farmerId: string;
  landId: string;
  crop: string;
  cropHindi: string;
  quantity: number;
  preferences: string[]; // center ids in priority order
  submittedAt: string;
  allotted: boolean;
  centerId?: string;
  date?: string;
  batch?: string;
  slotNo?: number;
  status: StatusKey;
  history: { key: StatusKey; at: string }[];
  fairness: {
    waitingHistory: number;
    maturityScore: number;
    randomSeed: string;
    score: number;
  };
  procurement?: {
    actualQuantity: number;
    grade: string;
    ratePerQuintal: number;
    buyer: string;
    total: number;
  };
  payment?: {
    status: "pending" | "processing" | "paid";
    account: string;
    reference?: string;
    paidOn?: string;
  };
};

export const FARMER = {
  name: "Ramesh Nagre",
  initials: "RN",
  aadhaarMasked: "XXXX XXXX 4417",
  mobile: "+91 98XXX XX210",
  village: "Kandhar, Nanded",
  bankMasked: "SBIN0•••• ••••7742",
  waitingHistory: 2, // previously unsuccessful requests
};

export const LANDS: Land[] = [
  {
    id: "L1",
    survey: "Survey No. 218-B",
    village: "Kandhar",
    acres: 4.2,
    crop: "Wheat",
    cropHindi: "गेहूँ",
    eligibleQuintals: 40,
    maturityDays: 12,
  },
  {
    id: "L2",
    survey: "Survey No. 96-A",
    village: "Kandhar",
    acres: 2.6,
    crop: "Mustard",
    cropHindi: "सरसों",
    eligibleQuintals: 20,
    maturityDays: 4,
  },
  {
    id: "L3",
    survey: "Survey No. 311",
    village: "Barul",
    acres: 3.1,
    crop: "Wheat",
    cropHindi: "गेहूँ",
    eligibleQuintals: 30,
    maturityDays: 8,
  },
];

export const CENTERS: Center[] = [
  {
    id: "C1",
    name: "Nanded Central Mandi",
    district: "Nanded",
    distanceKm: 8,
    dailyCapacity: { Wheat: 300, Mustard: 120 },
  },
  {
    id: "C2",
    name: "Kandhar Procurement Centre",
    district: "Nanded",
    distanceKm: 14,
    dailyCapacity: { Wheat: 180, Mustard: 90 },
  },
  {
    id: "C3",
    name: "Loha APMC Yard",
    district: "Nanded",
    distanceKm: 22,
    dailyCapacity: { Wheat: 240, Mustard: 60 },
  },
  {
    id: "C4",
    name: "Mukhed Sub-Centre",
    district: "Nanded",
    distanceKm: 34,
    dailyCapacity: { Wheat: 150, Mustard: 80 },
  },
  {
    id: "C5",
    name: "Degloor Mandi",
    district: "Nanded",
    distanceKm: 47,
    dailyCapacity: { Wheat: 200, Mustard: 100 },
  },
];

export const BATCHES = ["08:00–10:00", "10:00–12:00", "12:00–14:00", "14:00–16:00", "16:00–18:00"];

export function centerById(id?: string) {
  return CENTERS.find((c) => c.id === id);
}

export function landById(id: string) {
  return LANDS.find((l) => l.id === id);
}

export function batchForDistance(km: number) {
  if (km <= 10) return BATCHES[0];
  if (km <= 20) return BATCHES[1];
  if (km <= 32) return BATCHES[2];
  if (km <= 45) return BATCHES[3];
  return BATCHES[4];
}

export function statusIndex(key: StatusKey) {
  return STATUS_ORDER.findIndex((s) => s.key === key);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export function rupees(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

/** Deterministic pseudo-QR matrix from a token id. */
export function qrMatrix(seed: string, size = 21): boolean[][] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };
  const grid: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => rand() > 0.5),
  );
  // finder patterns
  const finder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const edge = r === 0 || r === 6 || c === 0 || c === 6;
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[r0 + r][c0 + c] = edge || core;
      }
    }
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = r0 + r;
        const cc = c0 + c;
        if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
        if (r === -1 || r === 7 || c === -1 || c === 7) grid[rr][cc] = false;
      }
    }
  };
  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);
  return grid;
}

/* ------------------------------ store ------------------------------ */

type State = {
  role: Role | null;
  bookings: Booking[];
};

const KEY = "krishislot.v1";

function seedBooking(): Booking {
  const day = new Date();
  day.setDate(day.getDate() + 2);
  const center = CENTERS[0];
  return {
    id: "B-1001",
    tokenId: "KRSH-2026-8841",
    farmerName: FARMER.name,
    farmerId: FARMER.aadhaarMasked,
    landId: "L1",
    crop: "Wheat",
    cropHindi: "गेहूँ",
    quantity: 15,
    preferences: ["C1", "C2", "C3"],
    submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    allotted: true,
    centerId: center.id,
    date: day.toISOString(),
    batch: batchForDistance(center.distanceKm),
    slotNo: 4,
    status: "verified",
    history: [
      { key: "booked", at: new Date(Date.now() - 86400000 * 2).toISOString() },
      { key: "confirmed", at: new Date(Date.now() - 86400000 * 2 + 7200000).toISOString() },
      { key: "arrived", at: new Date(Date.now() - 3600000 * 3).toISOString() },
      { key: "verified", at: new Date(Date.now() - 3600000 * 2).toISOString() },
    ],
    fairness: {
      waitingHistory: 2,
      maturityScore: 12,
      randomSeed: "0.4471",
      score: 72,
    },
    payment: { status: "pending", account: FARMER.bankMasked },
  };
}

let state: State = { role: null, bookings: [seedBooking()] };
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw) as State;
  } catch {
    /* ignore */
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

export const store = {
  subscribe(l: () => void) {
    hydrate();
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get(): State {
    return state;
  },
  getServer(): State {
    return { role: null, bookings: [seedBooking()] };
  },
  setRole(role: Role | null) {
    state = { ...state, role };
    emit();
  },
  addBooking(b: Booking) {
    state = { ...state, bookings: [b, ...state.bookings] };
    emit();
  },
  update(id: string, patch: (b: Booking) => Booking) {
    state = {
      ...state,
      bookings: state.bookings.map((b) => (b.id === id ? patch(b) : b)),
    };
    emit();
  },
  advance(id: string, to: StatusKey) {
    store.update(id, (b) => {
      if (statusIndex(to) <= statusIndex(b.status)) return b;
      const added = STATUS_ORDER.slice(statusIndex(b.status) + 1, statusIndex(to) + 1).map((s) => ({
        key: s.key,
        at: new Date().toISOString(),
      }));
      return { ...b, status: to, history: [...b.history, ...added] };
    });
  },
  reset() {
    state = { role: state.role, bookings: [seedBooking()] };
    emit();
  },
};

/**
 * Fairness-based allocation (runs after the 12:00 PM window closes).
 * Date = capacity + centre preference + waiting history + crop maturity
 * + controlled randomization. Batch = distance only.
 */
export function runAllocation(input: {
  landId: string;
  quantity: number;
  preferences: string[];
}): Booking {
  const land = landById(input.landId)!;
  const waiting = FARMER.waitingHistory;
  const seedNum = Math.random();
  const score =
    waiting * 15 + Math.min(land.maturityDays, 20) * 2 + Math.round(seedNum * 20) + 30;

  // capacity check against the top preference, cascading down the list
  let chosen: Center | undefined;
  for (const pid of input.preferences) {
    const c = centerById(pid);
    if (!c) continue;
    const cap = c.dailyCapacity[land.crop] ?? 0;
    if (cap >= input.quantity) {
      chosen = c;
      break;
    }
  }
  const allotted = Boolean(chosen) && score > 45;

  const date = new Date();
  date.setDate(date.getDate() + (score > 80 ? 2 : score > 60 ? 4 : 6));

  const n = Math.floor(Math.random() * 900 + 100);
  const now = new Date().toISOString();

  return {
    id: "B-" + n,
    tokenId: "KRSH-2026-" + n + "" + Math.floor(Math.random() * 9),
    farmerName: FARMER.name,
    farmerId: FARMER.aadhaarMasked,
    landId: land.id,
    crop: land.crop,
    cropHindi: land.cropHindi,
    quantity: input.quantity,
    preferences: input.preferences,
    submittedAt: now,
    allotted,
    centerId: allotted ? chosen!.id : undefined,
    date: allotted ? date.toISOString() : undefined,
    batch: allotted ? batchForDistance(chosen!.distanceKm) : undefined,
    slotNo: allotted ? Math.floor(Math.random() * 60 + 1) : undefined,
    status: "booked",
    history: [{ key: "booked", at: now }],
    fairness: {
      waitingHistory: waiting,
      maturityScore: land.maturityDays,
      randomSeed: seedNum.toFixed(4),
      score,
    },
    payment: { status: "pending", account: FARMER.bankMasked },
  };
}

export function useStore() {
  return store;
}
