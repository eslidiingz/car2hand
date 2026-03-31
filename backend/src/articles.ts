import { Elysia, t } from 'elysia';
import prisma from './db';

export const articleRoutes = new Elysia({ prefix: '/articles' })

    // GET /articles - List with search, filter, sort, pagination
    .get('/', async ({ query }) => {
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '12');
        const skip = (page - 1) * limit;
        const { category, search, tag, sort, featured } = query;

        const where: any = { status: 'PUBLISHED' };

        if (category) where.category = { slug: category };
        if (tag) where.tags = { has: tag };
        if (featured === 'true') where.isFeatured = true;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } },
            ];
        }

        let orderBy: any = { createdAt: 'desc' };
        if (sort === 'popular') orderBy = { viewCount: 'desc' };
        if (sort === 'oldest') orderBy = { createdAt: 'asc' };

        const [articles, total] = await Promise.all([
            prisma.article.findMany({
                where, skip, take: limit, orderBy,
                include: {
                    category: { select: { name: true, slug: true } },
                    author: { select: { fullName: true } }
                }
            }),
            prisma.article.count({ where })
        ]);

        return {
            success: true,
            articles,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    })

    // GET /articles/categories - All categories with article count
    .get('/categories', async () => {
        const categories = await prisma.articleCategory.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { articles: { where: { status: 'PUBLISHED' } } } } }
        });
        return { success: true, categories };
    })

    // GET /articles/popular - Top articles by viewCount
    .get('/popular', async ({ query }) => {
        const limit = parseInt(query.limit || '6');
        const articles = await prisma.article.findMany({
            where: { status: 'PUBLISHED' },
            orderBy: { viewCount: 'desc' },
            take: limit,
            include: {
                category: { select: { name: true, slug: true } },
                author: { select: { fullName: true } }
            }
        });
        return { success: true, articles };
    })

    // GET /articles/featured - Featured articles
    .get('/featured', async ({ query }) => {
        const limit = parseInt(query.limit || '3');
        const articles = await prisma.article.findMany({
            where: { status: 'PUBLISHED', isFeatured: true },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                category: { select: { name: true, slug: true } },
                author: { select: { fullName: true } }
            }
        });
        return { success: true, articles };
    })

    // GET /articles/:slug - Single article (MUST be after static routes!)
    .get('/:slug', async ({ params: { slug }, set }) => {
        const article = await prisma.article.findUnique({
            where: { slug },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                author: { select: { fullName: true } }
            }
        });

        if (!article) {
            set.status = 404;
            return { success: false, message: 'ไม่พบบทความ' };
        }

        // Increment view count async
        prisma.article.update({
            where: { id: article.id },
            data: { viewCount: { increment: 1 } }
        }).catch(err => console.error('Failed to increment view count:', err));

        return { success: true, article };
    })

    // GET /articles/:slug/related - Related articles (same category)
    .get('/:slug/related', async ({ params: { slug }, query }) => {
        const limit = parseInt(query.limit || '5');
        const article = await prisma.article.findUnique({
            where: { slug },
            select: { id: true, categoryId: true, tags: true }
        });

        if (!article) return { success: true, articles: [] };

        const where: any = {
            status: 'PUBLISHED',
            id: { not: article.id },
        };

        if (article.categoryId) {
            where.categoryId = article.categoryId;
        }

        const articles = await prisma.article.findMany({
            where,
            orderBy: { viewCount: 'desc' },
            take: limit,
            include: {
                category: { select: { name: true, slug: true } },
                author: { select: { fullName: true } }
            }
        });

        return { success: true, articles };
    });
