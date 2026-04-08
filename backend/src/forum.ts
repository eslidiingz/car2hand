/**
 * Forum / Community Routes
 * Public: list posts, get post, categories, stats, leaderboard
 * Auth required: create post, comment, vote
 */

import { Elysia, t } from 'elysia';
import prisma from './db';

// ─── helpers ────────────────────────────────────────────────────────────────

const authorSelect = {
    id: true,
    fullName: true,
} as const;

// Score formula for "trending": upvotes weighted + recency bonus
function trendingScore(upvotes: number, createdAt: Date): number {
    const ageHours = (Date.now() - createdAt.getTime()) / 3_600_000;
    return upvotes * 2 - Math.sqrt(ageHours);
}

// ─── routes ─────────────────────────────────────────────────────────────────

export const forumRoutes = new Elysia({ prefix: '/forum' })

    // ── Categories ──────────────────────────────────────────────────────────

    .get('/categories', async () => {
        const categories = await prisma.forumCategory.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
            include: {
                _count: { select: { posts: true } },
            },
        });
        return { categories };
    })

    // ── Posts List ───────────────────────────────────────────────────────────
    // GET /forum/posts?tab=trending|latest|unanswered&category=slug&page=1&limit=20

    .get('/posts', async ({ query }) => {
        const {
            tab = 'latest',
            category,
            page = '1',
            limit = '20',
            tag,
            listingId,
        } = query;

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        const take = parseInt(limit as string);

        const where: any = {
            status: 'PUBLISHED',
            ...(category && { category: { slug: category } }),
            ...(tag && { tags: { some: { tag: { name: tag } } } }),
            ...(listingId && { listingId }),
            ...(tab === 'unanswered' && {
                comments: { none: {} },
            }),
        };

        const [posts, total] = await Promise.all([
            prisma.forumPost.findMany({
                where,
                skip,
                take,
                orderBy:
                    tab === 'latest'
                        ? { createdAt: 'desc' }
                        : tab === 'unanswered'
                        ? { createdAt: 'desc' }
                        : { createdAt: 'desc' }, // trending: sort in memory after fetch
                include: {
                    author: { select: authorSelect },
                    category: { select: { id: true, name: true, slug: true, color: true, icon: true } },
                    _count: { select: { comments: true, votes: true } },
                    votes: { select: { type: true } },
                    tags: { include: { tag: { select: { name: true } } } },
                },
            }),
            prisma.forumPost.count({ where }),
        ]);

        // compute vote score for each post
        const postsWithScore = posts.map((p) => {
            const upvotes = p.votes.filter((v) => v.type === 'UP').length;
            const downvotes = p.votes.filter((v) => v.type === 'DOWN').length;
            const score = upvotes - downvotes;
            return {
                id: p.id,
                title: p.title,
                content: p.content.slice(0, 200),
                imageUrl: p.imageUrl,
                isPinned: p.isPinned,
                isSolved: p.isSolved,
                viewCount: p.viewCount,
                createdAt: p.createdAt,
                author: p.author,
                category: p.category,
                commentCount: p._count.comments,
                score,
                tags: p.tags.map((t) => t.tag.name),
                _trending: trendingScore(score, p.createdAt),
            };
        });

        if (tab === 'trending') {
            postsWithScore.sort((a, b) => b._trending - a._trending);
        }

        return {
            posts: postsWithScore,
            pagination: {
                total,
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                totalPages: Math.ceil(total / parseInt(limit as string)),
            },
        };
    })

    // ── Single Post ──────────────────────────────────────────────────────────

    .get('/posts/:id', async ({ params, set }) => {
        const post = await prisma.forumPost.findUnique({
            where: { id: params.id },
            include: {
                author: { select: authorSelect },
                category: { select: { id: true, name: true, slug: true, color: true, icon: true } },
                tags: { include: { tag: { select: { name: true } } } },
                votes: { select: { type: true } },
                comments: {
                    where: { parentId: null }, // top-level only
                    orderBy: [{ isBestAnswer: 'desc' }, { createdAt: 'asc' }],
                    include: {
                        author: { select: authorSelect },
                        votes: { select: { type: true } },
                        replies: {
                            orderBy: { createdAt: 'asc' },
                            include: {
                                author: { select: authorSelect },
                                votes: { select: { type: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!post) {
            set.status = 404;
            return { message: 'ไม่พบกระทู้' };
        }

        // increment view count
        await prisma.forumPost.update({
            where: { id: params.id },
            data: { viewCount: { increment: 1 } },
        });

        const upvotes = post.votes.filter((v) => v.type === 'UP').length;
        const downvotes = post.votes.filter((v) => v.type === 'DOWN').length;

        return {
            post: {
                ...post,
                score: upvotes - downvotes,
                tags: post.tags.map((t) => t.tag.name),
                comments: post.comments.map((c) => ({
                    ...c,
                    score: c.votes.filter((v) => v.type === 'UP').length - c.votes.filter((v) => v.type === 'DOWN').length,
                    replies: c.replies.map((r) => ({
                        ...r,
                        score: r.votes.filter((v) => v.type === 'UP').length - r.votes.filter((v) => v.type === 'DOWN').length,
                    })),
                })),
            },
        };
    })

    // ── Create Post (auth) ───────────────────────────────────────────────────

    .post(
        '/posts',
        async ({ body, set }) => {
            const { userId, categoryId, title, content, imageUrl, tags, listingId } = body;

            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                set.status = 401;
                return { message: 'กรุณาเข้าสู่ระบบ' };
            }

            const category = await prisma.forumCategory.findUnique({ where: { id: categoryId } });
            if (!category) {
                set.status = 400;
                return { message: 'ไม่พบหมวดหมู่' };
            }

            // upsert tags
            const tagRecords = await Promise.all(
                (tags ?? []).map((name: string) =>
                    prisma.forumTag.upsert({
                        where: { name },
                        update: {},
                        create: { name },
                    })
                )
            );

            const post = await prisma.forumPost.create({
                data: {
                    title,
                    content,
                    imageUrl,
                    authorId: userId,
                    categoryId,
                    ...(listingId && { listingId }),
                    tags: {
                        create: tagRecords.map((tag) => ({ tagId: tag.id })),
                    },
                },
                include: {
                    author: { select: authorSelect },
                    category: { select: { id: true, name: true, slug: true } },
                    tags: { include: { tag: { select: { name: true } } } },
                },
            });

            // update reputation
            await prisma.userReputation.upsert({
                where: { userId },
                update: { totalPosts: { increment: 1 }, points: { increment: 1 } },
                create: { userId, totalPosts: 1, points: 1 },
            });

            return {
                message: 'สร้างกระทู้สำเร็จ',
                post: { ...post, tags: post.tags.map((t) => t.tag.name) },
            };
        },
        {
            body: t.Object({
                userId: t.String(),
                categoryId: t.String(),
                title: t.String({ minLength: 5, maxLength: 200 }),
                content: t.String({ minLength: 10 }),
                imageUrl: t.Optional(t.String()),
                tags: t.Optional(t.Array(t.String())),
                listingId: t.Optional(t.String()),
            }),
        }
    )

    // ── Vote Post (auth) ─────────────────────────────────────────────────────

    .post(
        '/posts/:id/vote',
        async ({ params, body, set }) => {
            const { userId, type } = body;

            const post = await prisma.forumPost.findUnique({ where: { id: params.id } });
            if (!post) {
                set.status = 404;
                return { message: 'ไม่พบกระทู้' };
            }

            const existing = await prisma.forumVote.findUnique({
                where: { postId_userId: { postId: params.id, userId } },
            });

            if (existing) {
                if (existing.type === type) {
                    // undo vote
                    await prisma.forumVote.delete({
                        where: { postId_userId: { postId: params.id, userId } },
                    });
                    return { message: 'ยกเลิกโหวตแล้ว', voted: null };
                } else {
                    // change vote
                    await prisma.forumVote.update({
                        where: { postId_userId: { postId: params.id, userId } },
                        data: { type },
                    });
                    return { message: 'เปลี่ยนโหวตแล้ว', voted: type };
                }
            }

            await prisma.forumVote.create({
                data: { postId: params.id, userId, type },
            });

            // +1 reputation for post author when upvoted
            if (type === 'UP' && post.authorId !== userId) {
                await prisma.userReputation.upsert({
                    where: { userId: post.authorId },
                    update: { points: { increment: 1 } },
                    create: { userId: post.authorId, points: 1 },
                });
            }

            return { message: 'โหวตสำเร็จ', voted: type };
        },
        {
            body: t.Object({
                userId: t.String(),
                type: t.Union([t.Literal('UP'), t.Literal('DOWN')]),
            }),
        }
    )

    // ── Add Comment (auth) ───────────────────────────────────────────────────

    .post(
        '/posts/:id/comments',
        async ({ params, body, set }) => {
            const { userId, content, parentId } = body;

            const post = await prisma.forumPost.findUnique({ where: { id: params.id } });
            if (!post) {
                set.status = 404;
                return { message: 'ไม่พบกระทู้' };
            }

            const comment = await prisma.forumComment.create({
                data: {
                    content,
                    postId: params.id,
                    authorId: userId,
                    parentId: parentId ?? null,
                },
                include: { author: { select: authorSelect } },
            });

            // +5 reputation for answering
            await prisma.userReputation.upsert({
                where: { userId },
                update: { points: { increment: 5 } },
                create: { userId, points: 5 },
            });

            return { message: 'ตอบกระทู้สำเร็จ', comment };
        },
        {
            body: t.Object({
                userId: t.String(),
                content: t.String({ minLength: 2 }),
                parentId: t.Optional(t.String()),
            }),
        }
    )

    // ── Mark Best Answer (post author only) ──────────────────────────────────

    .patch(
        '/comments/:commentId/best-answer',
        async ({ params, body, set }) => {
            const { userId } = body;

            const comment = await prisma.forumComment.findUnique({
                where: { id: params.commentId },
                include: { post: true },
            });

            if (!comment) {
                set.status = 404;
                return { message: 'ไม่พบความเห็น' };
            }

            if (comment.post.authorId !== userId) {
                set.status = 403;
                return { message: 'เฉพาะเจ้าของกระทู้เท่านั้น' };
            }

            // unmark previous best answer in same post
            await prisma.forumComment.updateMany({
                where: { postId: comment.postId, isBestAnswer: true },
                data: { isBestAnswer: false },
            });

            await prisma.forumComment.update({
                where: { id: params.commentId },
                data: { isBestAnswer: true },
            });

            // mark post as solved
            await prisma.forumPost.update({
                where: { id: comment.postId },
                data: { isSolved: true },
            });

            // +20 reputation for best answer author
            await prisma.userReputation.upsert({
                where: { userId: comment.authorId },
                update: { points: { increment: 20 }, totalAnswers: { increment: 1 } },
                create: { userId: comment.authorId, points: 20, totalAnswers: 1 },
            });

            return { message: 'เลือกคำตอบที่ดีที่สุดแล้ว' };
        },
        {
            body: t.Object({ userId: t.String() }),
        }
    )

    // ── Vote Comment (auth) ──────────────────────────────────────────────────

    .post(
        '/comments/:commentId/vote',
        async ({ params, body, set }) => {
            const { userId, type } = body;

            const comment = await prisma.forumComment.findUnique({ where: { id: params.commentId } });
            if (!comment) {
                set.status = 404;
                return { message: 'ไม่พบความเห็น' };
            }

            const existing = await prisma.forumCommentVote.findUnique({
                where: { commentId_userId: { commentId: params.commentId, userId } },
            });

            if (existing) {
                if (existing.type === type) {
                    await prisma.forumCommentVote.delete({
                        where: { commentId_userId: { commentId: params.commentId, userId } },
                    });
                    return { message: 'ยกเลิกโหวตแล้ว', voted: null };
                } else {
                    await prisma.forumCommentVote.update({
                        where: { commentId_userId: { commentId: params.commentId, userId } },
                        data: { type },
                    });
                    return { message: 'เปลี่ยนโหวตแล้ว', voted: type };
                }
            }

            await prisma.forumCommentVote.create({
                data: { commentId: params.commentId, userId, type },
            });

            return { message: 'โหวตสำเร็จ', voted: type };
        },
        {
            body: t.Object({
                userId: t.String(),
                type: t.Union([t.Literal('UP'), t.Literal('DOWN')]),
            }),
        }
    )

    // ── Leaderboard ──────────────────────────────────────────────────────────

    .get('/leaderboard', async ({ query }) => {
        const { limit = '10' } = query;

        const reputations = await prisma.userReputation.findMany({
            orderBy: { points: 'desc' },
            take: parseInt(limit as string),
            include: {
                user: { select: { id: true, fullName: true } },
            },
        });

        return {
            leaderboard: reputations.map((r, i) => ({
                rank: i + 1,
                userId: r.userId,
                fullName: r.user.fullName,
                points: r.points,
                totalPosts: r.totalPosts,
                totalAnswers: r.totalAnswers,
            })),
        };
    })

    // ── Popular Tags ─────────────────────────────────────────────────────────

    .get('/tags/popular', async ({ query }) => {
        const { limit = '20' } = query;

        const tags = await prisma.forumTag.findMany({
            include: { _count: { select: { posts: true } } },
            orderBy: { posts: { _count: 'desc' } },
            take: parseInt(limit as string),
        });

        return {
            tags: tags.map((t) => ({ name: t.name, count: t._count.posts })),
        };
    })

    // ── Community Stats ──────────────────────────────────────────────────────

    .get('/stats', async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [memberCount, postsToday, totalPosts] = await Promise.all([
            prisma.user.count(),
            prisma.forumPost.count({
                where: { createdAt: { gte: today }, status: 'PUBLISHED' },
            }),
            prisma.forumPost.count({ where: { status: 'PUBLISHED' } }),
        ]);

        return { memberCount, postsToday, totalPosts };
    });

// ─── protected routes (auth required) ───────────────────────────────────────

const protectedForumRoutes = new Elysia({ prefix: '/forum' })
    .use(authGuard)

    // ── Create Post (auth) ───────────────────────────────────────────────────

    .post(
        '/posts',
        async ({ body, auth, set }) => {
            if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;
            const { categoryId, title, content, imageUrl, tags, listingId } = body;

            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                set.status = 401;
                return { message: 'กรุณาเข้าสู่ระบบ' };
            }

            const category = await prisma.forumCategory.findUnique({ where: { id: categoryId } });
            if (!category) {
                set.status = 400;
                return { message: 'ไม่พบหมวดหมู่' };
            }

            // upsert tags
            const tagRecords = await Promise.all(
                (tags ?? []).map((name: string) =>
                    prisma.forumTag.upsert({
                        where: { name },
                        update: {},
                        create: { name },
                    })
                )
            );

            const post = await prisma.forumPost.create({
                data: {
                    title,
                    content,
                    imageUrl,
                    authorId: userId,
                    categoryId,
                    ...(listingId && { listingId }),
                    tags: {
                        create: tagRecords.map((tag) => ({ tagId: tag.id })),
                    },
                },
                include: {
                    author: { select: authorSelect },
                    category: { select: { id: true, name: true, slug: true } },
                    tags: { include: { tag: { select: { name: true } } } },
                },
            });

            // update reputation
            await prisma.userReputation.upsert({
                where: { userId },
                update: { totalPosts: { increment: 1 }, points: { increment: 1 } },
                create: { userId, totalPosts: 1, points: 1 },
            });

            return {
                message: 'สร้างกระทู้สำเร็จ',
                post: { ...post, tags: post.tags.map((t) => t.tag.name) },
            };
        },
        {
            body: t.Object({
                categoryId: t.String(),
                title: t.String({ minLength: 5, maxLength: 200 }),
                content: t.String({ minLength: 10 }),
                imageUrl: t.Optional(t.String()),
                tags: t.Optional(t.Array(t.String())),
                listingId: t.Optional(t.String()),
            }),
        }
    )

    // ── Vote Post (auth) ─────────────────────────────────────────────────────

    .post(
        '/posts/:id/vote',
        async ({ params, body, auth, set }) => {
            if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;
            const { type } = body;

            const post = await prisma.forumPost.findUnique({ where: { id: params.id } });
            if (!post) {
                set.status = 404;
                return { message: 'ไม่พบกระทู้' };
            }

            const existing = await prisma.forumVote.findUnique({
                where: { postId_userId: { postId: params.id, userId } },
            });

            if (existing) {
                if (existing.type === type) {
                    // undo vote
                    await prisma.forumVote.delete({
                        where: { postId_userId: { postId: params.id, userId } },
                    });
                    return { message: 'ยกเลิกโหวตแล้ว', voted: null };
                } else {
                    // change vote
                    await prisma.forumVote.update({
                        where: { postId_userId: { postId: params.id, userId } },
                        data: { type },
                    });
                    return { message: 'เปลี่ยนโหวตแล้ว', voted: type };
                }
            }

            await prisma.forumVote.create({
                data: { postId: params.id, userId, type },
            });

            // +1 reputation for post author when upvoted
            if (type === 'UP' && post.authorId !== userId) {
                await prisma.userReputation.upsert({
                    where: { userId: post.authorId },
                    update: { points: { increment: 1 } },
                    create: { userId: post.authorId, points: 1 },
                });
            }

            return { message: 'โหวตสำเร็จ', voted: type };
        },
        {
            body: t.Object({
                type: t.Union([t.Literal('UP'), t.Literal('DOWN')]),
            }),
        }
    )

    // ── Add Comment (auth) ───────────────────────────────────────────────────

    .post(
        '/posts/:id/comments',
        async ({ params, body, auth, set }) => {
            if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;
            const { content, parentId } = body;

            const post = await prisma.forumPost.findUnique({ where: { id: params.id } });
            if (!post) {
                set.status = 404;
                return { message: 'ไม่พบกระทู้' };
            }

            const comment = await prisma.forumComment.create({
                data: {
                    content,
                    postId: params.id,
                    authorId: userId,
                    parentId: parentId ?? null,
                },
                include: { author: { select: authorSelect } },
            });

            // +5 reputation for answering
            await prisma.userReputation.upsert({
                where: { userId },
                update: { points: { increment: 5 } },
                create: { userId, points: 5 },
            });

            return { message: 'ตอบกระทู้สำเร็จ', comment };
        },
        {
            body: t.Object({
                content: t.String({ minLength: 2 }),
                parentId: t.Optional(t.String()),
            }),
        }
    )

    // ── Mark Best Answer (post author only) ──────────────────────────────────

    .patch(
        '/comments/:commentId/best-answer',
        async ({ params, auth, set }) => {
            if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;

            const comment = await prisma.forumComment.findUnique({
                where: { id: params.commentId },
                include: { post: true },
            });

            if (!comment) {
                set.status = 404;
                return { message: 'ไม่พบความเห็น' };
            }

            if (comment.post.authorId !== userId) {
                set.status = 403;
                return { message: 'เฉพาะเจ้าของกระทู้เท่านั้น' };
            }

            // unmark previous best answer in same post
            await prisma.forumComment.updateMany({
                where: { postId: comment.postId, isBestAnswer: true },
                data: { isBestAnswer: false },
            });

            await prisma.forumComment.update({
                where: { id: params.commentId },
                data: { isBestAnswer: true },
            });

            // mark post as solved
            await prisma.forumPost.update({
                where: { id: comment.postId },
                data: { isSolved: true },
            });

            // +20 reputation for best answer author
            await prisma.userReputation.upsert({
                where: { userId: comment.authorId },
                update: { points: { increment: 20 }, totalAnswers: { increment: 1 } },
                create: { userId: comment.authorId, points: 20, totalAnswers: 1 },
            });

            return { message: 'เลือกคำตอบที่ดีที่สุดแล้ว' };
        }
    )

    // ── Vote Comment (auth) ──────────────────────────────────────────────────

    .post(
        '/comments/:commentId/vote',
        async ({ params, body, auth, set }) => {
            if (!auth || !auth.userId) { set.status = 401; return { error: "Unauthorized", message: "กรุณาเข้าสู่ระบบ" }; }
        const userId = auth.userId;
            const { type } = body;

            const comment = await prisma.forumComment.findUnique({ where: { id: params.commentId } });
            if (!comment) {
                set.status = 404;
                return { message: 'ไม่พบความเห็น' };
            }

            const existing = await prisma.forumCommentVote.findUnique({
                where: { commentId_userId: { commentId: params.commentId, userId } },
            });

            if (existing) {
                if (existing.type === type) {
                    await prisma.forumCommentVote.delete({
                        where: { commentId_userId: { commentId: params.commentId, userId } },
                    });
                    return { message: 'ยกเลิกโหวตแล้ว', voted: null };
                } else {
                    await prisma.forumCommentVote.update({
                        where: { commentId_userId: { commentId: params.commentId, userId } },
                        data: { type },
                    });
                    return { message: 'เปลี่ยนโหวตแล้ว', voted: type };
                }
            }

            await prisma.forumCommentVote.create({
                data: { commentId: params.commentId, userId, type },
            });

            return { message: 'โหวตสำเร็จ', voted: type };
        },
        {
            body: t.Object({
                type: t.Union([t.Literal('UP'), t.Literal('DOWN')]),
            }),
        }
    );

// ─── combined export ────────────────────────────────────────────────────────

export const forumRoutes = new Elysia()
    .use(publicForumRoutes)
    .use(protectedForumRoutes);
