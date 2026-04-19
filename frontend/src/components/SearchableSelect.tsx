"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X, Plus } from 'lucide-react';

export interface SelectOption {
    id: string;
    label: string;
    subLabel?: string;
    image?: string;
    color?: string; // hex color สำหรับแสดงวงกลมสี
    colorBorder?: boolean; // ขอบสีเทาสำหรับสีอ่อน (ขาว)
    group?: string;
    isPopular?: boolean;
}

interface SearchableSelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string, option: SelectOption | null) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    loading?: boolean;
    emptyMessage?: string;
    className?: string;
    compact?: boolean; // minimal style — no border, no height, for embedding in containers
    icon?: React.ReactNode;
    allowCustom?: boolean;
    customLabel?: string;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'เลือก...',
    searchPlaceholder = 'พิมพ์เพื่อค้นหา...',
    disabled = false,
    loading = false,
    emptyMessage = 'ไม่พบข้อมูล',
    className = '',
    compact = false,
    icon,
    allowCustom = false,
    customLabel = 'ใช้ค่า "{search}"'
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Find selected option
    const selectedOption = options.find(opt => opt.id === value) || (value && allowCustom ? { id: value, label: value.startsWith('custom:') ? value.slice(7) : value } : null);

    // Filter options based on search
    const filteredOptions = options.filter(opt => {
        const searchLower = search.toLowerCase();
        return (
            opt.label.toLowerCase().includes(searchLower) ||
            opt.subLabel?.toLowerCase().includes(searchLower)
        );
    });

    // Group options
    const groupedOptions = filteredOptions.reduce((acc, opt) => {
        const group = opt.isPopular ? 'ยอดนิยม' : (opt.group || 'อื่นๆ');
        if (!acc[group]) acc[group] = [];
        acc[group].push(opt);
        return acc;
    }, {} as Record<string, SelectOption[]>);

    // Sort groups (popular first)
    const sortedGroups = Object.keys(groupedOptions).sort((a, b) => {
        if (a === 'ยอดนิยม') return -1;
        if (b === 'ยอดนิยม') return 1;
        return a.localeCompare(b);
    });

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (option: SelectOption) => {
        onChange(option.id, option);
        setIsOpen(false);
        setSearch('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('', null);
        setSearch('');
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Selected Value Trigger */}
            <div
                onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
                className={`w-full outline-none transition text-base text-left flex items-center justify-between gap-2 ${compact ? 'h-auto bg-transparent' : `h-12 border rounded-xl ${isOpen ? 'border-primary ring-1 ring-primary' : ''}`} ${icon ? 'pl-11' : compact ? 'pl-0' : 'pl-4'} ${compact ? 'pr-0' : 'pr-4'} ${disabled || loading ? 'bg-gray-200/50 dark:bg-muted/40 border-gray-100 cursor-not-allowed' : compact ? 'cursor-pointer' : 'bg-white border-gray-200 cursor-pointer hover:border-primary'
                    }`}
            >
                {icon && (
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${disabled || loading ? 'text-gray-300' : 'text-gray-400'}`}>
                        {icon}
                    </div>
                )}
                <span className={selectedOption ? 'text-gray-800' : 'text-gray-400 truncate'}>
                    {loading ? 'กำลังโหลด...' : selectedOption ? (
                        <span className="flex items-center gap-2">
                            {selectedOption.color && (
                                <span
                                    className={`w-5 h-5 rounded-full flex-shrink-0 ${selectedOption.colorBorder ? 'border border-gray-300' : ''}`}
                                    style={{ background: selectedOption.color }}
                                />
                            )}
                            {selectedOption.image && (
                                <img
                                    src={selectedOption.image}
                                    alt={selectedOption.label}
                                    className="w-6 h-6 object-contain"
                                />
                            )}
                            <span>{selectedOption.label}</span>
                            {selectedOption.subLabel && (
                                <span className="text-gray-400 text-sm">({selectedOption.subLabel})</span>
                            )}
                        </span>
                    ) : placeholder}
                </span>
                <div className="flex items-center gap-1">
                    {selectedOption && !disabled && (
                        <span
                            onClick={handleClear}
                            className="p-1 hover:bg-gray-200 rounded-full transition cursor-pointer"
                        >
                            <X size={14} className="text-gray-400" />
                        </span>
                    )}
                    <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className={`absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden ${compact ? '-left-4 -right-4 top-full' : 'w-full'}`}>
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-64 overflow-y-auto">
                        {filteredOptions.length === 0 && !(allowCustom && search.trim()) ? (
                            <div className="p-4 text-center text-gray-400 text-sm">
                                {emptyMessage}
                            </div>
                        ) : null}

                        {allowCustom && search.trim() !== '' && !options.some(opt => opt.label.toLowerCase() === search.toLowerCase()) && (
                            <button
                                type="button"
                                onClick={() => handleSelect({ id: `custom:${search}`, label: search })}
                                className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-blue-50 transition border-b border-gray-100 text-primary font-medium"
                            >
                                <Plus size={18} />
                                <span>{customLabel.replace('{search}', search)}</span>
                            </button>
                        )}

                        {allowCustom && search.trim() === '' && (
                            <button
                                type="button"
                                onClick={() => { inputRef.current?.focus(); }}
                                className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-blue-50 transition border-b border-gray-100 text-gray-500"
                            >
                                <Plus size={18} className="text-primary" />
                                <span className="text-sm">เพิ่มรุ่นเอง (พิมพ์ชื่อในช่องค้นหา)</span>
                            </button>
                        )}

                        {filteredOptions.length > 0 && (
                            sortedGroups.map(group => (
                                <div key={group}>
                                    {/* Group Header */}
                                    {group !== 'อื่นๆ' && (
                                        <div className="px-3 py-1.5 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wide sticky top-0">
                                            {group}
                                        </div>
                                    )}
                                    {/* Group Options */}
                                    {groupedOptions[group].map(option => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => handleSelect(option)}
                                            className={`w-full px-4 py-2.5 text-left flex items-center justify-between gap-2 hover:bg-blue-50 transition ${value === option.id ? 'bg-blue-50' : ''
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {option.color && (
                                                    <span
                                                        className={`w-6 h-6 rounded-full flex-shrink-0 ${option.colorBorder ? 'border border-gray-300' : ''}`}
                                                        style={{ background: option.color }}
                                                    />
                                                )}
                                                {option.image && (
                                                    <img
                                                        src={option.image}
                                                        alt={option.label}
                                                        className="w-8 h-8 p-0.5 object-contain bg-white rounded border border-gray-100"
                                                    />
                                                )}
                                                <div className="flex flex-col items-start">
                                                    <span className="text-gray-800">{option.label}</span>
                                                    {option.subLabel && (
                                                        <span className="text-xs text-gray-400">{option.subLabel}</span>
                                                    )}
                                                </div>
                                            </div>
                                            {value === option.id && (
                                                <Check size={18} className="text-primary flex-shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
