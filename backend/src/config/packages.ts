/**
 * Package Helpers
 * ฟังก์ชันช่วยตรวจสอบ limit ของ Package จาก Database
 */

import prisma from "../db";

export interface PackageData {
    id: string;
    name: string;
    nameTh: string;
    slug: string;
    price: number;
    maxListings: number;
    maxPhotosPerListing: number;
    listingDurationDays: number;
    autoBumpPerDay: number;
    badge: string | null;
    searchPriority: string;
    features: string[];
    sortOrder: number;
}

// Default limits สำหรับ user ที่ไม่มี package (= Basic free tier)
const DEFAULT_LIMITS = {
    maxListings: 3,
    maxPhotosPerListing: 16,
    listingDurationDays: 45,
    manualBumpPerDay: 1,
    autoBumpPerDay: 0,
    name: 'Basic (Free)',
    nameTh: 'แพ็กเกจพื้นฐาน',
};

/**
 * ดึง package ปัจจุบันของ user พร้อม limits (รวม bonus slots ที่ซื้อเพิ่ม)
 *
 * effective maxListings = packageMax + bonusListingSlots
 * (-1 = unlimited จะคงไว้ ไม่บวก bonus)
 */
export async function getUserPackage(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            currentPackageId: true,
            packageExpiresAt: true,
            currentPackage: true,
            bonusListingSlots: true,
        }
    });

    if (!user) {
        return { ...DEFAULT_LIMITS, id: null, packageExpiresAt: null, bonusListingSlots: 0, packageMaxListings: DEFAULT_LIMITS.maxListings };
    }

    const bonus = user.bonusListingSlots ?? 0;

    if (!user.currentPackageId || !user.currentPackage) {
        const baseMax = DEFAULT_LIMITS.maxListings;
        return {
            ...DEFAULT_LIMITS,
            id: null,
            packageExpiresAt: null,
            bonusListingSlots: bonus,
            packageMaxListings: baseMax,
            maxListings: baseMax + bonus,
        };
    }

    // เช็คว่า package หมดอายุหรือยัง — fallback กลับ Basic + bonus
    if (user.packageExpiresAt && new Date() > user.packageExpiresAt) {
        const baseMax = DEFAULT_LIMITS.maxListings;
        return {
            ...DEFAULT_LIMITS,
            id: null,
            packageExpiresAt: user.packageExpiresAt,
            bonusListingSlots: bonus,
            packageMaxListings: baseMax,
            maxListings: baseMax + bonus,
        };
    }

    const pkg = user.currentPackage;
    const baseMax = pkg.maxListings;
    // -1 = unlimited → ไม่บวก bonus
    const effectiveMax = baseMax === -1 ? -1 : baseMax + bonus;

    return {
        id: pkg.id,
        name: pkg.name,
        nameTh: pkg.nameTh,
        maxListings: effectiveMax,
        packageMaxListings: baseMax,
        bonusListingSlots: bonus,
        maxPhotosPerListing: pkg.maxPhotosPerListing,
        listingDurationDays: pkg.listingDurationDays,
        manualBumpPerDay: pkg.manualBumpPerDay,
        autoBumpPerDay: pkg.autoBumpPerDay,
        packageExpiresAt: user.packageExpiresAt,
    };
}

/**
 * ตรวจสอบว่า user เกิน limit จำนวนประกาศไหม
 */
export function canCreateListing(maxListings: number, currentActiveListings: number): boolean {
    if (maxListings === -1) return true;
    return currentActiveListings < maxListings;
}

/**
 * ตรวจสอบว่า user เกิน limit จำนวนรูปไหม
 */
export function canUploadPhotos(maxPhotos: number, currentPhotos: number, newPhotos: number): boolean {
    return (currentPhotos + newPhotos) <= maxPhotos;
}

/**
 * คำนวณวันหมดอายุของประกาศ
 */
export function getListingExpiryDate(listingDurationDays: number): Date | null {
    if (listingDurationDays === -1) return null; // ไม่มีหมดอายุ
    return new Date(Date.now() + listingDurationDays * 24 * 60 * 60 * 1000);
}
