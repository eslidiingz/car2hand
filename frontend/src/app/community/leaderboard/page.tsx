"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Medal, Star, MessageCircle, BadgeCheck } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface GuruEntry {
    rank: number;
    userId: string;
    fullName: string;
    points: number;
    totalPosts: number;
    totalAnswers: number;
}

const RANK_COLORS: Record<number, string> = {
    1: 'text-yellow-500',
    2: 'text-gray-400',
    3: 'text-orange-600',
};

export default function LeaderboardPage() {
    const [gurus, setGurus] = useState<GuruEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/forum/leaderboard?limit=50`)
            .then((r) => r.json())
            .then((data) => {
                setGurus(data.leaderboard ?? []);
                setLoading(false);
            });
    }, []);

    return (
        <div className="bg-surface min-h-screen">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <Link href="/community" className="flex items-center gap-2 text-gray-500 hover:text-primary transition mb-6 w-fit">
                    <ArrowLeft size={18} /> กลับหน้าชุมชน
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-primary text-white p-6">
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <Trophy fill="currentColor" className="text-yellow-400 text-3xl" />
                            Top Gurus Leaderboard
                        </h1>
                        <p className="text-blue-200 text-sm mt-1">ผู้เชี่ยวชาญที่ช่วยตอบคำถามในชุมชน</p>
                    </div>

                    {/* Top 3 podium */}
                    {gurus.length >= 3 && (
                        <div className="flex items-end justify-center gap-4 px-6 pt-8 pb-4 bg-gradient-to-b from-blue-50 to-white">
                            {/* 2nd */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-14 h-14 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xl font-bold border-4 border-gray-300">
                                    {gurus[1].fullName.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-gray-800 truncate max-w-[80px]">{gurus[1].fullName}</p>
                                    <p className="text-xs text-gray-500">{gurus[1].points.toLocaleString()} คะแนน</p>
                                </div>
                                <div className="bg-gray-200 text-gray-600 font-bold text-lg w-10 h-10 rounded-full flex items-center justify-center">2</div>
                            </div>
                            {/* 1st */}
                            <div className="flex flex-col items-center gap-2 -translate-y-4">
                                <Medal fill="currentColor" className="text-yellow-400 text-2xl" />
                                <div className="w-16 h-16 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-2xl font-bold border-4 border-yellow-400">
                                    {gurus[0].fullName.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-gray-800 truncate max-w-[90px] flex items-center gap-1 justify-center">
                                        {gurus[0].fullName}
                                        <BadgeCheck fill="currentColor" className="text-blue-500 text-xs flex-shrink-0" />
                                    </p>
                                    <p className="text-xs text-gray-500">{gurus[0].points.toLocaleString()} คะแนน</p>
                                </div>
                                <div className="bg-yellow-400 text-white font-bold text-lg w-10 h-10 rounded-full flex items-center justify-center">1</div>
                            </div>
                            {/* 3rd */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xl font-bold border-4 border-orange-300">
                                    {gurus[2].fullName.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-gray-800 truncate max-w-[80px]">{gurus[2].fullName}</p>
                                    <p className="text-xs text-gray-500">{gurus[2].points.toLocaleString()} คะแนน</p>
                                </div>
                                <div className="bg-orange-300 text-white font-bold text-lg w-10 h-10 rounded-full flex items-center justify-center">3</div>
                            </div>
                        </div>
                    )}

                    {/* Full list */}
                    <div className="divide-y divide-gray-100">
                        {loading ? (
                            <div className="py-12 text-center text-gray-400">กำลังโหลด...</div>
                        ) : gurus.length === 0 ? (
                            <div className="py-12 text-center text-gray-400">
                                <Trophy size={40} className="mx-auto mb-2 opacity-20" />
                                <p>ยังไม่มีข้อมูล Guru</p>
                                <p className="text-sm">ตอบคำถามในชุมชนเพื่อสะสมคะแนน!</p>
                            </div>
                        ) : (
                            gurus.map((g) => (
                                <div key={g.userId} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition">
                                    <span className={`font-bold text-base w-6 text-center ${RANK_COLORS[g.rank] ?? 'text-gray-400'}`}>
                                        {g.rank}
                                    </span>
                                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                        {g.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-800 text-sm truncate flex items-center gap-1">
                                            {g.fullName}
                                            {g.rank <= 3 && <BadgeCheck fill="currentColor" className="text-blue-500 text-xs flex-shrink-0" />}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                            <span className="flex items-center gap-1"><MessageCircle size={12} /> {g.totalPosts} กระทู้</span>
                                            <span className="flex items-center gap-1"><Star size={12} /> {g.totalAnswers} best answers</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className="font-bold text-primary">{g.points.toLocaleString()}</span>
                                        <span className="text-xs text-gray-400 block">คะแนน</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Points guide */}
                    <div className="bg-gray-50 p-5 border-t border-gray-100">
                        <h3 className="font-bold text-sm text-gray-700 mb-3">วิธีสะสมคะแนน</h3>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-white rounded-xl p-3 border border-gray-100">
                                <span className="text-accent font-bold text-lg">+1</span>
                                <p className="text-xs text-gray-500 mt-1">ตั้งกระทู้</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-gray-100">
                                <span className="text-primary font-bold text-lg">+5</span>
                                <p className="text-xs text-gray-500 mt-1">ตอบคำถาม</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-gray-100">
                                <span className="text-yellow-500 font-bold text-lg">+20</span>
                                <p className="text-xs text-gray-500 mt-1">Best Answer</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
