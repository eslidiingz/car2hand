# Car2Hand Frontend Design System

Design system guide สำหรับ Car2Hand — Thai used-car marketplace platform

---

## Brand Colors

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| Primary | `#0F3460` | `bg-primary` `text-primary` | Buttons, links, headings, branding |
| Accent | `#FF6B35` | `bg-accent` `text-accent` | CTAs, prices, highlights, hover |
| Surface | `#F4F6F8` | `bg-surface` | Page backgrounds |
| Success | `#00C851` | `bg-green-500` | Success states, verified badges |
| Error | `#EF4444` | `bg-red-500` | Error states, delete actions |

**Grays:** ใช้ Tailwind defaults `gray-50` ถึง `gray-900`
- Body text: `text-gray-800`
- Secondary text: `text-gray-500`
- Muted/labels: `text-gray-400`
- Borders: `border-gray-100` หรือ `border-gray-200`

**Transparency:**
- Backdrop: `bg-black/60 backdrop-blur-sm`
- Button hover: `bg-white/80`
- Primary tint: `bg-primary/10`

---

## Typography

**Font:** IBM Plex Sans Thai (weights 300–700)

| Element | Classes | Example |
|---------|---------|---------|
| Page title | `text-2xl md:text-3xl font-bold text-gray-900` | ชื่อร้าน |
| Section heading | `text-xl font-bold text-gray-800` | เกี่ยวกับร้าน |
| Card title | `text-lg font-bold text-gray-800 leading-snug` | Toyota Hilux 2024 |
| Price | `text-2xl font-bold text-accent` | ฿890,000 |
| Body text | `text-sm text-gray-600` | คำอธิบาย |
| Label/caption | `text-xs text-gray-500` | รถที่ขายอยู่ |
| Tiny badge | `text-[10px] font-bold` | Premium Choice |

**Numbers/Prices:** ใช้ `toLocaleString('th-TH')` สำหรับ formatting

---

## Border Radius

| Element | Class | Size |
|---------|-------|------|
| Cards, modals, major containers | `rounded-3xl` | 24px |
| Feature cards, sections, dropdowns | `rounded-2xl` | 16px |
| Form inputs, standard buttons | `rounded-xl` | 12px |
| Small badges | `rounded-full` | circle |
| Logo containers | `rounded-2xl` | 16px |

**หลักการ:** ยิ่ง container ใหญ่ ยิ่ง radius มาก — สร้าง layered feel

---

## Shadows

| Level | Class | Usage |
|-------|-------|-------|
| Default | `shadow-sm` | Cards, containers |
| Hover | `shadow-xl` | Card hover state |
| Modal | `shadow-2xl` | Login/register modal |
| Button | `shadow-lg shadow-blue-900/10` | Primary CTA |

**Badge shadows:** `shadow-lg shadow-yellow-100` (Premium), `shadow-orange-100` (Hot Deal)

---

## Spacing

| Context | Pattern |
|---------|---------|
| Page container | `max-w-7xl mx-auto px-4` |
| Card padding | `p-4` (standard), `p-5` (medium), `p-6` (spacious) |
| Section gap | `mt-6`, `gap-6` |
| Component gap | `gap-3`, `gap-4` |
| Form input height | `h-12` (standard), `h-10` (compact/modal) |
| Button padding | `px-6 py-2.5` (standard), `px-8 py-3` (large) |

---

## Components

### Cards (ListingCard)

```
Container: bg-white rounded-3xl shadow-sm overflow-hidden 
           hover:shadow-xl hover:-translate-y-1 transition duration-300
           border border-gray-100
Image:     aspect-3/2 overflow-hidden object-cover
Specs:     grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-500
Price:     text-2xl font-bold text-accent
Seller:    w-6 h-6 rounded-full bg-primary/10 + text-xs font-medium text-gray-500
```

**Premium Choice:** `border-2 border-yellow-400 shadow-lg shadow-yellow-100`
**Hot Deal:** `border border-orange-300`
**Verified Seller:** `border border-blue-200`

