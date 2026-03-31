import prisma from '../src/db';

async function seedCategories() {
    console.log('📚 Seeding article categories...');

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

    for (const cat of categories) {
        await prisma.articleCategory.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name },
            create: cat,
        });
        console.log(`  ✓ ${cat.name}`);
    }

    console.log('✅ Article categories seeded!');
}

seedCategories()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
