/**
 * Public Articles Routes
 */

import { Elysia, t } from 'elysia';
import prisma from './db';

export const articleRoutes = new Elysia({ prefix: '/articles' })
    // GET /articles - List all articles with pagination
    .get('/', async ({ query }) => {
        const { page = '1', limit = '12', category } = query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const [articles, total] = await Promise.all([
            prisma.article.findMany({
                where: {
                    status: 'PUBLISHED',
                    ...(category && { category: category as any })
                },
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: {
                        select: { fullName: true }
                    }
                }
            }),
            prisma.article.count({
                where: {
                    status: 'PUBLISHED',
                    ...(category && { category: category as any })
                }
            })
        ]);

        return {
            success: true,
            articles,
            pagination: {
                total,
                page: parseInt(page),
                limit: take,
                totalPages: Math.ceil(total / take)
            }
        };
    }, {
        query: t.Object({
            page: t.Optional(t.String()),
            limit: t.Optional(t.String()),
            category: t.Optional(t.String())
        })
    })

    // GET /articles/:slug - Get single article by slug
    .get('/:slug', async ({ params: { slug }, set }) => {
        const article = await prisma.article.findUnique({
            where: { slug },
            include: {
                author: {
                    select: { fullName: true }
                }
            }
        });

        if (!article) {
            set.status = 404;
            return { success: false, message: 'ไม่พบข่าวสาร/บทความ' };
        }

        // Increment view count (async)
        prisma.article.update({
            where: { id: article.id },
            data: { viewCount: { increment: 1 } }
        }).catch(err => console.error('Failed to increment view count:', err));

        return {
            success: true,
            article
        };
    });
