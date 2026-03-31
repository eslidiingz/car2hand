# Admin Project Patterns

## Project Structure

```
admin/src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # oklch theme tokens
│   ├── login/page.tsx      # Login page
│   └── dashboard/          # Protected admin pages
│       ├── layout.tsx      # Dashboard layout (Sidebar + Navbar)
│       ├── page.tsx        # Dashboard overview
│       ├── users/          # User management
│       ├── listings/       # Listing management
│       ├── articles/       # Article management
│       ├── community/      # Community management
│       └── settings/       # Admin settings
├── components/
│   ├── ui/                 # Radix UI wrapper components (shadcn pattern)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── textarea.tsx
│   ├── Sidebar.tsx         # Admin sidebar navigation
│   ├── Navbar.tsx          # Admin top bar
│   └── DashboardLayout.tsx # Layout wrapper
├── lib/
│   └── utils.ts            # cn() utility for class merging
└── components.json         # shadcn/ui configuration
```

## Component Library (shadcn/ui Pattern)

The admin project uses Radix UI primitives wrapped with Tailwind styling and CVA variants. Components live in `src/components/ui/`.

### Using the `cn()` Utility

Always use `cn()` when merging or conditionally applying classes:

```tsx
import { cn } from "@/lib/utils";

// cn() merges classes intelligently (handles conflicts)
<div className={cn(
  "rounded-3xl p-6 bg-card",
  isActive && "border-primary",
  className
)} />
```

### Button Variants

```tsx
import { Button } from "@/components/ui/button";

// Available variants: default, destructive, outline, secondary, ghost, link
// Available sizes: default, sm, lg, icon
<Button variant="default">Primary Action</Button>
<Button variant="outline" size="sm">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost" size="icon"><Icon /></Button>
```

### Card Component

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

### Dialog (Modal)

```tsx
import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Modal Title</DialogTitle>
      <DialogDescription>Description here</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Select

```tsx
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem
} from "@/components/ui/select";

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="เลือก..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Table

```tsx
import {
  Table, TableHeader, TableBody,
  TableHead, TableRow, TableCell
} from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

## Admin Page Pattern

A typical admin page with data table:

```tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ManagementPage() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหา..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Column 1</TableHead>
                <TableHead>Column 2</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.value}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Toast Notifications (Sonner)

```tsx
import { toast } from "sonner";

// Success
toast.success("บันทึกสำเร็จ");

// Error
toast.error("เกิดข้อผิดพลาด");

// With description
toast.success("บันทึกสำเร็จ", {
  description: "ข้อมูลถูกอัปเดตเรียบร้อย",
});
```

## Icons (Lucide)

```tsx
import { Search, Plus, Edit, Trash2, ChevronDown, MoreHorizontal } from "lucide-react";

// Standard size in admin: h-4 w-4
<Search className="h-4 w-4" />

// In buttons
<Button variant="ghost" size="icon">
  <MoreHorizontal className="h-4 w-4" />
</Button>
```

## Dark Mode

The admin supports dark mode via `next-themes`. CSS variables automatically switch. When writing custom styles, use semantic tokens:

- `bg-background` / `text-foreground` — page level
- `bg-card` / `text-card-foreground` — card level
- `bg-muted` / `text-muted-foreground` — secondary content
- `border` — border color
- `bg-primary` / `text-primary-foreground` — primary actions
- `bg-destructive` / `text-destructive-foreground` — danger actions
