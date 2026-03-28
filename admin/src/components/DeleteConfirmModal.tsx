"use client";

import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md rounded-xl p-0 overflow-hidden border-slate-200 shadow-lg">
                <div className="p-6">
                    <div className="mb-5">
                        <div className="h-11 w-11 bg-destructive/10 rounded-lg flex items-center justify-center text-destructive">
                            <Trash2 size={22} />
                        </div>
                    </div>

                    <DialogHeader className="text-left space-y-1.5">
                        <DialogTitle className="text-lg font-semibold text-slate-800">{title}</DialogTitle>
                        <DialogDescription className="text-slate-500 text-sm leading-relaxed">
                            {description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-6 flex items-center gap-3">
                        <Button
                            variant="secondary"
                            disabled={isLoading}
                            onClick={onClose}
                            className="flex-1 h-10 font-medium rounded-lg"
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={isLoading}
                            onClick={onConfirm}
                            className="flex-1 h-10 font-medium rounded-lg flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    กำลังลบ...
                                </>
                            ) : (
                                'ยืนยันการลบ'
                            )}
                        </Button>
                    </div>
                </div>

                <div className="bg-slate-50 px-6 py-3 flex items-center gap-2 border-t border-slate-100">
                    <AlertTriangle size={13} className="text-amber-500" />
                    <p className="text-xs text-slate-400">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
