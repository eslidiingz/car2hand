import SellerProfileClient from './SellerProfileClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const res = await fetch(`${API_URL}/sellers/${id}`, { cache: 'no-store' });
        if (!res.ok) return { title: 'ร้านค้า - Car2Hand' };
        const data = await res.json();
        return {
            title: `${data.profile.shopName} - Car2Hand`,
            description: data.profile.shopDescription || `ดูรถยนต์มือสองจาก ${data.profile.shopName}`,
        };
    } catch {
        return { title: 'ร้านค้า - Car2Hand' };
    }
}

export default async function SellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <SellerProfileClient sellerId={id} />;
}
