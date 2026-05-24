"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';
import SearchableSelect, { type SelectOption } from '@/components/SearchableSelect';
import { MOTORCYCLE_ENABLED, ENGINE_SIZE_ENABLED } from '@/lib/featureFlags';
import {
    ArrowLeft,
    Sparkles,
    TrendingUp,
    TrendingDown,
    Minus,
    Zap,
    Lightbulb,
    ArrowRight,
    Search,
    Car,
    Loader2,
    ChevronDown,
    AlertCircle,
    BarChart3,
    Eye,
    Calendar,
    Gauge,
    Fuel,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Brand {
    id: string;
    name: string;
    nameTh: string | null;
    logo?: string | null;
    isPopular: boolean;
}

interface VehicleModel {
    id: string;
    name: string;
    nameTh?: string | null;
    bodyType?: string;
    yearStart?: number;
    yearEnd?: number;
}

interface SubModel {
    id: string;
    name: string;
    engineSize?: number;
    fuelType?: string;
    transmission?: string;
}

interface EstimateResult {
    estimatedPrice: { low: number; high: number; median: number } | null;
    sampleSize: number;
    demandLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    avgDaysToSell: number | null;
    priceByCondition: Record<string, { low: number; high: number }>;
    similarListings: Array<{
        id: string;
        title: string;
        price: number;
        year: number;
        mileage: number;
        brand: string;
        model: string;
        subModel?: string;
        fuelType?: string;
        transmission?: string;
        image?: string | null;
    }>;
    marketTrend: 'RISING' | 'STABLE' | 'FALLING';
    confidence: number;
    matchLevel: 'exact' | 'model' | 'brand';
    vehicleInfo: { brand: string; model: string; subModel?: string; year: number };
    message?: string;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 30 }, (_, i) => currentYear - i);

const conditionLabels: Record<string, string> = {
    FAIR: 'พอใช้',
    GOOD: 'ดีมาก',
    EXCELLENT: 'นางฟ้า',
};

export default function EstimatePricePageWrapper() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <EstimatePricePage />
        </Suspense>
    );
}

function EstimatePricePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const paramBrandId = searchParams.get('brandId') || '';
    const paramBrand = searchParams.get('brand') || '';
    const paramModelId = searchParams.get('modelId') || '';
    const paramModel = searchParams.get('model') || '';

    // Auth state
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [pendingRedirect, setPendingRedirect] = useState('');

    useEffect(() => {
        const user = localStorage.getItem('user') || sessionStorage.getItem('user');
        setIsLoggedIn(!!user);
    }, []);

    // Form state
    const [vehicleType, setVehicleType] = useState<'CAR' | 'MOTORCYCLE'>('CAR');
    const [brands, setBrands] = useState<Brand[]>([]);
    const [models, setModels] = useState<VehicleModel[]>([]);
    const [subModels, setSubModels] = useState<SubModel[]>([]);
    const [selectedBrandId, setSelectedBrandId] = useState(paramBrandId);
    const [selectedBrand, setSelectedBrand] = useState(paramBrand);
    const [selectedModelId, setSelectedModelId] = useState(paramModelId);
    const [selectedModel, setSelectedModel] = useState(paramModel);
    const [selectedSubModel, setSelectedSubModel] = useState('');
    const [selectedYear, setSelectedYear] = useState(currentYear - 3);
    const [mileage, setMileage] = useState('');
    const [selectedCondition, setSelectedCondition] = useState<'FAIR' | 'GOOD' | 'EXCELLENT'>('GOOD');
    const [initialized, setInitialized] = useState(false);

    // Loading states
    const [loadingBrands, setLoadingBrands] = useState(false);
    const [loadingModels, setLoadingModels] = useState(false);
    const [loadingSubModels, setLoadingSubModels] = useState(false);
    const [estimating, setEstimating] = useState(false);

    // Result
    const [result, setResult] = useState<EstimateResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch brands
    useEffect(() => {
        const fetchBrands = async () => {
            setLoadingBrands(true);
            try {
                const res = await fetch(`${API_URL}/master-data/brands?vehicleType=${vehicleType}`);
                const data = await res.json();
                if (data.success) setBrands(data.brands);
            } catch { /* ignore */ } finally { setLoadingBrands(false); }
        };
        fetchBrands();
        // Only reset if user manually changes vehicle type (not on initial load with params)
        if (initialized) {
            setSelectedBrandId('');
            setSelectedBrand('');
            setModels([]);
            setSelectedModelId('');
            setSelectedModel('');
            setSubModels([]);
            setSelectedSubModel('');
        }
        setInitialized(true);
    }, [vehicleType]);

    // Auto-search from query param (fallback for old ?q= links)
    useEffect(() => {
        if (initialQuery && !paramBrandId && brands.length > 0 && !selectedBrandId) {
            const q = initialQuery.toLowerCase();
            const match = brands.find(b =>
                b.name.toLowerCase().includes(q) || (b.nameTh && b.nameTh.includes(q))
            );
            if (match) {
                setSelectedBrandId(match.id);
                setSelectedBrand(match.name);
            }
        }
    }, [initialQuery, paramBrandId, brands, selectedBrandId]);

    // Fetch models when brand changes
    const prevBrandRef = React.useRef(selectedBrandId);
    useEffect(() => {
        if (!selectedBrandId) { setModels([]); return; }
        const fetchModels = async () => {
            setLoadingModels(true);
            try {
                const res = await fetch(`${API_URL}/master-data/brands/${selectedBrandId}/models`);
                const data = await res.json();
                if (data.success) setModels(data.models);
            } catch { /* ignore */ } finally { setLoadingModels(false); }
        };
        fetchModels();
        // Only reset model if brand actually changed by user (not on initial pre-fill)
        if (prevBrandRef.current && prevBrandRef.current !== selectedBrandId) {
            setSelectedModelId('');
            setSelectedModel('');
            setSubModels([]);
            setSelectedSubModel('');
        }
        prevBrandRef.current = selectedBrandId;
    }, [selectedBrandId]);

    // Auto-match model from query param (fallback for old ?q= links)
    useEffect(() => {
        if (initialQuery && !paramModelId && models.length > 0 && !selectedModelId) {
            const q = initialQuery.toLowerCase();
            const match = models.find(m =>
                q.includes(m.name.toLowerCase()) || (m.nameTh && q.includes(m.nameTh))
            );
            if (match) {
                setSelectedModelId(match.id);
                setSelectedModel(match.name);
            }
        }
    }, [initialQuery, models, selectedModelId]);

    // Fetch sub-models
    useEffect(() => {
        if (!selectedModelId) { setSubModels([]); return; }
        const fetchSubModels = async () => {
            setLoadingSubModels(true);
            try {
                const res = await fetch(`${API_URL}/master-data/models/${selectedModelId}/sub-models`);
                const data = await res.json();
                if (data.success) setSubModels(data.subModels);
            } catch { /* ignore */ } finally { setLoadingSubModels(false); }
        };
        fetchSubModels();
        setSelectedSubModel('');
    }, [selectedModelId]);

    // Parse year from query
    useEffect(() => {
        if (initialQuery) {
            const yearMatch = initialQuery.match(/\b(19|20)\d{2}\b/);
            if (yearMatch) setSelectedYear(parseInt(yearMatch[0]));
        }
    }, [initialQuery]);

    // Auto-estimate when pre-filled from /sell page params
    const autoEstimatedRef = React.useRef(false);
    useEffect(() => {
        if (paramBrand && paramModel && selectedBrand && selectedModel && selectedYear && !autoEstimatedRef.current && !result) {
            autoEstimatedRef.current = true;
            // Small delay to let UI render first
            setTimeout(() => handleEstimate(), 300);
        }
    }, [selectedBrand, selectedModel, selectedYear]);

    const canEstimate = selectedBrand && selectedModel && selectedYear;

    const handleEstimate = async () => {
        if (!canEstimate) return;
        setEstimating(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch(`${API_URL}/listings/estimate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brand: selectedBrand,
                    model: selectedModel,
                    subModel: selectedSubModel || undefined,
                    year: selectedYear,
                    mileage: mileage ? parseInt(mileage) : undefined,
                    condition: selectedCondition,
                    vehicleType,
                }),
            });
            const data = await res.json();
            if (data.error) {
                setError(data.error);
            } else {
                setResult(data);
            }
        } catch {
            setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setEstimating(false);
        }
    };

    // Null-safe: API อาจคืน null/undefined สำหรับราคา (เคสไม่มี comparable หรือ listing เก่า
    // ก่อน schema เปลี่ยน) ห้ามล้ม UI ทั้งหน้าเพราะตัวเลขหายไป
    const formatPrice = (n: number | null | undefined) =>
        typeof n === 'number' && Number.isFinite(n) ? n.toLocaleString('th-TH') : '-';

    const getConditionPrice = () => {
        if (!result?.priceByCondition?.[selectedCondition]) {
            return result?.estimatedPrice;
        }
        return result.priceByCondition[selectedCondition];
    };

    const displayPrice = getConditionPrice();

    return (
        <div className="bg-surface text-gray-800 min-h-screen">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 py-4 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Link href="/sell" className="text-gray-500 hover:text-primary"><ArrowLeft size={20} /></Link>
                        <span className="font-bold text-xl text-primary">ประเมินราคารถ</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Powered by Car2Hand</span>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* Input Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Search size={20} className="text-primary" />
                        กรอกข้อมูลรถของคุณ
                    </h2>

                    {/* Vehicle Type Toggle — hidden while MOTORCYCLE_ENABLED=false */}
                    {MOTORCYCLE_ENABLED && (
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setVehicleType('CAR')}
                                className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${vehicleType === 'CAR' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                <Car size={16} className="inline mr-1" /> รถยนต์
                            </button>
                            <button
                                onClick={() => setVehicleType('MOTORCYCLE')}
                                className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${vehicleType === 'MOTORCYCLE' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                มอเตอร์ไซค์
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Brand */}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">ยี่ห้อ <span className="text-red-500">*</span></label>
                            <SearchableSelect
                                options={brands.map(b => ({
                                    id: b.id,
                                    label: b.name,
                                    subLabel: b.nameTh || undefined,
                                    image: b.logo || `/brands/cars/${b.name}-300x300.png`,
                                    isPopular: b.isPopular || false,
                                }))}
                                value={selectedBrandId}
                                onChange={(val, opt) => {
                                    setSelectedBrandId(val);
                                    setSelectedBrand(opt?.label || '');
                                }}
                                placeholder="เลือกยี่ห้อ"
                                searchPlaceholder="ค้นหายี่ห้อ..."
                                loading={loadingBrands}
                                disabled={loadingBrands}
                            />
                        </div>

                        {/* Model */}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">รุ่น <span className="text-red-500">*</span></label>
                            <SearchableSelect
                                options={models.map(m => ({
                                    id: m.id,
                                    label: m.name,
                                    subLabel: m.nameTh || undefined,
                                }))}
                                value={selectedModelId}
                                onChange={(val, opt) => {
                                    setSelectedModelId(val);
                                    setSelectedModel(opt?.label || '');
                                }}
                                placeholder="เลือกรุ่น"
                                searchPlaceholder="ค้นหารุ่น..."
                                loading={loadingModels}
                                disabled={!selectedBrandId || loadingModels}
                            />
                        </div>

                        {/* Sub-model */}
                        {subModels.length > 0 && (
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">รุ่นย่อย</label>
                                <SearchableSelect
                                    options={subModels.map(sm => ({
                                        id: sm.name,
                                        label: sm.name,
                                        subLabel: (ENGINE_SIZE_ENABLED && sm.engineSize) ? `${sm.engineSize} cc` : undefined,
                                    }))}
                                    value={selectedSubModel}
                                    onChange={(val) => setSelectedSubModel(val)}
                                    placeholder="เลือกรุ่นย่อย (ไม่บังคับ)"
                                    searchPlaceholder="ค้นหารุ่นย่อย..."
                                    loading={loadingSubModels}
                                />
                            </div>
                        )}

                        {/* Year */}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">ปีจดทะเบียน <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="w-full p-3 pr-10 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary transition appearance-none bg-white"
                                >
                                    {yearOptions.map(y => (
                                        <option key={y} value={y}>{y} ({y + 543})</option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Mileage */}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">เลขไมล์ (กม.)</label>
                            <input
                                type="number"
                                value={mileage}
                                onChange={(e) => setMileage(e.target.value)}
                                placeholder="เช่น 45000"
                                className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary transition"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleEstimate}
                        disabled={!canEstimate || estimating}
                        className="w-full mt-6 bg-accent text-white py-3 rounded-xl font-bold text-lg hover:bg-orange-600 transition shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {estimating ? (
                            <><Loader2 size={20} className="animate-spin" /> กำลังประเมินราคา...</>
                        ) : (
                            <><Sparkles size={20} /> ประเมินราคา</>
                        )}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-2 text-red-600">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {/* No data result */}
                {result && !result.estimatedPrice && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6 text-center">
                        <AlertCircle size={32} className="mx-auto text-yellow-500 mb-2" />
                        <h3 className="font-bold text-gray-800 mb-1">ข้อมูลไม่เพียงพอ</h3>
                        <p className="text-gray-500 text-sm">{result.message || 'ยังไม่มีข้อมูลราคารถรุ่นนี้เพียงพอสำหรับการประเมิน'}</p>
                        <p className="text-gray-400 text-xs mt-2">ลองเลือกยี่ห้อหรือรุ่นอื่น หรือลงประกาศขายเพื่อเป็นข้อมูลให้ผู้ขายรายอื่น</p>
                    </div>
                )}

                {/* Results */}
                {result && result.estimatedPrice && (
                    <>
                        {/* Car Info */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                <Car size={24} className="text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">
                                    {result.vehicleInfo.brand} {result.vehicleInfo.model} {result.vehicleInfo.subModel || ''}
                                </h1>
                                <p className="text-gray-500 text-sm">
                                    ปี {result.vehicleInfo.year} ({result.vehicleInfo.year + 543})
                                    {mileage ? ` • ${parseInt(mileage).toLocaleString()} กม.` : ''}
                                </p>
                            </div>
                        </div>

                        {/* Price Card */}
                        <div className="bg-gradient-to-br from-primary to-[#16213E] rounded-3xl p-1 relative overflow-hidden shadow-2xl mb-8">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl transform translate-x-20 -translate-y-20"></div>
                            <div className="bg-white/5 backdrop-blur-sm rounded-[20px] p-6 md:p-10 text-center text-white relative z-10 border border-white/10">

                                <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-blue-200 mb-6 border border-white/20">
                                    <Sparkles className="text-yellow-400" size={14} />
                                    ความมั่นใจ: {Math.round(result.confidence * 100)}%
                                    {result.matchLevel !== 'exact' && (
                                        <span className="text-yellow-300 ml-1">
                                            ({result.matchLevel === 'model' ? 'เทียบจากรุ่นเดียวกัน' : 'เทียบจากยี่ห้อเดียวกัน'})
                                        </span>
                                    )}
                                </div>

                                <h2 className="text-gray-300 text-sm md:text-base mb-2">ราคาขายแนะนำ</h2>

                                <div className="flex items-baseline justify-center gap-2 mb-4">
                                    <span className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
                                        {formatPrice(displayPrice?.low || result.estimatedPrice.low)}
                                    </span>
                                    <span className="text-xl md:text-2xl text-gray-400">-</span>
                                    <span className="text-3xl md:text-5xl font-bold text-white">
                                        {formatPrice(displayPrice?.high || result.estimatedPrice.high)}
                                    </span>
                                    <span className="text-lg text-gray-400 font-medium">บาท</span>
                                </div>

                                <p className="text-sm text-blue-200 mb-6 max-w-lg mx-auto">
                                    *ราคาประเมินจากข้อมูลรถ {result.sampleSize} คัน ที่ลงขายในระบบ Car2Hand
                                </p>

                                {/* Condition Toggle */}
                                <div className="bg-white/10 rounded-xl p-4 max-w-lg mx-auto border border-white/10">
                                    <label className="block text-xs text-gray-300 mb-3 text-left">สภาพรถของคุณ:</label>
                                    <div className="flex gap-2">
                                        {(['FAIR', 'GOOD', 'EXCELLENT'] as const).map((cond) => (
                                            <button
                                                key={cond}
                                                onClick={() => setSelectedCondition(cond)}
                                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${selectedCondition === cond
                                                    ? 'bg-white text-primary shadow-lg scale-105'
                                                    : 'border border-white/10 text-gray-400 hover:bg-white/10'
                                                }`}
                                            >
                                                {conditionLabels[cond]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Analytics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                            {/* Market Trend */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-primary flex items-center gap-2">
                                        {result.marketTrend === 'RISING' && <TrendingUp className="text-green-500" size={20} />}
                                        {result.marketTrend === 'FALLING' && <TrendingDown className="text-red-500" size={20} />}
                                        {result.marketTrend === 'STABLE' && <Minus className="text-blue-500" size={20} />}
                                        แนวโน้มราคา
                                    </h3>
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                        result.marketTrend === 'RISING' ? 'bg-green-100 text-green-700' :
                                        result.marketTrend === 'FALLING' ? 'bg-red-100 text-red-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {result.marketTrend === 'RISING' ? 'ราคากำลังขึ้น' :
                                         result.marketTrend === 'FALLING' ? 'ราคากำลังลง' : 'ราคาคงที่'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-center flex-1">
                                        <BarChart3 size={32} className="mx-auto text-primary mb-2" />
                                        <span className="text-2xl font-bold text-gray-800">{result.sampleSize}</span>
                                        <span className="block text-xs text-gray-400">คันที่ใช้เปรียบเทียบ</span>
                                    </div>
                                    <div className="text-center flex-1">
                                        <span className={`text-2xl font-bold ${
                                            result.demandLevel === 'HIGH' ? 'text-green-600' :
                                            result.demandLevel === 'LOW' ? 'text-red-600' : 'text-yellow-600'
                                        }`}>
                                            {result.demandLevel === 'HIGH' ? 'สูง' :
                                             result.demandLevel === 'LOW' ? 'ต่ำ' : 'ปานกลาง'}
                                        </span>
                                        <span className="block text-xs text-gray-400">ความต้องการในตลาด</span>
                                    </div>
                                </div>
                            </div>

                            {/* Sell Speed */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-primary flex items-center gap-2 mb-2">
                                        <Zap className="text-yellow-500" size={20} /> ความไวในการขาย
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                        {result.avgDaysToSell
                                            ? 'ข้อมูลจากสถิติการขายจริงในระบบ Car2Hand'
                                            : 'ยังไม่มีข้อมูลการขายสำเร็จของรถรุ่นนี้'}
                                    </p>
                                </div>

                                {result.avgDaysToSell ? (
                                    <div className="flex items-center justify-center my-4">
                                        <div className="text-center">
                                            <span className="text-4xl font-bold text-gray-800">
                                                {result.avgDaysToSell} <span className="text-sm text-gray-400 font-normal">วัน</span>
                                            </span>
                                            <span className="block text-xs text-gray-400">เวลาเฉลี่ยในการขาย</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center my-4 text-gray-400 text-sm">ยังไม่มีข้อมูล</div>
                                )}

                                <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg border border-yellow-100 flex gap-2 items-start">
                                    <Lightbulb className="mt-0.5 flex-shrink-0" size={14} />
                                    <span>
                                        {result.demandLevel === 'HIGH'
                                            ? 'รถรุ่นนี้เป็นที่ต้องการสูง ลงขายตอนนี้มีโอกาสขายได้เร็ว!'
                                            : result.demandLevel === 'LOW'
                                            ? 'ตลาดรถรุ่นนี้ค่อนข้างเงียบ อาจต้องใช้เวลาในการขาย'
                                            : 'ตลาดรถรุ่นนี้มีความต้องการปานกลาง ราคาที่เหมาะสมจะช่วยให้ขายเร็วขึ้น'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Similar Listings */}
                        {result.similarListings.length > 0 && (
                            <div className="mb-8">
                                <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                                    <Eye size={20} className="text-primary" />
                                    ประกาศที่คล้ายกัน ({result.similarListings.length} คัน)
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {result.similarListings.map((listing) => (
                                        <Link key={listing.id} href={`/buy/${listing.id}`} className="block">
                                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden">
                                                <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                                                    {listing.image ? (
                                                        <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <Car size={40} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-3">
                                                    <h4 className="font-bold text-sm text-gray-800 truncate">{listing.title}</h4>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                        <span className="flex items-center gap-1"><Calendar size={12} /> {listing.year}</span>
                                                        <span className="flex items-center gap-1"><Gauge size={12} /> {listing.mileage.toLocaleString()} กม.</span>
                                                        {listing.fuelType && <span className="flex items-center gap-1"><Fuel size={12} /> {listing.fuelType}</span>}
                                                    </div>
                                                    <p className="text-primary font-bold mt-2">฿{formatPrice(listing.price)}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer CTA */}
                        <div className="bg-white p-4 border-t border-gray-100 md:border-none md:bg-transparent fixed bottom-0 left-0 w-full md:relative md:p-0 z-40">
                            <div className="max-w-4xl mx-auto flex gap-4">
                                <button
                                    onClick={() => {
                                        // Guests go straight into the form too —
                                        // login is required only at publish.
                                        const createUrl = `/sell?brand=${encodeURIComponent(selectedBrand)}&model=${encodeURIComponent(selectedModel)}&year=${selectedYear}&price=${result!.estimatedPrice!.median}${mileage ? `&mileage=${mileage}` : ''}`;
                                        router.push(createUrl);
                                    }}
                                    className="flex-[2] bg-accent text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition flex items-center justify-center gap-2 text-lg"
                                >
                                    ลงขายที่ราคานี้ <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="h-20 md:hidden"></div>
                    </>
                )}
            </div>

            {/* Login / Register Modals */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSwitchToRegister={() => { setShowLoginModal(false); setShowRegisterModal(true); }}
                redirectTo={pendingRedirect}
            />
            <RegisterModal
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onSwitchToLogin={() => { setShowRegisterModal(false); setShowLoginModal(true); }}
                redirectTo={pendingRedirect}
            />
        </div>
    );
}
