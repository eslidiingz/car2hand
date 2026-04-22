"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    HardDrive,
    Cloud,
    Database,
    Eye,
    EyeOff,
    Loader2,
    Save,
    RotateCcw,
    CheckCircle2,
    AlertTriangle,
    PlugZap,
    Clock,
    User as UserIcon,
    Info,
    XCircle,
} from "lucide-react";

import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
    type CloudflareR2Config,
    type MinioConfig,
    type StorageProvider,
    type StorageSettingsResponse,
    type StorageTestResponse,
    getStorageSettings,
    isRedactedSecret,
    testStorageConnection,
    updateStorageSettings,
} from "@/lib/storageSettings";

// ---------------------------------------------------------------------------
// Helpers & defaults
// ---------------------------------------------------------------------------

type MinioFormState = {
    endpoint: string;
    port: string;
    useSSL: boolean;
    accessKey: string;
    secretKey: string;
    bucket: string;
};

type R2FormState = {
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    publicUrl: string;
    directory: string;
};

const DEFAULT_MINIO: MinioFormState = {
    endpoint: "",
    port: "9000",
    useSSL: false,
    accessKey: "",
    secretKey: "",
    bucket: "",
};

const DEFAULT_R2: R2FormState = {
    endpoint: "",
    accessKeyId: "",
    secretAccessKey: "",
    bucket: "",
    publicUrl: "",
    directory: "",
};

