# Car2Hand Articles System Improvement Plan

## Overview

This plan transforms the articles system from a mostly-hardcoded prototype into a fully functional content hub. It is organized into 3 sprints, ordered by dependency: schema and backend first, then frontend rewrites.

---

## Sprint 1: Schema Changes, Seed Data, and Backend API Enhancements

### 1.1 Prisma Schema Changes

**File: `backend/prisma/schema.prisma`**

Add the following to the `Article` model:
- `isFeatured Boolean @default(false)` field
- `tags String[] @default([])` field (PostgreSQL native string array -- avoids a separate join table for a simple tagging system)
- Add index: `@@index([isFeatured])` for featured article queries

Exact additions inside the Article model block (after `viewCount`):

```
isFeatured  Boolean    @default(false)
tags        String[]   @default([])
```

And add to the indexes section:

```
@@index([isFeatured])
```

**Run:** `bunx prisma migrate dev --name add-article-tags-featured`

### 1.2 Raw SQL Migration for Full-Text Search

After the Prisma migration runs, add a custom SQL statement to create a PostgreSQL GIN index for full-text search. This can be appended to the generated migration SQL file before it is applied, or applied as a separate raw migration:

```sql
CREATE INDEX IF NOT EXISTS articles_search_idx 
ON articles 
USING GIN (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(content, '')));
```

Use the `simple` text search config rather than `thai` since PostgreSQL does not ship with a Thai dictionary. The `simple` config tokenizes on whitespace, which works acceptably for Thai text where spaces separate phrases.

### 1.3 Seed Data Update -- New Categories

**File: `backend/prisma/seed-categories.ts`**

Replace the 5 old categories with the 10 target categories. Use `upsert` by slug instead of `deleteMany` to avoid orphaning existing articles. The approach:

1. Upsert the 10 new categories (create if slug does not exist, update name if slug exists).
2. For old slugs being removed (`general`, `law-and-insurance`, `driving-techniques`), migrate any linked articles to appropriate new categories before deleting the old category rows.

New categories array:

```typescript
const categories = [
  { name: 'คู่มือซื้อรถมือสอง', slug: 'buying-guide' },
  { name: 'ดูแลรักษา & ซ่อมบำรุง', slug: 'maintenance' },
  { name: 'ไฟแนนซ์ & สินเชื่อ', slug: 'finance' },
  { name: 'ประกันภัย', slug: 'insurance' },
  { name: 'กฎหมาย & เอกสาร', slug: 'legal' },
  { name: 'เทคนิคขับขี่', slug: 'driving-tips' },
  { name: 'รีวิว & เปรียบเทียบรถ', slug: 'reviews' },
  { name: 'รถ EV & ไฮบริด', slug: 'ev-hybrid' },
  { name: 'ข่าวยานยนต์', slug: 'automotive-news' },
  { name: 'เคล็ดลับขายรถ', slug: 'selling-tips' },
];
```

Migration mapping for removed categories:
- `general` articles -> `buying-guide`
- `law-and-insurance` articles -> `legal`
- `driving-techniques` articles -> `driving-tips`
- `maintenance` stays (slug unchanged, name updated)
- `finance` stays (slug unchanged, name updated)

### 1.4 Backend API Enhancements

**File: `backend/src/articles.ts`**

This file currently has only 2 endpoints (list and single article). Expand to 6 endpoints total. IMPORTANT: static routes must be registered before the `/:slug` parameterized route to avoid Elysia matching them as slug values.

#### Enhanced: `GET /articles` (existing -- add params)
Add query parameters:
- `search` (string) -- full-text search using `prisma.$queryRaw` with PostgreSQL `to_tsvector`/`plainto_tsquery`
- `tags` (string, comma-separated) -- filter by tags using Prisma `hasSome` on the string array field
- `featured` (string "true"/"false") -- filter by `isFeatured`
- `sort` (string: "latest" | "popular") -- `latest` = createdAt desc (default), `popular` = viewCount desc

Keep existing `page`, `limit`, `category` params.

When `search` is provided, use raw SQL query for ranking:
```typescript
if (search) {
  const articles = await prisma.$queryRaw`
    SELECT a.*, ac.name as "categoryName", ac.slug as "categorySlug"
    FROM articles a
    LEFT JOIN article_categories ac ON a."categoryId" = ac.id
    WHERE a.status = 'PUBLISHED'
    AND to_tsvector('simple', coalesce(a.title, '') || ' ' || coalesce(a.content, ''))
        @@ plainto_tsquery('simple', ${search})
    ORDER BY ts_rank(...) DESC
    LIMIT ${take} OFFSET ${skip}
  `;
}
```

