import { apiFetch } from "@/lib/api";

/**
 * Storage settings API helper.
 *
 * Contract (from backend teammate):
 *   GET  /admin/settings/storage       → StorageSettingsResponse
 *   PUT  /admin/settings/storage       → StorageSettingsResponse
 *   POST /admin/settings/storage/test  → StorageTestResponse
 *
 * Secrets are returned redacted from GET (last 4 chars, e.g. "****abcd").
 * When updating, the client sends only user-modified secret fields — leaving
 * a redacted placeholder untouched means "keep current value" on the server.
 */

export type StorageProvider = "MINIO" | "CLOUDFLARE_R2";

export interface MinioConfig {
    endpoint: string;
    port: number;
    useSSL: boolean;
    accessKey: string;
    secretKey: string;
    bucket: string;
}

export interface CloudflareR2Config {
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    publicUrl: string;
    /** Optional directory prefix prepended to every object key */
    directory?: string;
}

export type StorageConfig = MinioConfig | CloudflareR2Config;

export interface StorageSettingsResponse {
    provider: StorageProvider;
    config: Partial<MinioConfig> & Partial<CloudflareR2Config>;
    updatedAt: string;
    updatedBy?: string;
}

export interface StorageTestResponse {
    ok: boolean;
    message: string;
    latencyMs: number;
}

export interface StorageSettingsInput {
    provider: StorageProvider;
    config: Partial<MinioConfig> & Partial<CloudflareR2Config>;
}

export async function getStorageSettings(): Promise<StorageSettingsResponse> {
    return apiFetch("/admin/settings/storage");
}

export async function updateStorageSettings(
    body: StorageSettingsInput,
): Promise<StorageSettingsResponse> {
    return apiFetch("/admin/settings/storage", {
        method: "PUT",
        body: JSON.stringify(body),
    });
}

export async function testStorageConnection(
    body: StorageSettingsInput,
): Promise<StorageTestResponse> {
    return apiFetch("/admin/settings/storage/test", {
        method: "POST",
        body: JSON.stringify(body),
    });
}

/**
 * Heuristic to detect a redacted-secret placeholder returned by GET.
 * The backend returns secrets as `"****abcd"` — four stars + last 4 chars.
 */
export function isRedactedSecret(value: string | undefined | null): boolean {
    if (!value) return false;
    return /^\*{2,}[A-Za-z0-9+/=_-]{0,8}$/.test(value);
}
