/**
 * Listing draft persistence — lets a guest fill the entire /sell form
 * (incl. photos), log in at the publish step, and have the draft survive even
 * a full-page OAuth redirect (Facebook/Google/LINE), then resume seamlessly.
 *
 * Split storage:
 *  - TEXT  → sessionStorage (JSON, small, synchronous, survives same-tab nav)
 *  - FILES → IndexedDB (photos / docs are large binary; sessionStorage too
 *            small). IndexedDB stores File/Blob directly via structured clone.
 *
 * Everything is best-effort with try/catch — if IndexedDB is blocked (e.g.
 * a locked-down in-app webview) the text draft still works and the resume
 * UI degrades gracefully (asks the user to re-attach photos).
 *
 * TTL: drafts older than 24h are ignored so stale data never resurrects.
 */
import type { ListingFormData } from "@/contexts/ListingContext";

const TEXT_KEY = "c2h_listing_draft_v1";
const RESUME_KEY = "c2h_listing_resume";
const RETURN_TO_KEY = "c2h_post_login_return_to";
const TTL_MS = 24 * 60 * 60 * 1000;

/** Fields that hold File objects / blob: preview URLs — never go to JSON. */
const FILE_FIELDS = [
  "images",
  "imagesPreviews",
  "serviceHistoryFile",
  "serviceHistoryPreview",
  "registrationBookFile",
  "registrationBookPreview",
] as const;

export type TextDraft = Omit<ListingFormData, (typeof FILE_FIELDS)[number]>;

export interface ImageDraft {
  images: File[];
  serviceHistoryFile?: File;
  registrationBookFile?: File;
}

/* ── TEXT DRAFT (sessionStorage) ─────────────────────────────────── */

export function saveTextDraft(formData: ListingFormData): void {
  if (typeof window === "undefined") return;
  try {
    const clone: Record<string, unknown> = { ...formData };
    for (const f of FILE_FIELDS) delete clone[f];
    sessionStorage.setItem(
      TEXT_KEY,
      JSON.stringify({ savedAt: Date.now(), data: clone })
    );
  } catch {
    /* quota / disabled storage — ignore */
  }
}

export function loadTextDraft(): Partial<ListingFormData> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(TEXT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { savedAt: number; data: Partial<ListingFormData> };
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > TTL_MS) {
      sessionStorage.removeItem(TEXT_KEY);
      return null;
    }
    return parsed.data || null;
  } catch {
    return null;
  }
}

export function hasTextDraft(): boolean {
  return loadTextDraft() !== null;
}

/* ── IMAGE DRAFT (IndexedDB) ─────────────────────────────────────── */

const DB_NAME = "c2h_listing_draft";
const STORE = "files";
const RECORD_KEY = "current";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("no-indexeddb"));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("idb-open-failed"));
  });
}

export async function saveImageDraft(draft: ImageDraft): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(
        {
          savedAt: Date.now(),
          images: draft.images,
          serviceHistoryFile: draft.serviceHistoryFile,
          registrationBookFile: draft.registrationBookFile,
        },
        RECORD_KEY
      );
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("idb-write-failed"));
    });
    db.close();
  } catch {
    /* IndexedDB unavailable — text draft still covers the rest */
  }
}

export async function loadImageDraft(): Promise<ImageDraft | null> {
  try {
    const db = await openDb();
    const rec = await new Promise<{
      savedAt: number;
      images: File[];
      serviceHistoryFile?: File;
      registrationBookFile?: File;
    } | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const r = tx.objectStore(STORE).get(RECORD_KEY);
      r.onsuccess = () => resolve(r.result ?? null);
      r.onerror = () => reject(r.error ?? new Error("idb-read-failed"));
    });
    db.close();
    if (!rec || !rec.savedAt || Date.now() - rec.savedAt > TTL_MS) return null;
    return {
      images: rec.images || [],
      serviceHistoryFile: rec.serviceHistoryFile,
      registrationBookFile: rec.registrationBookFile,
    };
  } catch {
    return null;
  }
}

async function clearImageDraft(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(RECORD_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    db.close();
  } catch {
    /* ignore */
  }
}

/* ── RESUME + RETURN-TO FLAGS ────────────────────────────────────── */

/** Marks "guest pressed publish → after login, auto-open the confirm". */
export function setResumeFlag(): void {
  try {
    sessionStorage.setItem(RESUME_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function getResumeFlag(): boolean {
  try {
    return sessionStorage.getItem(RESUME_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearResumeFlag(): void {
  try {
    sessionStorage.removeItem(RESUME_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Post-login return path — survives the full-page OAuth redirect so the
 * social-login callbacks can send the user back to the form instead of the
 * dashboard. Generic on purpose (only the sell flow uses it today).
 */
export function setReturnTo(path: string): void {
  try {
    sessionStorage.setItem(RETURN_TO_KEY, path);
  } catch {
    /* ignore */
  }
}

export function peekReturnTo(): string | null {
  try {
    return sessionStorage.getItem(RETURN_TO_KEY);
  } catch {
    return null;
  }
}

export function consumeReturnTo(): string | null {
  try {
    const v = sessionStorage.getItem(RETURN_TO_KEY);
    if (v) sessionStorage.removeItem(RETURN_TO_KEY);
    return v;
  } catch {
    return null;
  }
}

/* ── CLEAR ALL ───────────────────────────────────────────────────── */

export async function clearListingDraft(): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(TEXT_KEY);
      sessionStorage.removeItem(RESUME_KEY);
    } catch {
      /* ignore */
    }
  }
  await clearImageDraft();
}
