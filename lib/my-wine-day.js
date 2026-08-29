const VERSION = 1;
export const MY_WINE_LAST_KEY = "tcwine:my-wine-day:last:v1";
export const MY_WINE_SAVED_KEY = "tcwine:my-wine-day:saved:v1";
export const MY_WINE_FRAGMENT_PREFIX = "#plan=";
export const MAX_SAVED_WINE_DAYS = 6;
export const MAX_SELECTED_STOPS = 12;

const AREAS = new Set(["any", "leelanau", "old-mission", "traverse-city"]);
const PACES = new Set(["leisurely", "standard", "efficient"]);
const BEVERAGES = new Set(["wine", "cider", "beer", "spirits", "mead"]);
const POI_KINDS = new Set(["beach", "hike", "scenic", "lighthouse", "town"]);

function uniq(list) {
  return [...new Set(list)];
}

function safeString(value, max = 80) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const d = new Date(value + "T12:00:00");
  return Number.isNaN(d.getTime()) ? "" : value;
}

function validTime(value, fallback) {
  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) return fallback;
  const [h, m] = value.split(":").map(Number);
  if (h < 0 || h > 24 || m < 0 || m > 59 || (h === 24 && m !== 0)) return fallback;
  return value;
}

function cleanSlugList(values, allowed) {
  if (!Array.isArray(values)) return [];
  return uniq(
    values
      .map((v) => safeString(v, 48))
      .filter((v) => v && (!allowed || allowed.has(v)))
  );
}

function cleanSelected(values, validIds) {
  if (!Array.isArray(values)) return [];
  return uniq(
    values
      .map((v) => safeString(v, 80))
      .filter((v) => v && (!validIds || validIds.has(v)))
  ).slice(0, MAX_SELECTED_STOPS);
}

export function normalizeWinePlan(raw, options = {}) {
  if (!raw || typeof raw !== "object") return null;
  const validOrigins = options.validOrigins ? new Set(options.validOrigins) : null;
  const validIds = options.validIds ? new Set(options.validIds) : null;
  const originCandidate = safeString(raw.origin, 80);
  const origin = validOrigins && validOrigins.has(originCandidate)
    ? originCandidate
    : options.defaultOrigin || (validOrigins ? [...validOrigins][0] || "" : originCandidate);

  const selected = cleanSelected(raw.selected, validIds);
  if (!origin || !selected.length) return null;

  const date = validDate(raw.date) || options.defaultDate || new Date().toISOString().slice(0, 10);
  const start = validTime(raw.start, "11:00");
  const doneBy = raw.doneBy === "" ? "" : validTime(raw.doneBy, "18:00");

  return {
    version: VERSION,
    origin,
    date,
    start,
    doneBy,
    pace: PACES.has(raw.pace) ? raw.pace : "standard",
    dd: Boolean(raw.dd),
    area: AREAS.has(raw.area) ? raw.area : "any",
    beverages: cleanSlugList(raw.beverages, BEVERAGES),
    styles: cleanSlugList(raw.styles, null).slice(0, 12),
    poiKinds: cleanSlugList(raw.poiKinds, POI_KINDS),
    selected,
  };
}

function bytesToBase64(bytes) {
  if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  if (typeof Buffer !== "undefined") return new Uint8Array(Buffer.from(value, "base64"));
  const binary = atob(value);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function toBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4 || 4)) % 4);
  return new TextDecoder().decode(base64ToBytes(padded));
}

export function encodeWinePlan(raw, options = {}) {
  const plan = normalizeWinePlan(raw, options);
  if (!plan) return "";
  return toBase64Url(JSON.stringify({
    v: VERSION,
    o: plan.origin,
    d: plan.date,
    s: plan.start,
    e: plan.doneBy,
    p: plan.pace,
    x: plan.dd ? 1 : 0,
    a: plan.area,
    b: plan.beverages,
    y: plan.styles,
    k: plan.poiKinds,
    i: plan.selected,
  }));
}

export function decodeWinePlan(value, options = {}) {
  if (typeof value !== "string" || !value || value.length > 6000) return null;
  try {
    const raw = JSON.parse(fromBase64Url(value));
    if (!raw || Number(raw.v) !== VERSION) return null;
    return normalizeWinePlan({
      origin: raw.o,
      date: raw.d,
      start: raw.s,
      doneBy: raw.e,
      pace: raw.p,
      dd: raw.x === 1,
      area: raw.a,
      beverages: raw.b,
      styles: raw.y,
      poiKinds: raw.k,
      selected: raw.i,
    }, options);
  } catch {
    return null;
  }
}

