import prisma from '../src/db';

async function seedCategories() {
    console.log('🧹 Clearing old article categories...');
    // We should be careful if there are articles linked to these categories.
    // However, since this is an explicit request to delete old categories and seed new ones:
    try {
        await prisma.articleCategory.deleteMany({});
        console.log('✅ Old categories cleared');
    } catch (error) {
        console.error('❌ Error clearing old categories:', error);
    }

    console.log('🌱 Seeding new article categories...');

    const categories = [
        { name: 'ทั่วไป', slug: 'general' },
        { name: 'ดูแลรักษาซ่อมบำรุง', slug: 'maintenance' },
        { name: 'กฎหมายและประกันภัย', slug: 'law-and-insurance' },
        { name: 'การเงินเกี่ยวกับรถ', slug: 'finance' },
        { name: 'เทคนิคการขับขี่', slug: 'driving-techniques' }
    ];

    for (const cat of categories) {
        await prisma.articleCategory.create({
            data: { name: cat.name, slug: cat.slug }
        });
    }

    console.log('✅ Article categories seeded successfully');
}

seedCategories()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
