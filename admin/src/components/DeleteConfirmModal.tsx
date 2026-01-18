"use client";

import { Trash2, X, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    isLoading?: boolean;
}

export default function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    isLoading = false
}: DeleteConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className="h-14 w-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                            <Trash2 size={28} />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">{description}</p>

                    <div className="mt-8 flex items-center gap-3">
                        <div className="flex-1">
                            <button
                                disabled={isLoading}
                                onClick={onClose}
                                className="w-full h-12 btn btn-secondary font-bold"
                            >
                                ยกเลิก
                            </button>
                        </div>
                        <div className="flex-1">
                            <button
                                disabled={isLoading}
                                onClick={onConfirm}
                                className="w-full h-12 btn btn-danger font-bold flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        กำลังลบ...
                                    </>
                                ) : (
                                    'ยืนยันการลบ'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 px-8 py-4 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                </div>
            </div>
        </div>
    );
}
