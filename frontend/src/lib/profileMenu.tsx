import {
    LayoutGrid,
    Warehouse,
    Car,
    Heart,
    Package,
    Bell,
    Settings,
} from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * ⚠️  SINGLE SOURCE OF TRUTH for the authenticated profile menu
 * ─────────────────────────────────────────────────────────────
 * Used by:
 *   1. `src/app/profile/layout.tsx`   (desktop sidebar via <ProfileSidebar />)
 *   2. `src/components/Navbar.tsx`    (desktop account dropdown, mobile drawer)
 *
 * 🚨 When adding a new page under /profile/*, add it HERE first.
 *    Do not hardcode links in Navbar.tsx or layout.tsx — the mobile and
 *    desktop menus MUST stay in sync automatically.
 */

export interface ProfileMenuItem {
    name: string;
    href: string;
    icon: ReactNode;
    /** Optional unread/count badge (e.g. notifications) */
    badge?: number;
}

export const profileMenuItems: ProfileMenuItem[] = [
    { name: 'ภาพรวมบัญชี', href: '/profile/dashboard', icon: <LayoutGrid size={20} /> },
    { name: 'จัดการรถที่ลงขาย', href: '/profile/listings', icon: <Car size={20} /> },
    { name: 'โรงรถของฉัน', href: '/profile/garage', icon: <Warehouse size={20} /> },
    { name: 'รายการที่บันทึกไว้', href: '/profile/wishlist', icon: <Heart size={20} /> },
    { name: 'แพ็กเกจของฉัน', href: '/profile/packages', icon: <Package size={20} /> },
    { name: 'การแจ้งเตือน', href: '/profile/notifications', icon: <Bell size={20} /> },
    { name: 'ตั้งค่าบัญชี', href: '/profile/settings', icon: <Settings size={20} /> },
];
