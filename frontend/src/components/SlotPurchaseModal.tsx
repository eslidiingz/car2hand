"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Minus, Upload, X, Image as ImageIcon, CreditCard, ShoppingBag, Check } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!stored) return null;
    try {
        const u = JSON.parse(stored);
        return u?.token || u?.accessToken || null;
    } catch {
        return null;
    }
}

interface SlotInfo {
    pricePerSlot: number;
    minQuantity: number;
    maxQuantityPerPurchase: number;
    bonusListingSlots: number;
    packageMaxListings: number;
    effectiveMaxListings: number;
    isUnlimited: boolean;
    canPurchase: boolean;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function SlotPurchaseModal({ open, onClose, onSuccess }: Props) {
    const [slotInfo, setSlotInfo] = useState<SlotInfo | null>(null);
    const [paymentInfo, setPaymentInfo] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState(1);
    const [slipFile, setSlipFile] = useState<File | null>(null);
    const [slipPreview, setSlipPreview] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) return;
        const token = getAuthToken();
        Promise.all([
            fetch(`${API_URL}/slots/me`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(r => r.json()),
            fetch(`${API_URL}/packages/payment-info`).then(r => r.json()),
        ]).then(([info, pay]) => {
            setSlotInfo(info);
            setPaymentInfo(pay || {});
            setQuantity(info?.minQuantity || 1);
        }).catch(() => setError("ไม่สามารถโหลดข้อมูลได้"));
    }, [open]);

    const handleFile = (file: File | null) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("รองรับเฉพาะไฟล์รูปภาพ");
            return;
        }
        setSlipFile(file);
        const reader = new FileReader();
        reader.onload = () => setSlipPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const reset = () => {
        setSlipFile(null);
        setSlipPreview(null);
        setError("");
        setSuccess("");
        setQuantity(1);
    };

    const close = () => {
        if (submitting) return;
        reset();
        onClose();
    };

    const submit = async () => {
        if (!slipFile || !slotInfo) return;
        setSubmitting(true);
        setError("");
        try {
            const buf = await slipFile.arrayBuffer();
            const bytes = new Uint8Array(buf);
            let bin = "";
            const chunk = 8192;
            for (let i = 0; i < bytes.length; i += chunk) {
                bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
            }
            const base64 = btoa(bin);

            const token = getAuthToken();
            const res = await fetch(`${API_URL}/slots/purchase`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    quantity,
                    slipImage: { buffer: base64, filename: slipFile.name, mimetype: slipFile.type },
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(data.message || "ส่งคำขอสำเร็จ");
                onSuccess?.();
                setTimeout(() => close(), 2000);
            } else {
                setError(data.message || "เกิดข้อผิดพลาด");
            }
        } catch {
            setError("เกิดข้อผิดพลาดในการส่งคำขอ");
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    const totalAmount = slotInfo ? quantity * slotInfo.pricePerSlot : 0;
    const cannotPurchase = slotInfo && !slotInfo.canPurchase;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
            <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto relative z-10">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between rounded-t-3xl z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                            <ShoppingBag size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">ซื้อ slot ประกาศเพิ่ม</h3>
                            <p className="text-xs text-gray-500">฿{slotInfo?.pricePerSlot ?? 99}/slot · สะสมถาวร</p>
                        </div>
                    </div>
                    <button onClick={close} className="text-gray-400 hover:text-gray-600 p-1" disabled={submitting}>
                        <X size={20} />
                    </button>
                </div>

                {!slotInfo ? (
                    <div className="p-12 text-center text-gray-400 text-sm">กำลังโหลด...</div>
                ) : cannotPurchase ? (
                    <div className="p-8 text-center space-y-4">
                        <div className="text-amber-500 text-sm bg-amber-50 rounded-xl p-4">
                            แพ็กเกจปัจจุบันลงประกาศได้ไม่จำกัดอยู่แล้ว ไม่ต้องซื้อ slot เพิ่ม
                        </div>
                        <button onClick={close} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200">ปิด</button>
                    </div>
                ) : (
                    <div className="p-5 space-y-5">
                        {/* Current state */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 text-sm text-gray-700">
                            <div className="flex justify-between items-center">
                                <span>Slot ปัจจุบัน</span>
                                <span className="font-bold">
                                    {slotInfo.packageMaxListings}
                                    {slotInfo.bonusListingSlots > 0 && (
                                        <span className="text-emerald-600"> + {slotInfo.bonusListingSlots}</span>
                                    )}
                                    <span className="text-gray-400"> = </span>
                                    <span className="text-primary text-lg">{slotInfo.effectiveMaxListings}</span>
                                </span>
                            </div>
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-100">
                                <span>หลังซื้อเพิ่ม</span>
                                <span className="font-bold text-primary text-lg">{slotInfo.effectiveMaxListings + quantity} slot</span>
                            </div>
                        </div>

                        {/* Quantity selector */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">จำนวน slot ที่ต้องการซื้อ</label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(slotInfo.minQuantity, quantity - 1))}
                                    disabled={quantity <= slotInfo.minQuantity}
                                    className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                                >
                                    <Minus size={18} />
                                </button>
                                <div className="flex-1 text-center">
                                    <div className="text-3xl font-bold text-gray-800">{quantity}</div>
                                    <div className="text-xs text-gray-400">slot</div>
                                </div>
                                <button
                                    onClick={() => setQuantity(Math.min(slotInfo.maxQuantityPerPurchase, quantity + 1))}
                                    disabled={quantity >= slotInfo.maxQuantityPerPurchase}
                                    className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 text-center">
                                สูงสุด {slotInfo.maxQuantityPerPurchase} slot/ครั้ง
                            </p>
                        </div>

                        {/* Total */}
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4">
                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <span>{quantity} slot × ฿{slotInfo.pricePerSlot}</span>
                                <span>ยอดรวม</span>
                            </div>
                            <div className="text-3xl font-bold text-orange-600 text-right">
                                ฿{totalAmount.toLocaleString("th-TH")}
                            </div>
                        </div>

                        {/* Payment info */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <CreditCard size={16} className="text-primary" /> ข้อมูลการชำระเงิน
                            </h4>
                            <div className="bg-blue-50 rounded-xl p-4 space-y-1 text-sm text-blue-800">
                                {paymentInfo.bankName && <p>ธนาคาร: <b>{paymentInfo.bankName}</b></p>}
                                {paymentInfo.accountName && <p>ชื่อบัญชี: <b>{paymentInfo.accountName}</b></p>}
                                {paymentInfo.accountNumber && <p>เลขบัญชี: <b className="font-mono">{paymentInfo.accountNumber}</b></p>}
                                {paymentInfo.promptPayNumber && <p>พร้อมเพย์: <b className="font-mono">{paymentInfo.promptPayNumber}</b></p>}
                                {!paymentInfo.bankName && !paymentInfo.promptPayNumber && (
                                    <p className="text-xs text-gray-400">ยังไม่มีข้อมูลการชำระเงิน กรุณาติดต่อผู้ดูแลระบบ</p>
                                )}
                                {paymentInfo.qrCodeImage && (
                                    <div className="border-t border-blue-100 pt-3 mt-2">
                                        <p className="font-bold mb-2 text-center text-xs">สแกน QR Code</p>
                                        <div className="flex justify-center">
                                            <img src={paymentInfo.qrCodeImage} alt="QR" className="w-40 h-40 object-contain rounded-lg border bg-white p-1" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Slip upload */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Upload size={16} className="text-primary" /> แนบหลักฐานการโอนเงิน
                            </h4>
                            {slipPreview ? (
                                <div className="relative">
                                    <img src={slipPreview} alt="Slip" className="w-full rounded-xl border border-gray-200 max-h-72 object-contain bg-gray-50" />
                                    <button
                                        onClick={() => { setSlipFile(null); setSlipPreview(null); }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <label
                                    className={`flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition ${dragOver ? "border-primary bg-blue-50/50" : "border-gray-200 hover:border-primary hover:bg-blue-50/50"}`}
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDragOver(false);
                                        const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith("image/"));
                                        if (file) handleFile(file);
                                    }}
                                >
                                    <ImageIcon strokeWidth={1.5} size={32} className={dragOver ? "text-primary" : "text-gray-300"} />
                                    <span className="text-sm font-semibold text-gray-500">{dragOver ? "วางรูปที่นี่" : "คลิกหรือลากสลิปมาวาง"}</span>
                                    <span className="text-xs text-gray-400">รองรับ JPG, PNG, WebP</span>
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
                                </label>
                            )}
                        </div>

                        {/* Messages */}
                        {error && <div className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</div>}
                        {success && (
                            <div className="text-sm text-emerald-700 bg-emerald-50 rounded-xl p-3 flex items-center gap-2">
                                <Check size={16} /> {success}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            onClick={submit}
                            disabled={!slipFile || submitting || !!success}
                            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-600 hover:to-red-600 transition shadow-lg shadow-orange-200"
                        >
                            {submitting ? "กำลังส่ง..." : success ? "ส่งสำเร็จ" : `ส่งคำขอซื้อ ${quantity} slot · ฿${totalAmount.toLocaleString("th-TH")}`}
                        </button>
                        <p className="text-xs text-gray-400 text-center">หลังส่งคำขอ admin จะตรวจสอบสลิปและเพิ่ม slot ให้ภายใน 24 ชม.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