export function readWinePlanFromHash(hash, options = {}) {
  if (typeof hash !== "string" || !hash.startsWith(MY_WINE_FRAGMENT_PREFIX)) return null;
  return decodeWinePlan(hash.slice(MY_WINE_FRAGMENT_PREFIX.length), options);
}

export function buildWinePlanHash(raw, options = {}) {
  const encoded = encodeWinePlan(raw, options);
  return encoded ? MY_WINE_FRAGMENT_PREFIX + encoded : "";
}

function fnv1a(input) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

export function winePlanFingerprint(raw, options = {}) {
  const plan = normalizeWinePlan(raw, options);
  if (!plan) return "";
  return fnv1a(JSON.stringify(plan));
}

export function upsertSavedWinePlan(existing, raw, options = {}) {
  const plan = normalizeWinePlan(raw, options);
  if (!plan) return Array.isArray(existing) ? existing.slice(0, MAX_SAVED_WINE_DAYS) : [];

  const savedAt = options.now || new Date().toISOString();
  const id = "wine-" + winePlanFingerprint(plan, options);
  const candidate = { id, savedAt, plan };

  const cleaned = (Array.isArray(existing) ? existing : [])
    .map((entry) => {
      const normalized = normalizeWinePlan(entry?.plan, options);
      if (!normalized) return null;
      return {
        id: safeString(entry.id, 80) || "wine-" + winePlanFingerprint(normalized, options),
        savedAt: typeof entry.savedAt === "string" ? entry.savedAt : "",
        plan: normalized,
      };
    })
    .filter(Boolean)
    .filter((entry) => entry.id !== id);

  return [candidate, ...cleaned].slice(0, MAX_SAVED_WINE_DAYS);
}

export function removeSavedWinePlan(existing, id) {
  return (Array.isArray(existing) ? existing : []).filter((entry) => entry?.id !== id);
}

export function wineStopCountBucket(count) {
  const n = Number(count) || 0;
  if (n <= 0) return "0";
  if (n <= 2) return "1-2";
  if (n <= 4) return "3-4";
  if (n <= 6) return "5-6";
  return "7+";
}

export function winePlanLabel(raw, options = {}) {
  const plan = normalizeWinePlan(raw, options);
  if (!plan) return "Saved wine day";
  const when = new Date(plan.date + "T12:00:00");
  const dateLabel = Number.isNaN(when.getTime())
    ? plan.date
    : when.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const areaLabel = plan.area === "old-mission"
    ? "Old Mission"
    : plan.area === "leelanau"
      ? "Leelanau"
      : plan.area === "traverse-city"
        ? "Traverse City"
        : "Wine country";
  return `${dateLabel} · ${areaLabel} · ${plan.selected.length} stop${plan.selected.length === 1 ? "" : "s"}`;
}

export function readLocalWinePlans(storage, options = {}) {
  if (!storage) return [];
  try {
    const parsed = JSON.parse(storage.getItem(MY_WINE_SAVED_KEY) || "[]");
    return (Array.isArray(parsed) ? parsed : [])
      .map((entry) => {
        const plan = normalizeWinePlan(entry?.plan, options);
        if (!plan) return null;
        return {
          id: safeString(entry.id, 80) || "wine-" + winePlanFingerprint(plan, options),
          savedAt: typeof entry.savedAt === "string" ? entry.savedAt : "",
          plan,
        };
      })
      .filter(Boolean)
      .slice(0, MAX_SAVED_WINE_DAYS);
  } catch {
    return [];
  }
}

export function writeLocalWinePlans(storage, entries) {
  if (!storage) return false;
  try {
    storage.setItem(MY_WINE_SAVED_KEY, JSON.stringify((Array.isArray(entries) ? entries : []).slice(0, MAX_SAVED_WINE_DAYS)));
    return true;
  } catch {
    return false;
  }
}

export function readLastWinePlan(storage, options = {}) {
  if (!storage) return null;
  try {
    return normalizeWinePlan(JSON.parse(storage.getItem(MY_WINE_LAST_KEY) || "null"), options);
  } catch {
    return null;
  }
}

export function writeLastWinePlan(storage, raw, options = {}) {
  if (!storage) return false;
  const plan = normalizeWinePlan(raw, options);
  if (!plan) return false;
  try {
    storage.setItem(MY_WINE_LAST_KEY, JSON.stringify(plan));
    return true;
  } catch {
    return false;
  }
}
