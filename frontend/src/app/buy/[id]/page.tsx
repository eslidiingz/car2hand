import React from 'react';
import type { Metadata } from 'next';
import ListingDetailClient, { VehicleListing } from './ListingDetailClient';
import { ArrowLeft, AlertCircle, Timer } from 'lucide-react';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import {
    absoluteUrl,
    breadcrumbSchema,
    DEFAULT_OG_IMAGE,
    SITE_NAME,
    truncateDescription,
    vehicleListingSchema,
} from '@/lib/seo';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ListingResponse {
    listing: VehicleListing | null;
    expired?: boolean;
    message?: string;
}

async function getListing(id: string): Promise<ListingResponse> {
    try {
        const response = await fetch(`${API_BASE}/listings/${id}`, {
            next: { revalidate: 60 }
        });

        if (!response.ok) return { listing: null };

        const data = await response.json();
        return { listing: data.listing, expired: data.expired };
    } catch (error) {
        console.error('Error fetching listing:', error);
        return { listing: null };
    }
}

/** Human-readable title used across meta tags and headings. */
function buildListingTitle(listing: VehicleListing): string {
    const subModel = listing.subModel ? ` ${listing.subModel}` : '';
    const mileageText = listing.mileage ? ` ${listing.mileage.toLocaleString('th-TH')} กม.` : '';
    return `${listing.year} ${listing.brand} ${listing.model}${subModel}${mileageText} ราคา ฿${listing.price.toLocaleString('th-TH')}`;
}

/** Concise description front-loaded with facts — better for AI Overviews / Gemini. */
function buildListingDescription(listing: VehicleListing): string {
    const parts: string[] = [];
    parts.push(`${listing.year} ${listing.brand} ${listing.model}${listing.subModel ? ` ${listing.subModel}` : ''}`);
    parts.push(`ราคา ฿${listing.price.toLocaleString('th-TH')}`);
    if (listing.mileage) parts.push(`วิ่ง ${listing.mileage.toLocaleString('th-TH')} กม.`);
    if (listing.transmission) parts.push(listing.transmission === 'AUTOMATIC' ? 'เกียร์ออโต้' : listing.transmission === 'MANUAL' ? 'เกียร์ธรรมดา' : listing.transmission);
    if (listing.fuelType) parts.push(listing.fuelType === 'EV' ? 'รถไฟฟ้า' : listing.fuelType === 'HYBRID' ? 'ไฮบริด' : '');
    if (listing.province) parts.push(`${listing.province}`);
    const summary = parts.filter(Boolean).join(' · ');
    const desc = listing.description ? ` ${listing.description}` : '';
    return truncateDescription(`${summary}${desc}`, 200);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const { listing, expired } = await getListing(id);
    const canonicalPath = `/buy/${id}`;

    if (expired) {
        return {
            title: 'ประกาศหมดอายุ',
            robots: { index: false, follow: true },
            alternates: { canonical: canonicalPath },
        };
    }
    if (!listing) {
        return {
            title: 'ไม่พบประกาศ',
            robots: { index: false, follow: true },
            alternates: { canonical: canonicalPath },
        };
    }

    const title = `${listing.year} ${listing.brand} ${listing.model}${listing.subModel ? ` ${listing.subModel}` : ''}`;
    const description = buildListingDescription(listing);
    const images = listing.images.length > 0
        ? listing.images.slice(0, 4).map((img) => ({ url: img.url, alt: buildListingTitle(listing) }))
        : [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }];
    const keywords = [
        listing.brand,
        listing.model,
        listing.subModel,
        `${listing.brand} ${listing.model} มือสอง`,
        `${listing.year} ${listing.brand} ${listing.model}`,
        listing.province ? `รถมือสอง ${listing.province}` : null,
        'รถมือสอง',
    ].filter(Boolean) as string[];

    return {
        title,
        description,
        keywords,
        alternates: { canonical: canonicalPath },
        openGraph: {
            type: 'website',
            locale: 'th_TH',
            url: absoluteUrl(canonicalPath),
            title,
            description,
            images,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: images.map((i) => i.url),
        },
    };
}

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { listing, expired } = await getListing(id);

    // ประกาศหมดอายุ — ไม่แสดงข้อมูลรถ
    if (expired) {
        return (
            <div className="bg-surface min-h-screen pt-8 pb-12">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <Timer size={64} className="text-orange-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">ประกาศนี้หมดอายุแล้ว</h2>
                        <p className="text-gray-500 mb-6">ประกาศนี้ไม่สามารถแสดงผลได้ในขณะนี้ เนื่องจากหมดอายุแล้ว</p>
                        <Link href="/buy" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition inline-flex items-center gap-2">
                            <ArrowLeft /> กลับไปหน้ารายการ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ไม่พบประกาศ
    if (!listing) {
        return (
            <div className="bg-surface min-h-screen pt-8 pb-12">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <AlertCircle size={64} className="text-red-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">ไม่พบประกาศ</h2>
                        <p className="text-gray-500 mb-6">ประกาศนี้อาจถูกลบหรือไม่มีอยู่</p>
                        <Link href="/buy" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition inline-flex items-center gap-2">
                            <ArrowLeft /> กลับไปหน้ารายการ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // SEO / GEO — Vehicle + Product + Offer + Breadcrumb structured data
    const vehicleJsonLd = vehicleListingSchema(
        {
            id: listing.id,
            title: buildListingTitle(listing),
            description: listing.description,
            brand: listing.brand,
            model: listing.model,
            year: listing.year,
            price: listing.price,
            mileage: listing.mileage,
            color: listing.color,
            fuelType: listing.fuelType,
            transmission: listing.transmission,
            bodyType: listing.bodyType,
            vehicleType: listing.vehicleType,
            condition: listing.condition,
            engineSize: listing.engineSize,
            seats: listing.seats,
            province: listing.province,
            district: listing.district,
            images: listing.images.map((img) => img.url),
            seller: listing.user ? { fullName: listing.user.fullName } : null,
            createdAt: listing.createdAt,
        },
        `/buy/${id}`,
    );

    const breadcrumb = breadcrumbSchema([
        { name: 'หน้าแรก', url: '/' },
        { name: 'ซื้อรถ', url: '/buy' },
        { name: `${listing.brand} ${listing.model}`, url: `/buy?brand=${encodeURIComponent(listing.brand)}` },
        { name: buildListingTitle(listing), url: `/buy/${id}` },
    ]);

    return (
        <>
            <JsonLd data={[vehicleJsonLd, breadcrumb]} />
            <ListingDetailClient listing={listing} />
        </>
    );
}
