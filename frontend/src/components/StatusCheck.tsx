"use client";

import { useEffect, useState } from "react";

export default function StatusCheck() {
    const [status, setStatus] = useState<string>("Loading...");
    const [isConnected, setIsConnected] = useState<boolean>(false);

    useEffect(() => {
        fetch("http://localhost:8000/")
            .then((res) => res.text())
            .then((data) => {
                setStatus(data);
                setIsConnected(true);
            })
            .catch((err) => {
                setStatus("Connection failed");
                setIsConnected(false);
                console.error(err);
            });
    }, []);

    return (
        <div className="p-6 mt-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm max-w-sm mx-auto shadow-lg transition-all hover:shadow-xl">
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Backend Status
            </h2>
            <div className="flex items-center gap-3">
                <div
                    className={`w-3 h-3 rounded-full ${isConnected ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                        }`}
                />
                <span className={`text-xl font-bold ${isConnected ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {status}
                </span>
            </div>
            <p className="mt-2 text-xs text-zinc-500 text-right">
                Port: 8000
            </p>
        </div>
    );
}
