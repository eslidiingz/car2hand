"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Star,
  ArrowRight,
  ArrowLeft,
  Calculator,
  Eye,
  Newspaper,
  ArrowUpNarrowWide,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
// --- Types ---

interface Article {
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
  category: { name: string; slug: string } | null;
  author: { fullName: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { articles: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// --- Helpers ---

function readTime(content: string): number {
  return Math.max(1, Math.ceil(content.length / 500));
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatNumber(n: number): string {
  return n.toLocaleString('th-TH');
}

// --- Sub-components ---

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col sm:flex-row gap-0 sm:gap-4 hover:shadow-md hover:border-primary/20 transition cursor-pointer group"
    >
      <div className="w-full sm:w-40 h-48 sm:h-28 flex-shrink-0 overflow-hidden bg-gray-100">
        {article.featuredImage ? (
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Newspaper size={48} />
          </div>
        )}
      </div>
      <div className="flex-1 p-4 sm:py-3 sm:pr-4 sm:pl-0 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          {article.category && (
            <span className="text-[10px] font-bold text-accent uppercase tracking-wide bg-orange-50 px-2 py-0.5 rounded">
              {article.category.name}
            </span>
          )}
          <span className="text-[10px] text-gray-400">{readTime(article.content)} นาทีอ่าน</span>
        </div>
        <h4 className="font-bold text-gray-800 mb-1 leading-snug group-hover:text-primary line-clamp-1">
          {article.title}
        </h4>
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
          {article.excerpt || article.content.substring(0, 120)}
        </p>
        <div className="flex items-center gap-3 text-[11px] text-gray-400">
          {article.author && <span>{article.author.fullName}</span>}
          <span>{formatDate(article.createdAt)}</span>
          <span className="flex items-center gap-0.5">
            <Eye size={12} /> {formatNumber(article.viewCount)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function PopularArticleItem({ article, index }: { article: Article; index: number }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="flex gap-3 group cursor-pointer"
    >
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
        {article.featuredImage ? (
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg font-bold">
            {index + 1}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-700 group-hover:text-primary line-clamp-2 leading-snug">
          {article.title}
        </h4>
        <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
          <Eye size={12} /> {formatNumber(article.viewCount)}
        </span>
      </div>
    </Link>
  );
}

function LoanCalculator() {
  const [carPrice, setCarPrice] = useState<number | ''>('');
  const [downPayment, setDownPayment] = useState<number | ''>('');
  const [months, setMonths] = useState(60);
  const [interestRate, setInterestRate] = useState<number | ''>(3);

  const carPriceNum = carPrice === '' ? 0 : carPrice;
  const downPaymentNum = downPayment === '' ? 0 : downPayment;
  const principal = Math.max(0, carPriceNum - downPaymentNum);
  const interestRateNum = interestRate === '' ? 0 : interestRate;
  const rate = Math.max(0, interestRateNum) / 100;
  const interest = principal * rate * (months / 12);
  const totalAmount = principal + interest;
  const monthly = months > 0 ? totalAmount / months : 0;
  const hasInput = carPrice !== '' && carPriceNum > 0;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
        <Calculator className="text-accent" size={24} /> คำนวณค่างวด
      </h3>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 font-bold block mb-1.5">ราคารถ (บาท)</label>
          <input
            type="number"
            placeholder="กรอกราคารถ"
            value={carPrice}
            onChange={(e) => setCarPrice(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-bold block mb-1.5">เงินดาวน์ (บาท)</label>
          <input
            type="number"
            placeholder="กรอกเงินดาวน์"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-bold block mb-1.5">อัตราดอกเบี้ย (% ต่อปี)</label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0"
              max="20"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full p-2.5 pr-10 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">%</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 font-bold block mb-1.5">ระยะเวลาผ่อน (งวด)</label>
          <div className="flex gap-2">
            {[48, 60, 72, 84].map((m) => (
              <button
                key={m}
                onClick={() => setMonths(m)}
                className={`flex-1 py-2 border rounded-lg text-xs font-medium transition ${
                  months === m
                    ? 'border-primary bg-primary text-white font-bold shadow-md'
                    : 'border-gray-200 hover:bg-primary hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        {hasInput ? (
          <div className="bg-blue-50 p-4 rounded-xl mt-2 border border-blue-100">
            <div className="text-center">
              <span className="text-xs text-gray-500 block mb-1">ค่างวดต่อเดือน (โดยประมาณ)</span>
              <span className="text-2xl font-bold text-primary">
                {formatNumber(Math.round(monthly))}{' '}
                <span className="text-sm font-normal text-gray-500">บาท</span>
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200 flex justify-between text-xs text-gray-500">
              <span>ยอดจัด: {formatNumber(principal)} บาท</span>
              <span>ดอกเบี้ยรวม: {formatNumber(Math.round(interest))} บาท</span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-xl mt-2 border border-gray-200 text-center">
            <span className="text-sm text-gray-400">กรอกราคารถเพื่อคำนวณค่างวด</span>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main content component (uses useSearchParams) ---

function ArticlesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL state
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSort = searchParams.get('sort') || 'latest';

  // Local search input state
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);

  // Update URL params helper
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      // Reset page when filters change (unless page itself is being set)
      if (!('page' in updates)) {
        params.delete('page');
      }
      router.push(`/articles?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  // Fetch categories + popular (one-time)
  useEffect(() => {
    async function fetchStatic() {
      try {
        const [catRes, popRes] = await Promise.all([
          fetch(`${API_URL}/articles/categories`),
          fetch(`${API_URL}/articles/popular?limit=5`),
        ]);
        const catData = await catRes.json();
        const popData = await popRes.json();
        if (catData.success) setCategories(catData.categories);
        if (popData.success) setPopularArticles(popData.articles);
      } catch (err) {
        console.error('Failed to fetch categories/popular:', err);
      }
    }
    fetchStatic();
  }, []);

  // Fetch featured article (one-time)
  useEffect(() => {
    async function fetchFeatured() {
      setIsFeaturedLoading(true);
      try {
        const res = await fetch(`${API_URL}/articles/featured?limit=3`);
        const data = await res.json();
        if (data.success && data.articles?.length > 0) {
          setFeaturedArticles(data.articles.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch featured:', err);
      } finally {
        setIsFeaturedLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  // Fetch articles (reactive to URL params)
  useEffect(() => {
    async function fetchArticles() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(currentPage));
        params.set('limit', '9');
        if (currentCategory) params.set('category', currentCategory);
        if (currentSearch) params.set('search', currentSearch);
        if (currentSort) params.set('sort', currentSort);

        const res = await fetch(`${API_URL}/articles?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setArticles(data.articles);
          setPagination(data.pagination);
        }
      } catch (err) {
        console.error('Failed to fetch articles:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchArticles();
  }, [currentCategory, currentSearch, currentPage, currentSort]);

  // Scroll to articles heading when page changes (skip initial load)
  const isFirstPageLoad = useRef(true);
  useEffect(() => {
    if (isFirstPageLoad.current) {
      isFirstPageLoad.current = false;
      return;
    }
    const timer = setTimeout(() => {
      document.getElementById('articles-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return () => clearTimeout(timer);
  }, [currentPage]);

  // Sync searchInput when URL search param changes externally
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  const handleSearch = () => {
    updateParams({ search: searchInput.trim() });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleCategoryClick = (slug: string) => {
    updateParams({ category: currentCategory === slug ? '' : slug });
  };

  const sortOptions = [
    { value: 'latest', label: 'ล่าสุด' },
    { value: 'popular', label: 'ยอดนิยม' },
    { value: 'oldest', label: 'เก่าสุด' },
  ];

  // --- Render ---
  return (
    <div className="bg-surface text-gray-800 min-h-screen">
      {/* Hero Section */}
      <header className="relative bg-primary px-4 pt-16 pb-20 text-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="max-w-3xl mx-auto relative z-10 pt-10">
          <span className="bg-accent/20 text-accent border border-accent/20 px-3 py-1 rounded-full text-xs font-bold mb-4 inline-block backdrop-blur-sm">
            Car2Hand Academy
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
            คู่มือสามัญประจำ <span className="text-accent">รถ</span>
          </h1>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            ค้นหาข้อมูลรถ วิธีดูแลรักษา และเทคนิคการดูรถมือสองจากผู้เชี่ยวชาญ
          </p>

          {/* Search bar */}
          <div className="bg-white p-2 rounded-2xl shadow-xl flex items-center max-w-2xl mx-auto transform hover:scale-[1.01] transition duration-300">
            <Search size={24} className="text-gray-400 ml-3" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="ค้นหาบทความ เช่น น้ำท่วม, เปลี่ยนยาง, โอนรถ..."
              className="w-full p-3 outline-none text-gray-700 bg-transparent placeholder-gray-400"
            />
            <button
              onClick={handleSearch}
              className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-opacity-90 transition shadow-md"
            >
              ค้นหา
            </button>
          </div>

          {/* Category filter pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg backdrop-blur-sm transition border text-sm font-medium ${
                    currentCategory === cat.slug
                      ? 'bg-accent text-white border-accent shadow-md'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                  }`}
                >
                  {cat.name}
                  <span className="text-[10px] opacity-75">({cat._count.articles})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Featured Articles */}
        {!isFeaturedLoading && featuredArticles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
              <Star className="text-yellow-500" fill="currentColor" /> บทความแนะนำ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer hover:shadow-lg transition duration-300 block flex flex-col"
                >
                  <div className="h-48 md:h-56 overflow-hidden relative bg-gray-100">
                    {article.featuredImage ? (
                      <img
                        src={article.featuredImage}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        alt={article.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Newspaper size={64} />
                      </div>
                    )}
                    {article.category && (
                      <span className="absolute top-4 left-4 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        {article.category.name}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 font-medium">
                      {article.category && (
                        <span className="uppercase tracking-wider">{article.category.name}</span>
                      )}
                      <span>-</span>
                      <span>{readTime(article.content)} นาทีอ่าน</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed flex-1">
                      {article.excerpt || article.content.substring(0, 150)}
                    </p>
                    <span className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      อ่านต่อ <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Articles Column */}
          <div className="lg:col-span-2">
            {/* Header with sort */}
            <div id="articles-heading" className="flex items-center justify-between mb-6 scroll-mt-6">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <Newspaper className="text-blue-500" />
                {currentSearch
                  ? `ผลค้นหา "${currentSearch}"`
                  : currentCategory
                  ? `บทความ: ${categories.find((c) => c.slug === currentCategory)?.name || currentCategory}`
                  : 'บทความล่าสุด'}
              </h2>
              <div className="relative">
                <select
                  value={currentSort}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                  className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-gray-600 cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ArrowUpNarrowWide
                  size={16}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-32 h-24 bg-gray-200 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="h-3 bg-gray-200 rounded w-20" />
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Articles list */}
            {!isLoading && articles.length > 0 && (
              <div className="space-y-4">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && articles.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <Newspaper size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-600 mb-2">ไม่พบบทความ</h3>
                <p className="text-sm text-gray-400 mb-4">
                  {currentSearch
                    ? `ไม่พบบทความที่ตรงกับ "${currentSearch}"`
                    : 'ยังไม่มีบทความในหมวดนี้'}
                </p>
                <button
                  onClick={() => {
                    setSearchInput('');
                    router.push('/articles');
                  }}
                  className="text-primary font-bold text-sm hover:underline"
                >
                  ดูบทความทั้งหมด
                </button>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => updateParams({ page: String(currentPage - 1) })}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-primary hover:text-white hover:border-primary transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-200"
                >
                  <ArrowLeft size={16} /> ก่อนหน้า
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    // Show first, last, current, and neighbors
                    if (p === 1 || p === pagination.totalPages) return true;
                    if (Math.abs(p - currentPage) <= 1) return true;
                    return false;
                  })
                  .reduce<(number | string)[]>((acc, p, idx, arr) => {
                    if (idx > 0) {
                      const prev = arr[idx - 1];
                      if (p - prev > 1) acc.push('...');
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    typeof item === 'string' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => updateParams({ page: String(item) })}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                          item === currentPage
                            ? 'bg-primary text-white shadow-md'
                            : 'border border-gray-200 text-gray-600 hover:bg-primary hover:text-white hover:border-primary'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                <button
                  onClick={() => updateParams({ page: String(currentPage + 1) })}
                  disabled={currentPage >= (pagination?.totalPages || 1)}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-primary hover:text-white hover:border-primary transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-200"
                >
                  ถัดไป <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Popular Articles */}
            {popularArticles.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                  <Star className="text-yellow-500" size={20} /> บทความยอดนิยม
                </h3>
                <div className="space-y-4">
                  {popularArticles.map((article, index) => (
                    <PopularArticleItem key={article.id} article={article} index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Loan Calculator */}
            <div className="sticky top-24">
              <LoanCalculator />

              {/* CTA Card */}
              <div className="bg-gradient-to-br from-gray-900 to-primary text-white p-6 rounded-2xl relative overflow-hidden text-center shadow-lg mt-8">
                <div className="relative z-10">
                  <h3 className="font-bold text-xl mb-2">
                    มีความรู้แล้ว...
                    <br />
                    พร้อมดูรถหรือยัง?
                  </h3>
                  <p className="text-xs text-gray-300 mb-6">
                    ค้นหารถมือสองคุณภาพดี ที่ผ่านการตรวจสอบแล้วกว่า 200 จุด
                  </p>
                  <Link
                    href="/buy"
                    className="bg-accent text-white w-full py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg block"
                  >
                    ไปตลาดซื้อขายรถ
                  </Link>
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// --- Page export with Suspense boundary ---

export default function ArticlesPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-surface min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <ArticlesContent />
    </Suspense>
  );
}