### Specs Grid (2x2)

```html
<div class="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-500">
    <span class="flex items-center gap-1.5">
        <Icon size={14} class="text-gray-400" />
        <span class="font-medium">value</span>
    </span>
</div>
```

Items: ปี, กม., เชื้อเพลิง, ยอดวิว

### Profile Card (Seller)

```
Container: bg-white rounded-3xl shadow-sm p-5
Logo:      w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-gray-100
Stats:     grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100
```

### Buttons

**Primary:**
```
bg-primary text-white font-bold rounded-xl py-3 px-6
hover:bg-opacity-90 shadow-lg shadow-blue-900/10
disabled:opacity-50 disabled:cursor-not-allowed
```

**Secondary:**
```
border border-gray-200 text-gray-600 font-bold rounded-xl px-4 py-2
hover:bg-primary hover:text-white hover:border-primary transition
```

**Icon Button:**
```
w-8 h-8 rounded-full flex items-center justify-center
bg-white/80 text-gray-400 hover:text-primary hover:bg-white
```

**Accent CTA:**
```
bg-accent text-white rounded-2xl font-bold
shadow-lg shadow-orange-100
```

### Form Inputs

```
Standard: w-full h-12 rounded-xl border border-gray-200 px-4 text-sm
          focus:outline-none focus:ring-2 focus:ring-primary/30 
          focus:border-primary transition
Compact:  h-10 (สำหรับ modal)
Disabled: disabled:bg-gray-200/50 disabled:text-gray-400
```

**Globals.css classes:** `.form-input`, `.form-input-icon`, `.form-select`, `.form-textarea`, `.form-button`

### Modals

```
Backdrop:  fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm
Container: bg-white rounded-3xl shadow-2xl w-full max-w-md
Close:     w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full
```

### Toast Notifications

```
Container: fixed z-[9999] inset-x-0 bottom-24 lg:bottom-8 
           flex justify-center
Success:   bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg
Error:     bg-red-500 text-white px-5 py-3 rounded-xl shadow-lg
```

---

## Icons

**Library:** Lucide React (`lucide-react`)

| Size | Usage |
|------|-------|
| `size={10}` | Badge icons |
| `size={14}` | Specs grid, inline with text |
| `size={18}` | Card action buttons |
| `size={20}` | Form/section icons |
| `size={24}` | Navigation, prominent actions |
| `size={48}` | Empty state placeholders |

### Fill & Weight

| Style | Prop | Usage |
|-------|------|-------|
| Filled (solid) | `fill="currentColor"` | Active state (Heart, Star, badges) |
| Default (outline) | ไม่ต้องใส่ prop | ปกติ |
| Thin | `strokeWidth={1}` | Placeholder, decorative |

### Common Icons

| Icon | Component | Usage |
|------|-----------|-------|
| `Heart` | Wishlist | `fill="currentColor"` เมื่อ active |
| `Star` | Rating | `fill="currentColor"` เมื่อ active |
| `Search` | Search bar | |
| `ChevronDown` | Dropdown | |
| `ChevronRight` | Breadcrumb, links | |
| `Loader2` | Loading spinner | ใช้กับ `className="animate-spin"` |
| `X` | Close button | |
| `MapPin` | Location | |
| `Calendar` | Year/date | |
| `Gauge` | Mileage | |
| `Fuel` | Fuel type | |
| `Eye` | View count | |
| `Car` | Vehicle type | |
| `Bike` | Motorcycle type | |
| `BadgeCheck` | Verified | |
| `Store` | Seller profile | |
| `LogOut` | Sign out | |
| `Settings` | Settings/gear | |

---

## Badges

### Package Badges (Listing Cards)

| Badge | Style |
|-------|-------|
| Premium Choice | `bg-gradient-to-r from-yellow-500 to-amber-600 text-white` |
| Hot Deal | `bg-orange-500 text-white` |
| Verified Seller | `bg-blue-500 text-white` |

