"use client";

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    type: string;
}

const Toast = ({ message, type }: ToastProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const content = (
        <div className="fixed z-[9999] inset-x-0 bottom-24 lg:bottom-8 flex justify-center pointer-events-none">
            <div className={`px-5 py-3 rounded-xl shadow-lg pointer-events-auto max-w-[90vw] text-center ${
                type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
                <span className="text-sm font-medium">{message}</span>
            </div>
        </div>
    );

    if (!mounted) return content;
    return createPortal(content, document.body);
}

export default Toast
