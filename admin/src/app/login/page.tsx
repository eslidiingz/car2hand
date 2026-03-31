"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const data = await apiFetch('/admin/login', {
                method: 'POST',
                body: JSON.stringify({ username, password, rememberMe }),
            });

            login(data.accessToken, data.admin, rememberMe);
        } catch (err: any) {
            setError(err.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                        Car<span className="text-accent">2</span>Hand <span className="font-light text-slate-400 text-xl">Admin</span>
                    </h1>
                    <p className="text-slate-500 mt-2">ลงชื่อเข้าใช้งานสำหรับผู้ดูแลระบบเท่านั้น</p>
                </div>

                {/* Login Card */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อผู้ใช้</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="username"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-colors text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-sm font-medium text-slate-700">รหัสผ่าน</label>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-colors text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary transition-all"
                            />
                            <label htmlFor="remember" className="text-sm text-slate-500 font-medium cursor-pointer">จดจำการใช้งาน</label>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-11 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin h-4 w-4" />
                                    กำลังเข้าสู่ระบบ...
                                </>
                            ) : "เข้าสู่ระบบ"}
                        </Button>
                    </form>
                </div>
            </div>
        </main>
    );
}
