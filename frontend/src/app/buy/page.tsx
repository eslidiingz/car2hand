"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    Faders,
    X,
    CircleNotch,
    MagnifyingGlass,
    Car,
    Motorcycle,
    Gauge,
    MapPin,
    CaretDown,
    Plus,
    Minus
} from '@phosphor-icons/react';
import ListingCard, { VehicleListing } from '@/components/ListingCard';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// Types
interface Brand {
    id: string;
    name: string;
    nameTh: string | null;
    logo: string | null;
    vehicleType: 'CAR' | 'MOTORCYCLE';
}


function BuyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [listings, setListings] = useState<VehicleListing[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [brandStats, setBrandStats] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    const PROVINCES = ['กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี'];

    // Filters - Initialize directly from searchParams to avoid double-fetch/race condition
    const [brands, setBrands] = useState<Brand[]>([]);
    const [bodyStyles, setBodyStyles] = useState<{ value: string, label: string }[]>([]);
    const [motorcycleBodyStyles, setMotorcycleBodyStyles] = useState<{ value: string, label: string }[]>([]);
    const [seatOptions, setSeatOptions] = useState<{ value: number, label: string }[]>([]);
    const [vehicleType, setVehicleType] = useState<'CAR' | 'MOTORCYCLE' | ''>((searchParams.get('vehicleType') as any) || 'CAR');
    const [selectedBrands, setSelectedBrands] = useState<string[]>(searchParams.get('brand')?.split(',').filter(Boolean) || []);
    const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>(searchParams.get('bodyType')?.split(',').filter(Boolean) || []);
    const [selectedSeats, setSelectedSeats] = useState<string>(searchParams.get('seats') || '');
    const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>(searchParams.get('fuelType')?.split(',').filter(Boolean) || []);
    const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>(searchParams.get('transmission')?.split(',').filter(Boolean) || []);
    const [minEngineSize, setMinEngineSize] = useState(searchParams.get('minEngineSize') || '');
    const [maxEngineSize, setMaxEngineSize] = useState(searchParams.get('maxEngineSize') || '');
    const [brandSearch, setBrandSearch] = useState('');
    const [showAllBrands, setShowAllBrands] = useState(false);
    const [bodyType, setBodyType] = useState(searchParams.get('bodyType') || '');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [minYear, setMinYear] = useState(searchParams.get('minYear') || '');
    const [maxYear, setMaxYear] = useState(searchParams.get('maxYear') || '');
    const [maxMileage, setMaxMileage] = useState(searchParams.get('maxMileage') || '');
    const [selectedProvince, setSelectedProvince] = useState(searchParams.get('province') || '');
    const [provinceSearch, setProvinceSearch] = useState('');
    const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
    const [showOnlyWithListings, setShowOnlyWithListings] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
    const provinceRef = useRef<HTMLDivElement>(null);

    // Lock scroll when mobile filters open
    useEffect(() => {
        if (showMobileFilters) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showMobileFilters]);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (provinceRef.current && !provinceRef.current.contains(event.target as Node)) {
                setShowProvinceDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Synchronize filters when searchParams change (e.g. user navigates back/forward)
    useEffect(() => {
        const vType = searchParams.get('vehicleType');
        const bType = searchParams.get('bodyType');
        const brandP = searchParams.get('brand');
        const minP = searchParams.get('minPrice');
        const maxP = searchParams.get('maxPrice');
        const minY = searchParams.get('minYear');
        const maxY = searchParams.get('maxYear');
        const q = searchParams.get('q');
        const p = searchParams.get('page');
        const maxM = searchParams.get('maxMileage');
        const prov = searchParams.get('province');
        const seatsP = searchParams.get('seats');
        const fuelP = searchParams.get('fuelType');
        const transP = searchParams.get('transmission');
        const minE = searchParams.get('minEngineSize');
        const maxE = searchParams.get('maxEngineSize');

        if (vType === 'CAR' || vType === 'MOTORCYCLE' || vType === '') setVehicleType(vType as any || '');
        if (bType !== null) {
            setBodyType(bType);
            setSelectedBodyTypes(bType.split(',').filter(Boolean));
        }
        if (brandP !== null) setSelectedBrands(brandP.split(',').filter(Boolean));
        if (minP !== null) setMinPrice(minP);
        if (maxP !== null) setMaxPrice(maxP);
        if (minY !== null) setMinYear(minY);
        if (maxY !== null) setMaxYear(maxY);
        if (q !== null) setSearchQuery(q);
        if (p !== null) setPage(parseInt(p));
        if (maxM !== null) setMaxMileage(maxM);
        if (prov !== null) setSelectedProvince(prov);
        if (seatsP !== null) setSelectedSeats(seatsP);
        if (fuelP !== null) setSelectedFuelTypes(fuelP.split(',').filter(Boolean));
        if (transP !== null) setSelectedTransmissions(transP.split(',').filter(Boolean));
        if (minE !== null) setMinEngineSize(minE);
        if (maxE !== null) setMaxEngineSize(maxE);
    }, [searchParams]);

    // Login modal
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    const handleSwitchToRegister = () => {
        setShowLoginModal(false);
        setShowRegisterModal(true);
    };

    const handleSwitchToLogin = () => {
        setShowRegisterModal(false);
        setShowLoginModal(true);
    };

    const fetchListings = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('status', 'ACTIVE');
            params.append('page', page.toString());
            params.append('limit', '12');

            if (vehicleType) params.append('vehicleType', vehicleType);
            if (selectedBodyTypes.length > 0) params.append('bodyType', selectedBodyTypes.join(','));
            if (searchQuery) params.append('q', searchQuery);
            if (selectedBrands.length > 0) params.append('brand', selectedBrands.join(','));
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);
            if (minYear) params.append('minYear', minYear);
            if (maxYear) params.append('maxYear', maxYear);
            if (maxMileage) params.append('maxMileage', maxMileage);
            if (selectedProvince) params.append('province', selectedProvince);
            if (selectedSeats) params.append('seats', selectedSeats);
            if (selectedFuelTypes.length > 0) params.append('fuelType', selectedFuelTypes.join(','));
            if (selectedTransmissions.length > 0) params.append('transmission', selectedTransmissions.join(','));
            if (minEngineSize) params.append('minEngineSize', minEngineSize);
            if (maxEngineSize) params.append('maxEngineSize', maxEngineSize);

            console.log('Fetching listings with params:', params.toString());
            const response = await fetch(`http://localhost:8000/listings?${params.toString()}`);
            const data = await response.json();

            setListings(data.listings || []);
            setPagination(data.pagination);
            setBrandStats(data.brandStats || {});
        } catch (error) {
            console.error('Error fetching listings:', error);
            setListings([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchBrands = async () => {
        try {
            const params = new URLSearchParams();
            if (vehicleType) params.append('vehicleType', vehicleType);

            const response = await fetch(`http://localhost:8000/master-data/brands?${params.toString()}`);
            const data = await response.json();
            if (data.success) {
                setBrands(data.brands);
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    const fetchCarOptions = async () => {
        try {
            const response = await fetch(`http://localhost:8000/master-data/car-options`);
            const data = await response.json();
            if (data.success) {
                setBodyStyles(data.bodyStyles);
                setMotorcycleBodyStyles(data.motorcycleBodyStyles);
                setSeatOptions(data.seatOptions);
            }
        } catch (error) {
            console.error('Error fetching car options:', error);
        }
    };

    useEffect(() => {
        fetchBrands();
        fetchCarOptions();
    }, [vehicleType]);

    useEffect(() => {
        fetchListings();
    }, [page, vehicleType, selectedBodyTypes, searchQuery, selectedBrands, minPrice, maxPrice, minYear, maxYear, maxMileage, selectedProvince, selectedSeats, selectedFuelTypes, selectedTransmissions, minEngineSize, maxEngineSize]);

    const clearFilters = () => {
        setVehicleType('CAR');
        setBodyType('');
        setSelectedBodyTypes([]);
        setSelectedSeats('');
        setSearchQuery('');
        setSelectedBrands([]);
        setMinPrice('');
        setMaxPrice('');
        setMinYear('');
        setMaxYear('');
        setMaxMileage('');
        setSelectedProvince('');
        setSelectedFuelTypes([]);
        setSelectedTransmissions([]);
        setMinEngineSize('');
        setMaxEngineSize('');
        setPage(1);
        router.push('/buy');
    };

    const hasActiveFilters = vehicleType || selectedBodyTypes.length > 0 || searchQuery || selectedBrands.length > 0 || minPrice || maxPrice || minYear || maxYear || maxMileage || selectedProvince || selectedSeats || selectedFuelTypes.length > 0 || selectedTransmissions.length > 0 || minEngineSize || maxEngineSize;

    return (
        <div className="bg-surface text-gray-800 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 pt-8 pb-12 flex gap-6">

                {/* Sidebar Filters */}
                <aside className="hidden lg:block w-1/4 min-w-[280px]">
                    <div className="bg-white p-5 rounded-2xl shadow-sm sticky top-24 border border-gray-100 h-[calc(100vh-120px)] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                                <Faders size={20} /> ตัวกรอง
                            </h3>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="text-xs text-accent hover:underline">ล้างค่า</button>
                            )}
                        </div>

                        {/* Scrollable Content Container */}
                        <div className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar space-y-6">


                            {/* Vehicle Type */}
                            <div>
                                <label className="text-sm font-semibold mb-3 block">ประเภทยานพาหนะ</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setVehicleType(vehicleType === 'CAR' ? '' : 'CAR')}
                                        className={`flex-1 p-3 rounded-xl flex flex-col items-center gap-1 transition border-2 ${vehicleType === 'CAR' ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 text-gray-500 hover:border-primary'
                                            }`}
                                    >
                                        <Car weight="bold" size={24} />
                                        <span className="text-xs font-medium">รถยนต์</span>
                                    </button>
                                    <button
                                        onClick={() => setVehicleType(vehicleType === 'MOTORCYCLE' ? '' : 'MOTORCYCLE')}
                                        className={`flex-1 p-3 rounded-xl flex flex-col items-center gap-1 transition border-2 ${vehicleType === 'MOTORCYCLE' ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 text-gray-500 hover:border-primary'
                                            }`}
                                    >
                                        <Motorcycle weight="bold" size={24} />
                                        <span className="text-xs font-medium">มอเตอร์ไซค์</span>
                                    </button>
                                </div>
                            </div>

                            {/* Budget */}
                            <div>
                                <label className="text-sm font-semibold mb-2 block">งบประมาณ (บาท)</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="number"
                                        placeholder="ต่ำสุด"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="form-input w-1/2 font-medium"
                                    />
                                    <input
                                        type="number"
                                        placeholder="สูงสุด"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="form-input w-1/2 font-medium"
                                    />
                                </div>
                            </div>

                            {/* Mileage */}
                            <div>
                                <label className="text-sm font-semibold mb-2 block">เลขไมล์ไม่เกิน (กม.)</label>
                                <div className="relative">
                                    <Gauge size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        placeholder="เช่น 50,000"
                                        value={maxMileage}
                                        onChange={(e) => setMaxMileage(e.target.value)}
                                        className="form-input-icon font-medium"
                                    />
                                </div>
                            </div>

                            {/* Province */}
                            <div className="relative" ref={provinceRef}>
                                <label className="text-sm font-semibold mb-2 block">จังหวัด</label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="เลือกจังหวัด..."
                                        value={showProvinceDropdown ? provinceSearch : (selectedProvince || '')}
                                        onChange={(e) => {
                                            setProvinceSearch(e.target.value);
                                            setShowProvinceDropdown(true);
                                        }}
                                        onFocus={() => {
                                            setProvinceSearch('');
                                            setShowProvinceDropdown(true);
                                        }}
                                        className="form-input-icon w-full cursor-pointer font-medium"
                                    />
                                    <div
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer p-1"
                                        onClick={() => setShowProvinceDropdown(!showProvinceDropdown)}
                                    >
                                        <CaretDown size={14} weight="bold" className={`transition-transform duration-200 ${showProvinceDropdown ? 'rotate-180' : ''}`} />
                                    </div>

                                    {selectedProvince && !showProvinceDropdown && (
                                        <button
                                            onClick={() => setSelectedProvince('')}
                                            className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                                        >
                                            <X size={12} weight="bold" />
                                        </button>
                                    )}
                                </div>

                                {showProvinceDropdown && (
                                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                                        <div className="p-1">
                                            <button
                                                onClick={() => {
                                                    setSelectedProvince('');
                                                    setShowProvinceDropdown(false);
                                                    setProvinceSearch('');
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg text-gray-500"
                                            >
                                                ทุกจังหวัด
                                            </button>
                                            {PROVINCES.filter(p =>
                                                p.toLowerCase().includes(provinceSearch.toLowerCase())
                                            ).map(p => (
                                                <button
                                                    key={p}
                                                    onClick={() => {
                                                        setSelectedProvince(p);
                                                        setShowProvinceDropdown(false);
                                                        setProvinceSearch('');
                                                    }}
                                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors ${selectedProvince === p ? 'bg-blue-50 text-primary font-bold' : 'text-gray-700'}`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                            {PROVINCES.filter(p =>
                                                p.toLowerCase().includes(provinceSearch.toLowerCase())
                                            ).length === 0 && (
                                                    <div className="px-3 py-2 text-xs text-gray-400 text-center italic">ไม่พบจังหวัด</div>
                                                )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Advanced Filters Toggle */}
                            <div className="pt-2">
                                <button
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    className="w-full py-3 px-4 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:text-primary hover:border-primary hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                                >
                                    {showAdvancedFilters ? <Minus size={16} /> : <Plus size={16} />}
                                    {showAdvancedFilters ? 'ซ่อนการกรองแบบละเอียด' : 'แสดงการกรองแบบละเอียด'}
                                </button>
                            </div>

                            {/* Advanced Filters Content */}
                            <div className={`space-y-6 overflow-hidden transition-all duration-300 ${showAdvancedFilters ? 'max-h-[2000px] opacity-100 visible' : 'max-h-0 opacity-0 invisible overflow-hidden'}`}>
                                {/* Year */}
                                <div>
                                    <label className="text-sm font-semibold mb-2 block text-gray-700">ปีที่ผลิต</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="ตั้งแต่ปี"
                                            value={minYear}
                                            onChange={(e) => setMinYear(e.target.value)}
                                            className="form-input w-1/2 font-medium"
                                        />
                                        <input
                                            type="number"
                                            placeholder="ถึงปี"
                                            value={maxYear}
                                            onChange={(e) => setMaxYear(e.target.value)}
                                            className="form-input w-1/2 font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Vehicle Specific Filters: Body Style, Seats, Transmission, Fuel, Engine Size */}
                                {(vehicleType === 'CAR' || vehicleType === 'MOTORCYCLE') && (
                                    <>
                                        <div>
                                            <label className="text-sm font-semibold mb-3 block text-gray-700">รูปแบบรถ</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {(vehicleType === 'MOTORCYCLE' ? motorcycleBodyStyles : bodyStyles).map((style) => (
                                                    <button
                                                        key={style.value}
                                                        onClick={() => {
                                                            if (selectedBodyTypes.includes(style.value)) {
                                                                setSelectedBodyTypes(selectedBodyTypes.filter(t => t !== style.value));
                                                            } else {
                                                                setSelectedBodyTypes([...selectedBodyTypes, style.value]);
                                                            }
                                                            setPage(1);
                                                        }}
                                                        className={`py-2 px-1 rounded-xl text-[11px] font-semibold border transition-all ${selectedBodyTypes.includes(style.value)
                                                            ? 'bg-primary border-primary text-white shadow-md'
                                                            : 'bg-white border-gray-200 text-gray-600 hover:border-primary hover:text-primary shadow-sm active:scale-95'
                                                            }`}
                                                    >
                                                        {style.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {vehicleType === 'CAR' && (
                                            <div className="mb-6">
                                                <label className="text-sm font-semibold mb-3 block text-gray-700">จำนวนที่นั่ง</label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {seatOptions.filter(o => o.value !== 8).map((option) => (
                                                        <button
                                                            key={option.value}
                                                            onClick={() => {
                                                                setSelectedSeats(selectedSeats === option.value.toString() ? '' : option.value.toString());
                                                                setPage(1);
                                                            }}
                                                            className={`py-2.5 rounded-xl text-sm font-bold border transition-all flex items-center justify-center ${selectedSeats === option.value.toString()
                                                                ? 'bg-primary border-primary text-white shadow-md translate-y-[-1px]'
                                                                : 'bg-white border-gray-200 text-gray-600 hover:border-primary hover:text-primary shadow-sm active:scale-90'
                                                                }`}
                                                        >
                                                            {option.value}{option.value === 7 ? '+' : ''}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="text-sm font-semibold mb-3 block text-gray-700">ระบบเกียร์</label>
                                            <div className="flex gap-2">
                                                {[
                                                    { value: 'AUTOMATIC', label: 'ออโต้' },
                                                    { value: 'MANUAL', label: 'ธรรมดา' }
                                                ].map((t) => (
                                                    <button
                                                        key={t.value}
                                                        onClick={() => {
                                                            if (selectedTransmissions.includes(t.value)) {
                                                                setSelectedTransmissions(selectedTransmissions.filter(item => item !== t.value));
                                                            } else {
                                                                setSelectedTransmissions([...selectedTransmissions, t.value]);
                                                            }
                                                            setPage(1);
                                                        }}
                                                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${selectedTransmissions.includes(t.value)
                                                            ? 'bg-primary border-primary text-white shadow-md'
                                                            : 'bg-white border-gray-200 text-gray-600 hover:border-primary hover:text-primary shadow-sm active:scale-95'
                                                            }`}
                                                    >
                                                        {t.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-semibold mb-3 block text-gray-700">ประเภทเชื้อเพลิง</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { value: 'PETROL', label: 'เบนซิน' },
                                                    { value: 'DIESEL', label: 'ดีเซล' },
                                                    { value: 'EV', label: 'ไฟฟ้า (EV)' },
                                                    { value: 'HYBRID', label: 'Hybrid' },
                                                    { value: 'PLUGIN_HYBRID', label: 'Plug-in Hybrid' },
                                                    { value: 'LPG', label: 'LPG' },
                                                    { value: 'NGV', label: 'NGV' },
                                                ].filter(f => vehicleType === 'MOTORCYCLE' ? ['PETROL', 'EV'].includes(f.value) : true).map((f) => (
                                                    <button
                                                        key={f.value}
                                                        onClick={() => {
                                                            if (selectedFuelTypes.includes(f.value)) {
                                                                setSelectedFuelTypes(selectedFuelTypes.filter(item => item !== f.value));
                                                            } else {
                                                                setSelectedFuelTypes([...selectedFuelTypes, f.value]);
                                                            }
                                                            setPage(1);
                                                        }}
                                                        className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition-all ${selectedFuelTypes.includes(f.value)
                                                            ? 'bg-primary border-primary text-white shadow-md'
                                                            : 'bg-white border-gray-200 text-gray-600 hover:border-primary hover:text-primary shadow-sm active:scale-95'
                                                            }`}
                                                    >
                                                        {f.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-semibold mb-2 block text-gray-700">ขนาดเครื่องยนต์ (CC)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="เริ่มต้น"
                                                    value={minEngineSize}
                                                    onChange={(e) => setMinEngineSize(e.target.value)}
                                                    className="form-input w-1/2 font-medium"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="สูงสุด"
                                                    value={maxEngineSize}
                                                    onChange={(e) => setMaxEngineSize(e.target.value)}
                                                    className="form-input w-1/2 font-medium"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div> {/* End Advanced Filters Content */}

                            {/* Brand */}
                            <div className="flex flex-col min-h-[300px]">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-sm font-semibold">ยี่ห้อ</label>
                                    <label className="flex items-center gap-1.5 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={showOnlyWithListings}
                                            onChange={(e) => setShowOnlyWithListings(e.target.checked)}
                                            className="peer hidden"
                                        />
                                        <div className={`w-3.5 h-3.5 border rounded-sm flex items-center justify-center transition-colors ${showOnlyWithListings ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                                            {showOnlyWithListings && (
                                                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            )}
                                        </div>
                                        <span className={`text-[10px] font-medium transition-colors ${showOnlyWithListings ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`}>
                                            แสดงเฉพาะที่มีรถ
                                        </span>
                                    </label>
                                </div>

                                {/* Brand Search Input */}
                                <div className="relative mb-3">
                                    <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="ค้นหายี่ห้อ..."
                                        value={brandSearch}
                                        onChange={(e) => setBrandSearch(e.target.value)}
                                        className="form-input-icon font-medium"
                                    />
                                </div>

                                <div className="relative flex-1 min-h-0">
                                    <div className="space-y-1 pr-2 h-full overflow-y-auto custom-scrollbar pb-6">
                                        {(() => {
                                            const filteredBrands = [...brands]
                                                .sort((a, b) => {
                                                    const countA = brandStats[a.name] || 0;
                                                    const countB = brandStats[b.name] || 0;
                                                    if (countB !== countA) return countB - countA;
                                                    return a.name.localeCompare(b.name);
                                                })
                                                .filter(b => {
                                                    const count = brandStats[b.name] || 0;
                                                    const passesSearch = b.name.toLowerCase().includes(brandSearch.toLowerCase()) ||
                                                        (b.nameTh && b.nameTh.toLowerCase().includes(brandSearch.toLowerCase()));

                                                    if (showOnlyWithListings) {
                                                        return count > 0 && passesSearch;
                                                    }
                                                    return passesSearch;
                                                });

                                            const displayedBrands = showAllBrands ? filteredBrands : filteredBrands.slice(0, 5);

                                            return (
                                                <>
                                                    {displayedBrands.map(b => (
                                                        <label key={b.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition duration-200 group">
                                                            <div className="relative flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedBrands.includes(b.name)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setSelectedBrands([...selectedBrands, b.name]);
                                                                        } else {
                                                                            setSelectedBrands(selectedBrands.filter(s => s !== b.name));
                                                                        }
                                                                        setPage(1);
                                                                    }}
                                                                    className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-primary checked:border-primary transition-all duration-200 cursor-pointer"
                                                                />
                                                                <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                                </svg>
                                                            </div>
                                                            <span className={`text-sm transition-colors duration-200 ${selectedBrands.includes(b.name) ? 'text-primary font-bold' : 'text-gray-600 group-hover:text-primary'}`}>
                                                                {b.name} <span className="text-xs text-gray-400 font-normal ml-1">({brandStats[b.name] || 0})</span>
                                                            </span>
                                                        </label>
                                                    ))}

                                                    {filteredBrands.length > 5 && (
                                                        <button
                                                            onClick={() => setShowAllBrands(!showAllBrands)}
                                                            className="w-full py-2 text-xs font-bold text-primary hover:text-accent transition-colors flex items-center justify-center gap-1 mt-1 border-t border-gray-50"
                                                        >
                                                            {showAllBrands ? (
                                                                <>แสดงน้อยลง <CaretDown size={14} className="rotate-180" /></>
                                                            ) : (
                                                                <>ดูยี่ห้อทั้งหมด ({filteredBrands.length}) <CaretDown size={14} /></>
                                                            )}
                                                        </button>
                                                    )}
                                                </>
                                            );
                                        })()}
                                        {brands.filter(b => {
                                            const count = brandStats[b.name] || 0;
                                            const passesSearch = b.name.toLowerCase().includes(brandSearch.toLowerCase()) ||
                                                (b.nameTh && b.nameTh.toLowerCase().includes(brandSearch.toLowerCase()));

                                            if (showOnlyWithListings) {
                                                return count > 0 && passesSearch;
                                            }
                                            return passesSearch;
                                        }).length === 0 && (
                                                <p className="text-xs text-center text-gray-400 py-4">ไม่พบยี่ห้อนี้</p>
                                            )}
                                    </div>
                                    {/* Visual cue: Bottom shadow/gradient for scrollable content */}
                                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
                                </div>
                            </div>

                        </div> {/* End Scrollable Content Container */}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                            <div className="flex justify-between items-center w-full md:w-auto">
                                <div>
                                    <h1 className="text-xl md:text-2xl font-bold text-primary">
                                        {vehicleType === 'CAR' ? 'รถยนต์' : vehicleType === 'MOTORCYCLE' ? 'มอเตอร์ไซค์' : 'รถทั้งหมด'}
                                        {selectedBrands.length === 1 && ` ${selectedBrands[0]}`}
                                        {selectedBrands.length > 1 && ` (เลือกรายยี่ห้อ)`}
                                        <span className="text-gray-400 text-base md:text-lg font-normal ml-2">({pagination?.total || 0})</span>
                                    </h1>
                                </div>

                                {/* Mobile Filter Button */}
                                <button
                                    onClick={() => setShowMobileFilters(true)}
                                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 active:scale-95 transition-all"
                                >
                                    <Faders size={18} weight="bold" />
                                    <span>ตัวกรอง</span>
                                </button>
                            </div>

                            <div className="w-full md:w-auto">
                                {hasActiveFilters && (
                                    <div className="flex gap-2 flex-wrap">
                                        {vehicleType && (
                                            <span className="bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-xs cursor-pointer flex items-center gap-1 hover:border-accent hover:text-accent transition group"
                                                onClick={() => setVehicleType('')}>
                                                {vehicleType === 'CAR' ? 'รถยนต์' : 'มอเตอร์ไซค์'} <X className="group-hover:text-accent text-gray-400" size={12} />
                                            </span>
                                        )}
                                        {searchQuery && (
                                            <span className="bg-accent/10 text-accent border border-accent/20 px-3 py-1 rounded-full text-xs cursor-pointer flex items-center gap-1 hover:bg-accent/20 transition group"
                                                onClick={() => setSearchQuery('')}>
                                                ค้นหา: &quot;{searchQuery}&quot; <X className="group-hover:text-primary" size={12} />
                                            </span>
                                        )}
                                        {minPrice && (
                                            <span className="bg-green-50 text-green-600 border border-green-200 px-3 py-1 rounded-full text-xs cursor-pointer flex items-center gap-1 hover:bg-green-100 transition group"
                                                onClick={() => setMinPrice('')}>
                                                ราคาเริ่มต้น: {Number(minPrice).toLocaleString()} <X className="group-hover:text-accent" size={12} />
                                            </span>
                                        )}
                                        {maxPrice && (
                                            <span className="bg-green-50 text-green-600 border border-green-200 px-3 py-1 rounded-full text-xs cursor-pointer flex items-center gap-1 hover:bg-green-100 transition group"
                                                onClick={() => setMaxPrice('')}>
                                                ราคาสูงสุด: {Number(maxPrice).toLocaleString()} <X className="group-hover:text-accent" size={12} />
                                            </span>
                                        )}
                                        {minYear && (
                                            <span className="bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1 rounded-full text-xs cursor-pointer flex items-center gap-1 hover:bg-orange-100 transition group"
                                                onClick={() => setMinYear('')}>
                                                ตั้งแต่ปี: {minYear} <X className="group-hover:text-accent" size={12} />
                                            </span>
                                        )}
                                        {maxYear && (
                                            <span className="bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1 rounded-full text-xs cursor-pointer flex items-center gap-1 hover:bg-orange-100 transition group"
                                                onClick={() => setMaxYear('')}>
                                                ถึงปี: {maxYear} <X className="group-hover:text-accent" size={12} />
                                            </span>
                                        )}
                                        {maxMileage && (
                                            <span className="bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1 rounded-full text-xs cursor-pointer flex items-center gap-1 hover:bg-gray-200 transition group"
                                                onClick={() => setMaxMileage('')}>
                                                ไมล์ไม่เกิน: {Number(maxMileage).toLocaleString()} กม. <X className="group-hover:text-accent" size={12} />
                                            </span>
                                        )}
                                        {selectedBodyTypes.map(t => (
                                            <span key={t} className="bg-blue-50 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs cursor-pointer flex items-center gap-1 hover:bg-blue-100 transition group"
                                                onClick={() => setSelectedBodyTypes(selectedBodyTypes.filter(type => type !== t))}>
                                                รูปแบบ: {bodyStyles.find(bs => bs.value === t)?.label || t} <X className="group-hover:text-accent" size={12} />
                                            </span>
                                        ))}
                                        {selectedSeats && (
                                            <span className="bg-purple-50 text-purple-600 border border-purple-200 px-3 py-1 rounded-full text-xs cursor-pointer flex items-center gap-1 hover:bg-purple-100 transition group"
                                                onClick={() => setSelectedSeats('')}>
                                                {seatOptions.find(so => so.value.toString() === selectedSeats)?.label || `${selectedSeats}${selectedSeats === '7' ? '+' : ''} ที่นั่ง`} <X className="group-hover:text-accent" size={12} />
                                            </span>
                                        )}
                                        {selectedTransmissions.map(t => (
                                            <span key={t} className="bg-cyan-50 text-cyan-700 border border-cyan-200 px-3 py-1 rounded-full text-xs cursor-pointer flex items-center gap-1 hover:bg-cyan-100 transition group"
                                                onClick={() => setSelectedTransmissions(selectedTransmissions.filter(item => item !== t))}>
                                                เกียร์: {t === 'AUTOMATIC' ? 'ออโต้' : 'ธรรมดา'} <X className="group-hover:text-accent" size={12} />
                                            </span>
                                        ))}
                                        {selectedFuelTypes.map(f => (
                                            <span key={f} className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-xs cursor-pointer flex items-center gap-1 hover:bg-yellow-100 transition group"
                                                onClick={() => setSelectedFuelTypes(selectedFuelTypes.filter(item => item !== f))}>
                                                เชื้อเพลิง: {f === 'PETROL' ? 'เบนซิน' : f === 'DIESEL' ? 'ดีเซล' : f === 'HYBRID' ? 'ไฮบริด' : f === 'EV' ? 'ไฟฟ้า' : f} <X className="group-hover:text-accent" size={12} />
                                            </span>
                                        ))}
                                        {minEngineSize && (
                                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs cursor-pointer flex items-center gap-1 hover:bg-indigo-100 transition group"
                                                onClick={() => setMinEngineSize('')}>
                                                เครื่องยนต์ตั้งแต่: {Number(minEngineSize).toLocaleString()} CC <X className="group-hover:text-accent" size={12} />
                                            </span>
                                        )}
                                        {maxEngineSize && (
                                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs cursor-pointer flex items-center gap-1 hover:bg-indigo-100 transition group"
                                                onClick={() => setMaxEngineSize('')}>
                                                เครื่องยนต์ไม่เกิน: {Number(maxEngineSize).toLocaleString()} CC <X className="group-hover:text-accent" size={12} />
                                            </span>
                                        )}
                                        {selectedProvince && (
                                            <span className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full text-xs cursor-pointer flex items-center gap-1 hover:bg-red-100 transition group"
                                                onClick={() => setSelectedProvince('')}>
                                                จังหวัด: {selectedProvince} <X className="group-hover:text-accent" size={12} />
                                            </span>
                                        )}
                                        {selectedBrands.map(b => (
                                            <span key={b} className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs cursor-pointer flex items-center gap-1 hover:bg-primary/20 transition group"
                                                onClick={() => setSelectedBrands(selectedBrands.filter(brand => brand !== b))}>
                                                {b} <X className="group-hover:text-accent" size={12} />
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <CircleNotch size={48} className="animate-spin text-primary mx-auto mb-4" />
                                <p className="text-gray-500">กำลังโหลด...</p>
                            </div>
                        </div>
                    ) : listings.length === 0 ? (
                        /* Empty State */
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                            <MagnifyingGlass size={64} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-700 mb-2">ไม่พบรายการ</h3>
                            <p className="text-gray-500 mb-4">ลองเปลี่ยนตัวกรองหรือค้นหาใหม่</p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-opacity-90 transition"
                                >
                                    ล้างตัวกรอง
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Listings Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {listings.map((listing) => (
                                    <ListingCard
                                        key={listing.id}
                                        listing={listing}
                                        onLoginRequired={() => setShowLoginModal(true)}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.totalPages > 1 && (
                                <div className="mt-12 flex justify-center gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-primary hover:text-primary hover:bg-gray-50 transition flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        &lt;
                                    </button>
                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                        let pageNum = i + 1;
                                        if (pagination.totalPages > 5 && page > 3) {
                                            pageNum = Math.min(page - 2 + i, pagination.totalPages - 4 + i);
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={`w-10 h-10 rounded-xl font-bold transition flex items-center justify-center shadow-sm ${page === pageNum
                                                    ? 'bg-primary text-white shadow-primary/30'
                                                    : 'bg-white border border-gray-200 text-gray-500 hover:border-primary hover:text-primary hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                        disabled={page === pagination.totalPages}
                                        className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-primary hover:text-primary hover:bg-gray-50 transition flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        &gt;
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Mobile Filters Drawer */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-white lg:hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                            <Faders size={20} /> ตัวกรอง
                        </h3>
                        <div className="flex items-center gap-4">
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="text-sm text-accent font-bold">ล้างค่า</button>
                            )}
                            <button
                                onClick={() => setShowMobileFilters(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={24} weight="bold" />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Filter Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-32">
                        {/* Copy of Sidebar Content - We should ideally refactor this into a component */}
                        {/* Vehicle Type */}
                        <div>
                            <label className="text-sm font-semibold mb-3 block">ประเภทยานพาหนะ</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setVehicleType(vehicleType === 'CAR' ? '' : 'CAR')}
                                    className={`flex-1 p-3 rounded-xl flex flex-col items-center gap-1 transition border-2 ${vehicleType === 'CAR' ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 text-gray-500 hover:border-primary'}`}
                                >
                                    <Car weight="bold" size={24} />
                                    <span className="text-xs font-medium">รถยนต์</span>
                                </button>
                                <button
                                    onClick={() => setVehicleType(vehicleType === 'MOTORCYCLE' ? '' : 'MOTORCYCLE')}
                                    className={`flex-1 p-3 rounded-xl flex flex-col items-center gap-1 transition border-2 ${vehicleType === 'MOTORCYCLE' ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 text-gray-500 hover:border-primary'}`}
                                >
                                    <Motorcycle weight="bold" size={24} />
                                    <span className="text-xs font-medium">มอเตอร์ไซค์</span>
                                </button>
                            </div>
                        </div>

                        {/* Budget */}
                        <div>
                            <label className="text-sm font-semibold mb-2 block">งบประมาณ (บาท)</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="number"
                                    placeholder="ต่ำสุด"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="form-input w-1/2 font-medium"
                                />
                                <input
                                    type="number"
                                    placeholder="สูงสุด"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="form-input w-1/2 font-medium"
                                />
                            </div>
                        </div>

                        {/* Mileage */}
                        <div>
                            <label className="text-sm font-semibold mb-2 block">เลขไมล์ไม่เกิน (กม.)</label>
                            <div className="relative">
                                <Gauge size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="number"
                                    placeholder="เช่น 50,000"
                                    value={maxMileage}
                                    onChange={(e) => setMaxMileage(e.target.value)}
                                    className="form-input-icon font-medium"
                                />
                            </div>
                        </div>

                        {/* Province */}
                        <div className="relative">
                            <label className="text-sm font-semibold mb-2 block">จังหวัด</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="เลือกจังหวัด..."
                                    value={showProvinceDropdown ? provinceSearch : (selectedProvince || '')}
                                    onChange={(e) => {
                                        setProvinceSearch(e.target.value);
                                        setShowProvinceDropdown(true);
                                    }}
                                    onFocus={() => {
                                        setProvinceSearch('');
                                        setShowProvinceDropdown(true);
                                    }}
                                    className="form-input-icon w-full cursor-pointer font-medium"
                                />
                                <div
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer p-1"
                                    onClick={() => setShowProvinceDropdown(!showProvinceDropdown)}
                                >
                                    <CaretDown size={14} weight="bold" className={`transition-transform duration-200 ${showProvinceDropdown ? 'rotate-180' : ''}`} />
                                </div>
                                {selectedProvince && !showProvinceDropdown && (
                                    <button onClick={() => setSelectedProvince('')} className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">
                                        <X size={12} weight="bold" />
                                    </button>
                                )}
                            </div>
                            {showProvinceDropdown && (
                                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                                    <div className="p-1">
                                        <button onClick={() => { setSelectedProvince(''); setShowProvinceDropdown(false); setProvinceSearch(''); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg text-gray-500">ทุกจังหวัด</button>
                                        {PROVINCES.filter(p => p.toLowerCase().includes(provinceSearch.toLowerCase())).map(p => (
                                            <button key={p} onClick={() => { setSelectedProvince(p); setShowProvinceDropdown(false); setProvinceSearch(''); }} className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors ${selectedProvince === p ? 'bg-blue-50 text-primary font-bold' : 'text-gray-700'}`}>{p}</button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Brand */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-sm font-semibold">ยี่ห้อ</label>
                                <label className="flex items-center gap-1.5 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={showOnlyWithListings}
                                        onChange={(e) => setShowOnlyWithListings(e.target.checked)}
                                        className="peer hidden"
                                    />
                                    <div className={`w-3.5 h-3.5 border rounded-sm flex items-center justify-center transition-colors ${showOnlyWithListings ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                                        {showOnlyWithListings && (
                                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-medium transition-colors ${showOnlyWithListings ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`}>
                                        แสดงเฉพาะที่มีรถ
                                    </span>
                                </label>
                            </div>
                            <div className="relative mb-3">
                                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="ค้นหายี่ห้อ..."
                                    value={brandSearch}
                                    onChange={(e) => setBrandSearch(e.target.value)}
                                    className="form-input-icon font-medium"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                                {brands
                                    .sort((a, b) => (brandStats[b.name] || 0) - (brandStats[a.name] || 0))
                                    .filter(b => {
                                        const count = brandStats[b.name] || 0;
                                        const passesSearch = b.name.toLowerCase().includes(brandSearch.toLowerCase()) ||
                                            (b.nameTh && b.nameTh.toLowerCase().includes(brandSearch.toLowerCase()));
                                        if (showOnlyWithListings) return count > 0 && passesSearch;
                                        return passesSearch;
                                    })
                                    .map(b => (
                                        <button
                                            key={b.id}
                                            onClick={() => {
                                                if (selectedBrands.includes(b.name)) {
                                                    setSelectedBrands(selectedBrands.filter(s => s !== b.name));
                                                } else {
                                                    setSelectedBrands([...selectedBrands, b.name]);
                                                }
                                                setPage(1);
                                            }}
                                            className={`py-2 px-2 rounded-xl text-xs font-semibold border text-left transition-all ${selectedBrands.includes(b.name) ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-gray-100 text-gray-600 hover:border-primary'}`}
                                        >
                                            <div className="flex justify-between items-center w-full">
                                                <span>{b.name}</span>
                                                <span className={`text-[10px] ${selectedBrands.includes(b.name) ? 'text-white/80' : 'text-gray-400'}`}>
                                                    ({brandStats[b.name] || 0})
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        </div>

                        {/* Advanced Filters Toggle */}
                        <div className="pt-2">
                            <button
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className="w-full py-4 px-4 rounded-xl border-2 border-dashed border-gray-100 text-gray-500 hover:text-primary hover:border-primary hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                            >
                                {showAdvancedFilters ? <Minus size={16} /> : <Plus size={16} />}
                                {showAdvancedFilters ? 'ซ่อนการกรองแบบละเอียด' : 'แสดงการกรองแบบละเอียด'}
                            </button>
                        </div>

                        {/* Advanced Filters Content */}
                        {showAdvancedFilters && (
                            <div className="space-y-8">
                                {/* Year */}
                                <div>
                                    <label className="text-sm font-semibold mb-2 block text-gray-700">ปีที่ผลิต</label>
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="ตั้งแต่ปี" value={minYear} onChange={(e) => setMinYear(e.target.value)} className="form-input w-1/2 font-medium" />
                                        <input type="number" placeholder="ถึงปี" value={maxYear} onChange={(e) => setMaxYear(e.target.value)} className="form-input w-1/2 font-medium" />
                                    </div>
                                </div>

                                {/* Body Styles */}
                                <div>
                                    <label className="text-sm font-semibold mb-3 block text-gray-700">รูปแบบรถ</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(vehicleType === 'MOTORCYCLE' ? motorcycleBodyStyles : bodyStyles).map((style) => (
                                            <button
                                                key={style.value}
                                                onClick={() => {
                                                    if (selectedBodyTypes.includes(style.value)) {
                                                        setSelectedBodyTypes(selectedBodyTypes.filter(t => t !== style.value));
                                                    } else {
                                                        setSelectedBodyTypes([...selectedBodyTypes, style.value]);
                                                    }
                                                    setPage(1);
                                                }}
                                                className={`py-3 px-1 rounded-xl text-xs font-semibold border transition-all ${selectedBodyTypes.includes(style.value) ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 shadow-sm'}`}
                                            >
                                                {style.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Transmission */}
                                <div>
                                    <label className="text-sm font-semibold mb-3 block text-gray-700">ระบบเกียร์</label>
                                    <div className="flex gap-2">
                                        {[
                                            { value: 'AUTOMATIC', label: 'ออโต้' },
                                            { value: 'MANUAL', label: 'ธรรมดา' }
                                        ].map((t) => (
                                            <button
                                                key={t.value}
                                                onClick={() => {
                                                    if (selectedTransmissions.includes(t.value)) {
                                                        setSelectedTransmissions(selectedTransmissions.filter(item => item !== t.value));
                                                    } else {
                                                        setSelectedTransmissions([...selectedTransmissions, t.value]);
                                                    }
                                                }}
                                                className={`flex-1 py-3 rounded-xl text-xs font-semibold border transition-all ${selectedTransmissions.includes(t.value) ? 'bg-primary border-primary text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Fuel Type */}
                                <div>
                                    <label className="text-sm font-semibold mb-3 block text-gray-700">ประเภทเชื้อเพลิง</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { value: 'PETROL', label: 'เบนซิน' },
                                            { value: 'DIESEL', label: 'ดีเซล' },
                                            { value: 'EV', label: 'ไฟฟ้า (EV)' },
                                            { value: 'HYBRID', label: 'Hybrid' },
                                        ].map((f) => (
                                            <button
                                                key={f.value}
                                                onClick={() => {
                                                    if (selectedFuelTypes.includes(f.value)) {
                                                        setSelectedFuelTypes(selectedFuelTypes.filter(item => item !== f.value));
                                                    } else {
                                                        setSelectedFuelTypes([...selectedFuelTypes, f.value]);
                                                    }
                                                }}
                                                className={`py-3 px-1 rounded-xl text-xs font-semibold border transition-all ${selectedFuelTypes.includes(f.value) ? 'bg-primary border-primary text-white' : 'bg-white border-gray-100 text-gray-600'}`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer - Apply Filter */}
                    <div className="p-4 border-t border-gray-100 bg-white">
                        <button
                            onClick={() => setShowMobileFilters(false)}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-xl active:scale-[0.98] transition-all"
                        >
                            แสดงผลลัพธ์ ({pagination?.total || 0})
                        </button>
                    </div>
                </div>
            )}

            {/* Login Modal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSwitchToRegister={handleSwitchToRegister}
            />

            {/* Register Modal */}
            <RegisterModal
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onSwitchToLogin={handleSwitchToLogin}
            />
        </div>
    );
}

export default function BuyPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <CircleNotch size={48} className="animate-spin text-primary" />
            </div>
        }>
            <BuyContent />
        </Suspense>
    );
}
