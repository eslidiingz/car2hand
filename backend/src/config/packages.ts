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
    maxListings: 1,
    maxPhotosPerListing: 10,
    listingDurationDays: 30,
    name: 'Basic (Free)',
    nameTh: 'แพ็กเกจพื้นฐาน',
};

/**
 * ดึง package ปัจจุบันของ user พร้อม limits
 */
export async function getUserPackage(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            currentPackageId: true,
            packageExpiresAt: true,
            currentPackage: true,
        }
    });

    if (!user || !user.currentPackageId || !user.currentPackage) {
        return { ...DEFAULT_LIMITS, id: null, packageExpiresAt: null };
    }

    // เช็คว่า package หมดอายุหรือยัง
    if (user.packageExpiresAt && new Date() > user.packageExpiresAt) {
        return { ...DEFAULT_LIMITS, id: null, packageExpiresAt: user.packageExpiresAt };
    }

    const pkg = user.currentPackage;
    return {
        id: pkg.id,
        name: pkg.name,
        nameTh: pkg.nameTh,
        maxListings: pkg.maxListings,
        maxPhotosPerListing: pkg.maxPhotosPerListing,
        listingDurationDays: pkg.listingDurationDays,
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
