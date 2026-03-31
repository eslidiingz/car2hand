# Frontend Project Patterns

## Project Structure

```
frontend/src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (Navbar, font, metadata)
│   ├── globals.css         # Design tokens + utility classes
│   ├── page.tsx            # Homepage
│   ├── sell/               # Seller flow (create, edit, estimate)
│   ├── buy/                # Buyer/search pages
│   ├── profile/            # Protected user area
│   │   ├── layout.tsx      # Auth-guarded layout with sidebar
│   │   ├── dashboard/
│   │   ├── listings/
│   │   ├── garage/
│   │   ├── wishlist/
│   │   ├── messages/
│   │   ├── packages/
│   │   └── settings/
│   ├── articles/           # Content pages
│   ├── community/          # Community features
│   ├── contact/
│   ├── privacy/
│   ├── terms/
│   └── about/
├── components/             # Shared UI components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx            # Search hero section
│   ├── ListingCard.tsx     # Vehicle listing card
│   ├── LoginModal.tsx
│   ├── RegisterModal.tsx
│   ├── SearchableSelect.tsx
│   ├── BrandSelectionModal.tsx
│   ├── CommunityHighlight.tsx
│   ├── Features.tsx
│   ├── CarList.tsx
│   ├── PreviewCard.tsx
│   ├── ProfileSidebar.tsx
│   ├── QuickCategories.tsx
│   ├── ServiceShortcuts.tsx
│   ├── StatusCheck.tsx
│   ├── Toast.tsx
│   └── profile/
│       └── ProfileListingCard.tsx
├── contexts/
│   ├── WishlistContext.tsx  # Wishlist + compare (up to 4 cars)
│   └── ListingContext.tsx
└── public/
    ├── logo.svg
    ├── logo-text.svg
    ├── watermark.svg
    └── brands/             # Brand logo images
```

## CSS Classes (globals.css)

The frontend defines reusable form classes. Always use these instead of writing custom input styles:

### Standard Size (h-12 / 48px)
- `.form-input` — text input
- `.form-input-icon` — input with left icon (padding-left: 2.75rem)
- `.form-textarea` — textarea
- `.form-select` — select with custom dropdown arrow
- `.form-select-icon` — select with left icon
- `.form-button` — button container with active/inactive states
- `.form-checkbox-label` — checkbox label container

### Compact Size (h-10 / 40px) — for modals
- `.form-input-sm`
- `.form-input-icon-sm`
- `.form-select-sm`
- `.form-button-sm`

### Animation Classes
- `.animate-fade-in` — fade in effect
- `.animate-scale-in` — scale up effect
- `.animate-image-change` — image transition

### Utility Classes
- `.tooltip` — hover tooltip using ::after pseudo-element
- `.custom-scrollbar` — styled scrollbar
- `.no-scrollbar` — hidden scrollbar

## Component Pattern Example

A typical component in frontend follows this pattern:

```tsx
"use client";

import { useState, useEffect } from "react";
import { Heart, Share, MapPin } from "@phosphor-icons/react";

interface ListingCardProps {
  listing: {
    id: number;
    title: string;
    price: number;
    province: string;
    images: string[];
  };
  onFavorite?: (id: number) => void;
}

export default function ListingCard({ listing, onFavorite }: ListingCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    onFavorite?.(listing.id);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative aspect-[4/3]">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center"
        >
          <Heart size={20} weight={isFavorite ? "fill" : "regular"} className={isFavorite ? "text-red-500" : "text-gray-600"} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate">{listing.title}</h3>
        <p className="text-accent font-bold text-lg mt-1">
          {listing.price.toLocaleString("th-TH")} บาท
        </p>
        <div className="flex items-center gap-1 mt-2 text-gray-500 text-sm">
          <MapPin size={14} />
          <span>{listing.province}</span>
        </div>
      </div>
    </div>
  );
}
```

## Page Pattern Example

```tsx
// src/app/some-page/page.tsx
import SomeClientComponent from "@/components/SomeClientComponent";

// Server Component by default — good for SEO and data fetching
export default async function SomePage() {
  // Can do server-side data fetching here
  const data = await fetch(`${process.env.API_URL}/endpoint`);

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800">Page Title</h1>
        <SomeClientComponent data={data} />
      </div>
    </main>
  );
}
```

## API Integration Pattern

```tsx
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Get auth token
const getUserToken = (): string | null => {
  const userData = localStorage.getItem("user");
  if (!userData) return null;
  return JSON.parse(userData).token;
};

// Fetch with auth
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = getUserToken();
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
};
```

## Responsive Breakpoints

- Mobile: default (< 640px)
- sm: 640px+
- md: 768px+
- lg: 1024px+
- xl: 1280px+

Grid pattern for listing cards:
```html
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
```