type SecretField = "accessKey" | "secretKey" | "accessKeyId" | "secretAccessKey";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function StorageSettingsForm() {
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [activeProvider, setActiveProvider] = useState<StorageProvider>("MINIO");
    const [serverProvider, setServerProvider] = useState<StorageProvider>("MINIO");
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);
    const [updatedBy, setUpdatedBy] = useState<string | null>(null);

    const [minio, setMinio] = useState<MinioFormState>(DEFAULT_MINIO);
    const [r2, setR2] = useState<R2FormState>(DEFAULT_R2);

    // Original (loaded) state — used for dirty-check & cancel-reset
    const [initialMinio, setInitialMinio] = useState<MinioFormState>(DEFAULT_MINIO);
    const [initialR2, setInitialR2] = useState<R2FormState>(DEFAULT_R2);
    const [initialProvider, setInitialProvider] = useState<StorageProvider>("MINIO");

    // Track which redacted secret fields the admin has explicitly cleared
    // (i.e. focused, which means the new value — even empty — should be sent)
    const [touchedSecrets, setTouchedSecrets] = useState<Record<SecretField, boolean>>({
        accessKey: false,
        secretKey: false,
        accessKeyId: false,
        secretAccessKey: false,
    });

    // UI state
    const [showSecrets, setShowSecrets] = useState<Record<SecretField, boolean>>({
        accessKey: false,
        secretKey: false,
        accessKeyId: false,
        secretAccessKey: false,
    });
    const [testing, setTesting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testResult, setTestResult] = useState<StorageTestResponse | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    // ---------------------------------------------------------------------
    // Load initial settings
    // ---------------------------------------------------------------------

    const applyLoaded = useCallback((data: StorageSettingsResponse) => {
        setServerProvider(data.provider);
        setActiveProvider(data.provider);
        setInitialProvider(data.provider);
        setUpdatedAt(data.updatedAt);
        setUpdatedBy(data.updatedBy ?? null);

        if (data.provider === "MINIO") {
            const cfg = (data.config ?? {}) as Partial<MinioConfig>;
            const next: MinioFormState = {
                endpoint: cfg.endpoint ?? "",
                port: cfg.port != null ? String(cfg.port) : "9000",
                useSSL: cfg.useSSL ?? false,
                accessKey: cfg.accessKey ?? "",
                secretKey: cfg.secretKey ?? "",
                bucket: cfg.bucket ?? "",
            };
            setMinio(next);
            setInitialMinio(next);
            setR2(DEFAULT_R2);
            setInitialR2(DEFAULT_R2);
        } else {
            const cfg = (data.config ?? {}) as Partial<CloudflareR2Config>;
            const next: R2FormState = {
                endpoint: cfg.endpoint ?? "",
                accessKeyId: cfg.accessKeyId ?? "",
                secretAccessKey: cfg.secretAccessKey ?? "",
                bucket: cfg.bucket ?? "",
                publicUrl: cfg.publicUrl ?? "",
                directory: cfg.directory ?? "",
            };
            setR2(next);
            setInitialR2(next);
            setMinio(DEFAULT_MINIO);
            setInitialMinio(DEFAULT_MINIO);
        }

        setTouchedSecrets({
            accessKey: false,
            secretKey: false,
            accessKeyId: false,
            secretAccessKey: false,
        });
        setTestResult(null);
    }, []);

    const loadSettings = useCallback(async () => {
        setInitialLoading(true);
        setLoadError(null);
        try {
            const data = await getStorageSettings();
            applyLoaded(data);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "ไม่สามารถโหลดการตั้งค่าที่เก็บไฟล์ได้";
            setLoadError(message);
        } finally {
            setInitialLoading(false);
        }
    }, [applyLoaded]);

    useEffect(() => {
        void loadSettings();
    }, [loadSettings]);

    // ---------------------------------------------------------------------
    // Derived: is form dirty?
    // ---------------------------------------------------------------------

    const isDirty = useMemo(() => {
        if (activeProvider !== initialProvider) return true;
        if (activeProvider === "MINIO") {
            return (
                minio.endpoint !== initialMinio.endpoint ||
                minio.port !== initialMinio.port ||
                minio.useSSL !== initialMinio.useSSL ||
                minio.accessKey !== initialMinio.accessKey ||
                minio.secretKey !== initialMinio.secretKey ||
                minio.bucket !== initialMinio.bucket
            );
        }
        return (
            r2.endpoint !== initialR2.endpoint ||
            r2.accessKeyId !== initialR2.accessKeyId ||
            r2.secretAccessKey !== initialR2.secretAccessKey ||
            r2.bucket !== initialR2.bucket ||
            r2.publicUrl !== initialR2.publicUrl ||
            r2.directory !== initialR2.directory
        );
    }, [
        activeProvider,
        initialProvider,
        minio,
        initialMinio,
        r2,
        initialR2,
    ]);

    // ---------------------------------------------------------------------
    // Secret-field handlers
    // ---------------------------------------------------------------------

    const handleSecretFocus = (field: SecretField) => {
        // First focus on a redacted field clears it and marks it as changed.
        if (field === "accessKey") {
            if (!touchedSecrets.accessKey && isRedactedSecret(minio.accessKey)) {
                setMinio((prev) => ({ ...prev, accessKey: "" }));
            }
        } else if (field === "secretKey") {
            if (!touchedSecrets.secretKey && isRedactedSecret(minio.secretKey)) {
                setMinio((prev) => ({ ...prev, secretKey: "" }));
            }
        } else if (field === "accessKeyId") {
            if (!touchedSecrets.accessKeyId && isRedactedSecret(r2.accessKeyId)) {
                setR2((prev) => ({ ...prev, accessKeyId: "" }));
            }
        } else if (field === "secretAccessKey") {
            if (
                !touchedSecrets.secretAccessKey &&
                isRedactedSecret(r2.secretAccessKey)
            ) {
                setR2((prev) => ({ ...prev, secretAccessKey: "" }));
            }
        }
        setTouchedSecrets((prev) => ({ ...prev, [field]: true }));
    };

    // ---------------------------------------------------------------------
    // Build payloads
    // ---------------------------------------------------------------------

    /**
     * Build the config payload to send to PUT / POST.
     *
     * UX choice — redacted secrets: we DO NOT send a secret field if the
     * admin hasn't touched it AND the displayed value still matches the
     * redacted placeholder returned by the server. The backend treats a
     * missing secret as "keep existing value", so the admin can tweak the
     * endpoint without re-entering every key.
     */
    const buildPayload = useCallback(() => {
        if (activeProvider === "MINIO") {
            const config: Partial<MinioConfig> = {
                endpoint: minio.endpoint.trim(),
                port: Number.parseInt(minio.port, 10) || 9000,
                useSSL: minio.useSSL,
                bucket: minio.bucket.trim(),
            };
            // Only include access/secret if touched (or we've switched provider)
            const providerChanged = activeProvider !== initialProvider;
            if (providerChanged || touchedSecrets.accessKey) {
                config.accessKey = minio.accessKey;
            }
            if (providerChanged || touchedSecrets.secretKey) {
                config.secretKey = minio.secretKey;
            }
            return { provider: "MINIO" as const, config };
        }

        const config: Partial<CloudflareR2Config> = {
            endpoint: r2.endpoint.trim(),
            bucket: r2.bucket.trim(),
            publicUrl: r2.publicUrl.trim(),
            directory: r2.directory.trim(),
        };
        const providerChanged = activeProvider !== initialProvider;
        if (providerChanged || touchedSecrets.accessKeyId) {
            config.accessKeyId = r2.accessKeyId;
        }
        if (providerChanged || touchedSecrets.secretAccessKey) {
            config.secretAccessKey = r2.secretAccessKey;
        }
        return { provider: "CLOUDFLARE_R2" as const, config };
    }, [activeProvider, initialProvider, minio, r2, touchedSecrets]);

    // ---------------------------------------------------------------------
    // Actions
    // ---------------------------------------------------------------------

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const result = await testStorageConnection(buildPayload());
            setTestResult(result);
            if (result.ok) {
                toast.success(`เชื่อมต่อสำเร็จ (${result.latencyMs} ms)`);
            } else {
                toast.error(result.message || "ทดสอบการเชื่อมต่อล้มเหลว");
            }
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "ทดสอบการเชื่อมต่อล้มเหลว";
            setTestResult({ ok: false, message, latencyMs: 0 });
            toast.error(message);
        } finally {
            setTesting(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const data = await updateStorageSettings(buildPayload());
            applyLoaded(data);
            toast.success("บันทึกการตั้งค่าที่เก็บไฟล์เรียบร้อย");
            setConfirmOpen(false);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "ไม่สามารถบันทึกได้";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setActiveProvider(initialProvider);
        setMinio(initialMinio);
        setR2(initialR2);
        setTouchedSecrets({
            accessKey: false,
            secretKey: false,
            accessKeyId: false,
            secretAccessKey: false,
        });
        setTestResult(null);
    };

    // ---------------------------------------------------------------------
    // Render helpers
    // ---------------------------------------------------------------------

    const formattedUpdatedAt = updatedAt
        ? new Date(updatedAt).toLocaleString("th-TH", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })
        : "—";

    const providerBadgeLabel =
        serverProvider === "MINIO" ? "MinIO" : "Cloudflare R2";

    // ---------------------------------------------------------------------
    // Loading / error states
    // ---------------------------------------------------------------------

    if (initialLoading) {
        return (
            <DashboardLayout>
                <PageHeader />
                <div className="rounded-3xl border border-border bg-card p-12 flex flex-col items-center justify-center shadow-sm">
                    <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                    <p className="text-sm text-muted-foreground">
                        กำลังโหลดการตั้งค่า...
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    if (loadError) {
        return (
            <DashboardLayout>
                <PageHeader />
                <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">
                                โหลดการตั้งค่าไม่สำเร็จ
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {loadError}
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => void loadSettings()}
                                className="rounded-xl"
                            >
                                <RotateCcw size={14} /> ลองอีกครั้ง
                            </Button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // ---------------------------------------------------------------------
    // Main render
    // ---------------------------------------------------------------------

    return (
        <DashboardLayout>
            <PageHeader />

            {/* Status strip — current active provider */}
            <div className="mb-6 rounded-3xl border border-border bg-card shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                            serverProvider === "MINIO"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-orange-500/10 text-orange-600",
                        )}
                    >
                        {serverProvider === "MINIO" ? (
                            <Database size={18} />
                        ) : (
                            <Cloud size={18} />
                        )}
                    </div>
                    <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            ใช้งานอยู่
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                            {providerBadgeLabel}
                        </p>
                    </div>
                </div>

                <div className="hidden sm:block h-8 w-px bg-border" />

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <Clock size={13} />
                        อัปเดตล่าสุด {formattedUpdatedAt}
                    </span>
                    {updatedBy && (
                        <span className="flex items-center gap-1.5">
                            <UserIcon size={13} />
                            โดย {updatedBy}
                        </span>
                    )}
                </div>
            </div>

            {/* Provider tabs (Main tabs pattern — with icon) */}
            <Tabs
                value={activeProvider}
                onValueChange={(v) => {
                    setActiveProvider(v as StorageProvider);
                    setTestResult(null);
                }}
                className="mb-6"
            >
                <TabsList>
                    <TabsTrigger value="MINIO">
                        <Database size={14} className="mr-1.5" />
                        MinIO
                    </TabsTrigger>
                    <TabsTrigger value="CLOUDFLARE_R2">
                        <Cloud size={14} className="mr-1.5" />
                        Cloudflare R2
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Provider form card */}
            <Card className="rounded-3xl border-border shadow-sm hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        {activeProvider === "MINIO" ? (
                            <Database size={18} className="text-primary" />
                        ) : (
                            <Cloud size={18} className="text-primary" />
                        )}
                        {activeProvider === "MINIO"
                            ? "การตั้งค่า MinIO"
                            : "การตั้งค่า Cloudflare R2"}
                    </CardTitle>
                    <CardDescription>
                        {activeProvider === "MINIO"
                            ? "MinIO คือที่เก็บไฟล์แบบ self-hosted ที่เข้ากันได้กับ S3 — เหมาะสำหรับการใช้งานบน server ของคุณเอง"
                            : "Cloudflare R2 เป็นที่เก็บไฟล์แบบ object storage ของ Cloudflare — ค่าใช้จ่ายในการดึงข้อมูล (egress) ฟรี"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                    {activeProvider === "MINIO" ? (
                        <MinioFields
                            value={minio}
                            onChange={setMinio}
                            showSecrets={showSecrets}
                            onToggleSecret={(f) =>
                                setShowSecrets((s) => ({ ...s, [f]: !s[f] }))
                            }
                            onSecretFocus={handleSecretFocus}
                        />
                    ) : (
                        <R2Fields
                            value={r2}
                            onChange={setR2}
                            showSecrets={showSecrets}
                            onToggleSecret={(f) =>
                                setShowSecrets((s) => ({ ...s, [f]: !s[f] }))
                            }
                            onSecretFocus={handleSecretFocus}
                        />
                    )}

                    {/* Test result */}
                    {testResult && (
                        <div
                            className={cn(
                                "rounded-2xl border p-4 flex items-start gap-3",
                                testResult.ok
                                    ? "border-emerald-500/30 bg-emerald-500/5"
                                    : "border-destructive/30 bg-destructive/5",
                            )}
                        >
                            {testResult.ok ? (
                                <CheckCircle2
                                    size={18}
                                    className="text-emerald-600 flex-shrink-0 mt-0.5"
                                />
                            ) : (
                                <XCircle
                                    size={18}
                                    className="text-destructive flex-shrink-0 mt-0.5"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">
                                    {testResult.ok
                                        ? "เชื่อมต่อสำเร็จ"
                                        : "เชื่อมต่อไม่สำเร็จ"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5 break-words">
                                    {testResult.message}
                                    {testResult.ok && (
                                        <>
                                            {" "}
                                            · latency {testResult.latencyMs} ms
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Info banner — storage switch warning */}
                    {activeProvider !== initialProvider && (
                        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
                            <Info
                                size={18}
                                className="text-amber-600 flex-shrink-0 mt-0.5"
                            />
                            <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                                <p className="font-semibold mb-0.5">
                                    คุณกำลังเปลี่ยนผู้ให้บริการที่เก็บไฟล์
                                </p>
                                <p>
                                    ไฟล์ที่อัปโหลดหลังจากนี้จะบันทึกลงที่ใหม่
                                    ไฟล์เก่าจะยังคงอยู่ที่เดิม —
                                    ควรย้ายไฟล์ด้วยตนเองหากจำเป็น
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action row */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
                <Button
                    variant="ghost"
                    onClick={handleReset}
                    disabled={!isDirty || saving || testing}
                    className="rounded-xl font-medium sm:mr-auto"
                >
                    <RotateCcw size={14} /> ยกเลิกการแก้ไข
                </Button>

                <Button
                    variant="outline"
                    onClick={() => void handleTest()}
                    disabled={testing || saving}
                    className="rounded-xl font-medium"
                >
                    {testing ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            ...กำลังทดสอบ
                        </>
                    ) : (
                        <>
                            <PlugZap size={14} /> ทดสอบการเชื่อมต่อ
                        </>
                    )}
                </Button>

                <Button
                    onClick={() => setConfirmOpen(true)}
                    disabled={!isDirty || saving || testing}
                    className="rounded-xl font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    <Save size={14} /> บันทึก
                </Button>
            </div>

            {/* Confirm save dialog */}
            <Dialog
                open={confirmOpen}
                onOpenChange={(open) => {
                    if (!saving) setConfirmOpen(open);
                }}
            >
                <DialogContent className="rounded-3xl sm:max-w-md">
                    <DialogHeader>
                        <div className="h-11 w-11 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </div>
                        <DialogTitle>ยืนยันการเปลี่ยนที่เก็บไฟล์</DialogTitle>
                        <DialogDescription className="leading-relaxed">
                            การบันทึกจะมีผลกับการอัปโหลดไฟล์ทุกประเภททันที
                            (ประกาศขายรถ, รูปโรงรถ, สลิป, เอกสาร KYC ฯลฯ)
                            คุณแน่ใจหรือไม่ว่าได้ทดสอบการเชื่อมต่อเรียบร้อยแล้ว?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmOpen(false)}
                            disabled={saving}
                            className="rounded-xl"
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={() => void handleSave()}
                            disabled={saving}
                            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {saving ? (
                                <>
                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />
                                    ...กำลังบันทึก
                                </>
                            ) : (
                                <>
                                    <Save size={14} /> ยืนยันบันทึก
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function PageHeader() {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                    <HardDrive className="text-primary" /> ตั้งค่าที่เก็บไฟล์
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    เลือกผู้ให้บริการที่เก็บไฟล์ระหว่าง MinIO (self-hosted) หรือ
                    Cloudflare R2 — ทดสอบการเชื่อมต่อก่อนบันทึกเสมอ
                </p>
            </div>
        </div>
    );
}

interface MinioFieldsProps {
    value: MinioFormState;
    onChange: (next: MinioFormState) => void;
    showSecrets: Record<SecretField, boolean>;
    onToggleSecret: (field: SecretField) => void;
    onSecretFocus: (field: SecretField) => void;
}

function MinioFields({
    value,
    onChange,
    showSecrets,
    onToggleSecret,
    onSecretFocus,
}: MinioFieldsProps) {
    const set = <K extends keyof MinioFormState>(
        key: K,
        v: MinioFormState[K],
    ) => onChange({ ...value, [key]: v });

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-4">
                <div className="space-y-1.5">
                    <Label>Endpoint</Label>
                    <Input
                        value={value.endpoint}
                        onChange={(e) => set("endpoint", e.target.value)}
                        placeholder="เช่น minio.example.com"
                        className="h-10 rounded-xl bg-muted border-border"
                    />
                    <p className="text-xs text-muted-foreground">
                        โฮสต์ของ MinIO (ไม่ต้องใส่ http:// หรือ https://)
                    </p>
                </div>
                <div className="space-y-1.5">
                    <Label>Port</Label>
                    <Input
                        type="number"
                        inputMode="numeric"
                        value={value.port}
                        onChange={(e) => set("port", e.target.value)}
                        placeholder="9000"
                        className="h-10 rounded-xl bg-muted border-border"
                    />
                    <p className="text-xs text-muted-foreground">
                        ปกติคือ 9000
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-border bg-muted px-4 py-3">
                <div>
                    <p className="text-sm font-medium text-foreground">
                        ใช้ SSL (HTTPS)
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        เปิดใช้เมื่อเชื่อมต่อผ่าน HTTPS บน production
                    </p>
                </div>
                <ToggleSwitch
                    checked={value.useSSL}
                    onChange={(next) => set("useSSL", next)}
                    ariaLabel="ใช้ SSL"
                />
            </div>

            <SecretInput
                label="Access Key"
                helper="Access Key ของ MinIO — เก็บเป็นความลับ"
                value={value.accessKey}
                onChange={(v) => set("accessKey", v)}
                show={showSecrets.accessKey}
                onToggle={() => onToggleSecret("accessKey")}
                onFocus={() => onSecretFocus("accessKey")}
                autoComplete="off"
            />

            <SecretInput
                label="Secret Key"
                helper="Secret Key ของ MinIO — เก็บเป็นความลับ"
                value={value.secretKey}
                onChange={(v) => set("secretKey", v)}
                show={showSecrets.secretKey}
                onToggle={() => onToggleSecret("secretKey")}
                onFocus={() => onSecretFocus("secretKey")}
                autoComplete="off"
            />

            <div className="space-y-1.5">
                <Label>Bucket</Label>
                <Input
                    value={value.bucket}
                    onChange={(e) => set("bucket", e.target.value)}
                    placeholder="uploads"
                    className="h-10 rounded-xl bg-muted border-border"
                />
                <p className="text-xs text-muted-foreground">
                    ชื่อ bucket ที่จะใช้เก็บไฟล์ของ Car2Hand
                </p>
            </div>
        </>
    );
}

interface R2FieldsProps {
    value: R2FormState;
    onChange: (next: R2FormState) => void;
    showSecrets: Record<SecretField, boolean>;
    onToggleSecret: (field: SecretField) => void;
    onSecretFocus: (field: SecretField) => void;
}

function R2Fields({
    value,
    onChange,
    showSecrets,
    onToggleSecret,
    onSecretFocus,
}: R2FieldsProps) {
    const set = <K extends keyof R2FormState>(key: K, v: R2FormState[K]) =>
        onChange({ ...value, [key]: v });

    return (
        <>
            <div className="space-y-1.5">
                <Label>Endpoint</Label>
                <Input
                    value={value.endpoint}
                    onChange={(e) => set("endpoint", e.target.value)}
                    placeholder="https://<account-id>.r2.cloudflarestorage.com"
                    className="h-10 rounded-xl bg-muted border-border"
                />
                <p className="text-xs text-muted-foreground">
                    R2 S3-compatible endpoint ของบัญชี Cloudflare
                </p>
            </div>

            <SecretInput
                label="Access Key ID"
                helper="R2 Access Key ID จาก Cloudflare Dashboard"
                value={value.accessKeyId}
                onChange={(v) => set("accessKeyId", v)}
                show={showSecrets.accessKeyId}
                onToggle={() => onToggleSecret("accessKeyId")}
                onFocus={() => onSecretFocus("accessKeyId")}
                autoComplete="off"
            />

            <SecretInput
                label="Secret Access Key"
                helper="R2 Secret Access Key — เก็บเป็นความลับ"
                value={value.secretAccessKey}
                onChange={(v) => set("secretAccessKey", v)}
                show={showSecrets.secretAccessKey}
                onToggle={() => onToggleSecret("secretAccessKey")}
                onFocus={() => onSecretFocus("secretAccessKey")}
                autoComplete="off"
            />

            <div className="space-y-1.5">
                <Label>Bucket</Label>
                <Input
                    value={value.bucket}
                    onChange={(e) => set("bucket", e.target.value)}
                    placeholder="car2hand-uploads"
                    className="h-10 rounded-xl bg-muted border-border"
                />
                <p className="text-xs text-muted-foreground">
                    ชื่อ R2 bucket ที่จะใช้เก็บไฟล์
                </p>
            </div>

            <div className="space-y-1.5">
                <Label>Public URL</Label>
                <Input
                    value={value.publicUrl}
                    onChange={(e) => set("publicUrl", e.target.value)}
                    placeholder="https://cdn.car2hand.app"
                    className="h-10 rounded-xl bg-muted border-border"
                />
                <p className="text-xs text-muted-foreground">
                    URL สาธารณะของ bucket (custom domain หรือ r2.dev URL)
                </p>
            </div>

            <div className="space-y-1.5">
                <Label>Directory <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                    value={value.directory}
                    onChange={(e) => set("directory", e.target.value)}
                    placeholder="เช่น car2hand/prod"
                    className="h-10 rounded-xl bg-muted border-border"
                />
                <p className="text-xs text-muted-foreground">
                    prefix นำหน้าทุกไฟล์ใน bucket — ใช้เมื่อต้องแยก environment หรือแชร์ bucket ร่วมกับโปรเจ็กต์อื่น (เว้นว่างไว้ถ้าไม่ต้องการ)
                </p>
            </div>
        </>
    );
}

interface SecretInputProps {
    label: string;
    helper: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggle: () => void;
    onFocus: () => void;
    autoComplete?: string;
}

function SecretInput({
    label,
    helper,
    value,
    onChange,
    show,
    onToggle,
    onFocus,
    autoComplete,
}: SecretInputProps) {
    const redacted = isRedactedSecret(value);
    return (
        <div className="space-y-1.5">
            <Label>{label}</Label>
            <div className="relative">
                <Input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={onFocus}
                    autoComplete={autoComplete}
                    placeholder={redacted ? value : "••••••••"}
                    className={cn(
                        "h-10 rounded-xl bg-muted border-border pr-10",
                        redacted && "text-muted-foreground italic",
                    )}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    aria-label={show ? "ซ่อนค่า" : "แสดงค่า"}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                    {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
            </div>
            <p className="text-xs text-muted-foreground">
                {redacted
                    ? `${helper} · คลิกเพื่อใส่ค่าใหม่ (ค่าเดิมยังถูกเก็บไว้)`
                    : helper}
            </p>
        </div>
    );
}

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (next: boolean) => void;
    ariaLabel: string;
}

function ToggleSwitch({ checked, onChange, ariaLabel }: ToggleSwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={ariaLabel}
            onClick={() => onChange(!checked)}
            className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0",
                checked ? "bg-primary" : "bg-muted-foreground/30",
            )}
        >
            <span
                className={cn(
                    "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
                    checked ? "translate-x-5" : "translate-x-0.5",
                )}
            />
        </button>
    );
}