#### New: `GET /articles/categories`
Return all categories with published article counts:
```typescript
const categories = await prisma.articleCategory.findMany({
  orderBy: { name: 'asc' },
  include: { _count: { select: { articles: { where: { status: 'PUBLISHED' } } } } }
});
```

#### New: `GET /articles/popular`
Return top N articles by viewCount (published only). Query param: `limit` (default 5).

#### New: `GET /articles/featured`
Return published featured articles. Query param: `limit` (default 3).

#### Existing: `GET /articles/:slug` (no changes needed, tags/isFeatured auto-included)

#### New: `GET /articles/:slug/related`
Find related articles based on same category and overlapping tags. Exclude the current article. Limit 5 results. Logic:
1. Find article by slug to get categoryId and tags
2. Query published articles in same category OR with overlapping tags, exclude self
3. Order by viewCount desc, limit 5

### 1.5 Validation Schema Update

**File: `backend/src/validation.ts`**

Add to `articleSchema`:
```typescript
tags: z.array(z.string().max(50)).max(10).optional().default([]),
isFeatured: z.boolean().optional().default(false),
```

### 1.6 Admin Route Updates

**File: `backend/src/admin.ts`**

In the `.group("/posts", ...)` section, update the create and update handlers:

- **Create handler** (~line 256): Parse `tags` from FormData body (JSON string -> array), accept `isFeatured` boolean. Add both to the `postData` object passed to `prisma.article.create`.
- **Update handler** (~line 399): Same -- parse `tags` and `isFeatured` from request body and add to update data.
- **Body type definitions**: Add `tags: t.Optional(t.String())` and `isFeatured: t.Optional(t.String())` to the Elysia body type objects (FormData sends everything as strings).

---

## Sprint 2: Frontend Articles Landing Page Rewrite

### 2.1 Create Article API Helper

**File: `frontend/src/lib/articles-api.ts`** (NEW)

Centralized fetch functions with TypeScript interfaces:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  status: string;
  viewCount: number;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  category: { name: string; slug: string } | null;
  author: { fullName: string } | null;
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  _count: { articles: number };
}

