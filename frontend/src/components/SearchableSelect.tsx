"use client";

import React, { useState, useRef, useEffect } from 'react';
import { CaretDown, MagnifyingGlass, Check, X } from '@phosphor-icons/react';

export interface SelectOption {
    id: string;
    label: string;
    subLabel?: string;
    image?: string;
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
    className = ''
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Find selected option
    const selectedOption = options.find(opt => opt.id === value);

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
                className={`w-full h-12 px-4 border rounded-xl bg-gray-50 outline-none transition text-base text-left flex items-center justify-between gap-2 ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'
                    } ${isOpen ? 'border-primary ring-1 ring-primary' : 'border-gray-200'}`}
            >
                <span className={selectedOption ? 'text-gray-800' : 'text-gray-400'}>
                    {loading ? 'กำลังโหลด...' : selectedOption ? (
                        <span className="flex items-center gap-2">
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
                    <CaretDown
                        size={16}
                        className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                            <MagnifyingGlass
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
                        {filteredOptions.length === 0 ? (
                            <div className="p-4 text-center text-gray-400 text-sm">
                                {emptyMessage}
                            </div>
                        ) : (
                            sortedGroups.map(group => (
                                <div key={group}>
                                    {/* Group Header */}
                                    <div className="px-3 py-1.5 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wide sticky top-0">
                                        {group}
                                    </div>
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
                                                <Check size={18} weight="bold" className="text-primary flex-shrink-0" />
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
