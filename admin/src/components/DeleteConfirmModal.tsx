"use client";

import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
            <DialogContent className="sm:max-w-md rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className="h-14 w-14 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive">
                            <Trash2 size={28} />
                        </div>
                    </div>

                    <DialogHeader className="text-left space-y-2">
                        <DialogTitle className="text-xl font-bold text-slate-800">{title}</DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium leading-relaxed">
                            {description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-8 flex items-center gap-3">
                        <Button
                            variant="secondary"
                            disabled={isLoading}
                            onClick={onClose}
                            className="flex-1 h-12 font-bold rounded-xl"
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={isLoading}
                            onClick={onConfirm}
                            className="flex-1 h-12 font-bold rounded-xl flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    กำลังลบ...
                                </>
                            ) : (
                                'ยืนยันการลบ'
                            )}
                        </Button>
                    </div>
                </div>

                <div className="bg-slate-50 px-8 py-4 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