export async function fetchArticles(params): Promise<{ articles: Article[]; pagination }>
export async function fetchArticle(slug: string): Promise<Article>
export async function fetchCategories(): Promise<ArticleCategory[]>
export async function fetchFeaturedArticles(limit?: number): Promise<Article[]>
export async function fetchPopularArticles(limit?: number): Promise<Article[]>
export async function fetchRelatedArticles(slug: string): Promise<Article[]>
```

### 2.2 Rewrite Articles Landing Page

**File: `frontend/src/app/articles/page.tsx`** (FULL REWRITE)

Replace all hardcoded content. The visual design/layout stays similar, but everything becomes data-driven.

**State:**
```typescript
const [articles, setArticles] = useState<Article[]>([]);
const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
const [popularArticles, setPopularArticles] = useState<Article[]>([]);
const [categories, setCategories] = useState<ArticleCategory[]>([]);
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
const [searchQuery, setSearchQuery] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [isLoading, setIsLoading] = useState(true);
// Keep existing brands state
```

**Data fetching:**
1. On mount: parallel fetch of categories, featured (limit=1), popular (limit=5), articles (page 1), and brands
2. On category/search/page change: re-fetch articles with new params

**Section changes:**

1. **Hero search bar** -- Wire up: on form submit, call `setSearchQuery(inputValue)` which triggers article re-fetch via useEffect dependency
2. **Quick filter buttons** -- Map to category slugs: "มือใหม่หัดซื้อ" -> `buying-guide`, "การซ่อมบำรุง" -> `maintenance`, etc. On click, set `selectedCategory`.
3. **Featured Article** -- Render from `featuredArticle` state (image, title, excerpt, category, read time). Link to `/articles/${slug}`.
4. **Brand Encyclopedia** -- Keep as-is (already real data). Defer encyclopedia pages.
5. **Category filter bar** -- NEW: horizontal scrollable pills above latest articles. "ทั้งหมด" pill + one per category. Active state styling. On click, filters articles.
6. **Latest Articles list** -- Map `articles` array to `ArticleCard` components. Each links to `/articles/${slug}`.
7. **Pagination** -- Add prev/next + page number buttons below article list.
8. **Sidebar Calculator** -- Make functional with state: `carPrice`, `downPayment`, `termMonths`. Calculate: `monthlyPayment = (carPrice - downPayment) * (1 + rate * termMonths/12) / termMonths` with rate ~3.5%. Display formatted number.
9. **Sidebar Popular Tags** -- Keep hardcoded tags but make clickable (set search query).
10. **Sidebar Popular Articles** -- NEW section: render `popularArticles` as compact list items.

### 2.3 Extract Reusable Components

**File: `frontend/src/components/ArticleCard.tsx`** (NEW)
Horizontal card for article lists. Props: `article: Article`.

**File: `frontend/src/components/ArticleFeaturedCard.tsx`** (NEW)
Large featured article card. Props: `article: Article`.

**File: `frontend/src/components/LoanCalculator.tsx`** (NEW)
Self-contained calculator widget with working math. Extracted from page for reusability.

---

## Sprint 3: Article Detail Page + Admin Tags/Featured

### 3.1 Markdown Rendering

**Install in frontend:** `bun add react-markdown remark-gfm`

### 3.2 Article Detail Page Improvements

**File: `frontend/src/app/articles/[articleId]/page.tsx`** (SIGNIFICANT EDITS)

1. **Markdown rendering** -- Replace `{article.content}` with:
   ```tsx
   import ReactMarkdown from 'react-markdown';
   import remarkGfm from 'remark-gfm';
   
   <article className="prose prose-lg max-w-none">
     <ReactMarkdown remarkPlugins={[remarkGfm]}>
       {article.content}
     </ReactMarkdown>
   </article>
   ```

2. **Category badge fix** -- Currently renders `{article.category}` as an object. Fix to `{article.category?.name}` and wrap in a Link to `/articles?category=${article.category?.slug}`.

3. **Tags** -- Replace hardcoded tags with real `article.tags` array:
   ```tsx
   {article.tags?.map((tag: string) => (
     <Link key={tag} href={`/articles?search=${tag}`}>#{tag}</Link>
   ))}
   ```
   Keep the category tag as well as a fallback.

4. **Related articles sidebar** -- Fetch from API and render:
   ```tsx
   const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
   useEffect(() => {
     fetchRelatedArticles(slug).then(setRelatedArticles);
   }, [slug]);
   ```
   Replace the placeholder "บทความที่เกี่ยวข้องจะปรากฏที่นี่" with actual compact article cards.

5. **Read time** -- Adjust for Thai text density: use ~300 chars/minute instead of 500.

### 3.3 Admin: Tags and Featured Toggle

**File: `admin/src/app/articles/new/page.tsx`**

Add to `formData` initial state:
```typescript
isFeatured: false,
tags: "",  // comma-separated string, parsed to array on submit
```

Add to sidebar Card (between category select and save buttons):

1. **Featured toggle:**
   ```tsx
   <div className="flex items-center justify-between">
     <Label className="text-sm">บทความแนะนำ</Label>
     <Switch checked={formData.isFeatured} onCheckedChange={(v) => setFormData({...formData, isFeatured: v})} />
   </div>
   ```
   (Import Switch from shadcn/ui)

2. **Tags input:**
   ```tsx
   <div>
     <Label className="text-sm">แท็ก (คั่นด้วย ,)</Label>
     <Input placeholder="รถมือสอง, ดูรถ, เช็ครถ" value={formData.tags} onChange={...} />
   </div>
   ```

Update `handleSubmit` to append:
```typescript
payload.append('isFeatured', String(formData.isFeatured));
payload.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim()).filter(Boolean)));
```

**File: `admin/src/app/articles/[id]/page.tsx`**

Same additions. Also populate from fetched data:
```typescript
isFeatured: post.isFeatured || false,
tags: (post.tags || []).join(', '),
```

---

## Risks and Mitigations

1. **Thai full-text search quality** -- `simple` config only tokenizes on whitespace. Thai text sometimes lacks spaces between words. Mitigation: This approach works for phrase-level search. A future enhancement could use `pg_bigm` or `LIKE` fallback.

2. **Elysia route conflicts** -- `GET /articles/categories` matched by `GET /articles/:slug`. Mitigation: register all static sub-routes (`/categories`, `/popular`, `/featured`) BEFORE the `/:slug` route.

3. **Category migration data integrity** -- Deleting old categories with linked articles causes FK errors. Mitigation: seed script reassigns articles before deleting old categories.

4. **Markdown backward compatibility** -- Existing articles were written as plain text. ReactMarkdown renders plain text correctly (no transformation occurs unless markdown syntax is present), so this is safe.

---

## Out of Scope (Deferred)
- Encyclopedia pages (`/articles/encyclopedia/*`)
- Maintenance guide page (`/articles/maintenance`)
- AI-powered features
- Rich text / WYSIWYG editor in admin
- Article comments or reactions
- Dedicated tag management admin UI