**Size:** `px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md`

### Showroom Type Badges

| Type | Style |
|------|-------|
| ส่วนตัว (INDIVIDUAL) | `bg-gray-100 text-gray-600` |
| เต๊นท์ (TENT) | `bg-blue-100 text-blue-700` |
| ตัวแทนจำหน่าย (DEALER) | `bg-orange-100 text-orange-700` |

---

## Images

| Context | Aspect Ratio | Style |
|---------|-------------|-------|
| Listing card | `aspect-3/2` | `overflow-hidden object-cover` |
| Upload preview | `aspect-[4/3]` | `rounded-xl border-2 border-dashed` |
| Cover image | Fixed height | `h-[200px] md:h-[300px]` |
| Logo (card) | `w-6 h-6` | `rounded-full bg-primary/10` |
| Logo (profile) | `w-16 h-16 md:w-20 md:h-20` | `rounded-2xl border-2 border-gray-100` |

**Placeholder:** `bg-gray-100` + `<ImageIcon size={48} weight="thin" className="text-gray-400" />`

---

## States

### Loading

```
Spinner: <CircleNotch weight="bold" className="animate-spin text-primary" />
Skeleton: bg-gray-200 animate-pulse rounded-xl
Button:   "กำลังโหลด..." + disabled:opacity-50
```

### Empty

```
Icon:   size={48-64} className="text-gray-300 mx-auto mb-3"
Title:  text-lg font-bold text-gray-700
Desc:   text-gray-500 text-sm
CTA:    Primary button
```

### Error

```
Container: flex items-center gap-2 p-3 bg-red-50 border border-red-200 
           rounded-xl text-red-600 text-sm
Icon:      <WarningCircle weight="bold" />
```

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Default (mobile) | 0–639px | 1 column, stacked |
| `sm:` | 640px+ | 2 columns for cards |
| `md:` | 768px+ | 2-3 columns, show sidebar |
| `lg:` | 1024px+ | Desktop nav, full layout |

**Listing grids:**
- Homepage: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- Seller page: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3`
- Profile listings: `grid-cols-1 sm:grid-cols-2`

---

## Animations

| Name | Effect | Duration |
|------|--------|----------|
| `animate-fade-in` | Fade + slide up | 0.3s ease-out |
| `animate-scale-in` | Scale 0.95→1 + fade | 0.3s cubic-bezier |
| `animate-image-change` | Image crossfade | 0.4s ease-out |
| Card hover | `hover:shadow-xl hover:-translate-y-1` | `transition duration-300` |
| Button hover | `hover:bg-opacity-90` | `transition` |

---

## Z-Index Ladder

| Level | z-index | Usage |
|-------|---------|-------|
| Cards | `z-10` | Floating buttons on cards |
| Navbar | `z-50` | Fixed navigation |
| Mobile menu | `z-[60]` | Mobile slide-out menu |
| Modals | `z-[100]` | Login/register modals |
| Toast | `z-[9999]` | Toast notifications (topmost) |

---

## Do's & Don'ts

### Do
- ใช้ `rounded-3xl` สำหรับ cards หลัก
- ใช้ `text-primary` + `text-accent` สำหรับ emphasis
- ใช้ Phosphor Icons เป็นหลัก
- ใช้ `transition` ทุก interactive element
- ใช้ `truncate` หรือ `line-clamp-2` กับ text ที่อาจยาว
- ใช้ `.form-input` classes จาก globals.css สำหรับ form

### Don't
- อย่าใช้ hardcoded color hex — ใช้ Tailwind token
- อย่าใช้ `rounded-lg` สำหรับ card containers (ใช้ `rounded-3xl`)
- อย่าลืม `overflow-hidden` กับ containers ที่มี rounded corners + images
- อย่าใช้ `shadow-md` สำหรับ default cards (ใช้ `shadow-sm`)
- อย่าลืม responsive — เริ่มจาก mobile-first เสมอ
- อย่าใช้ inline styles — ใช้ Tailwind utility classes
