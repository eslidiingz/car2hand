import prisma from '../src/db';

const forumCategories = [
    {
        name: 'พูดคุยทั่วไป',
        slug: 'general',
        icon: 'ChatsCircle',
        color: 'blue',
        order: 1,
    },
    {
        name: 'ถาม-ตอบ ช่าง & ซ่อม',
        slug: 'repair',
        icon: 'Wrench',
        color: 'orange',
        order: 2,
    },
    {
        name: 'รีวิว & ทดสอบ',
        slug: 'review',
        icon: 'Star',
        color: 'green',
        order: 3,
    },
    {
        name: 'โซนรถ EV',
        slug: 'ev',
        icon: 'Lightning',
        color: 'yellow',
        order: 4,
    },
    {
        name: 'ของแต่ง & DIY',
        slug: 'accessories',
        icon: 'ShoppingCart',
        color: 'purple',
        order: 5,
    },
    {
        name: 'เตือนภัย / Blacklist',
        slug: 'alert',
        icon: 'ShieldCheck',
        color: 'red',
        order: 6,
    },
    {
        name: 'ราคาจริง & ดีลดีๆ',
        slug: 'deals',
        icon: 'Tag',
        color: 'teal',
        order: 7,
    },
    {
        name: 'ประกันภัย & ภาษี',
        slug: 'insurance',
        icon: 'FileText',
        color: 'indigo',
        order: 8,
    },
    {
        name: 'มอเตอร์ไซค์',
        slug: 'motorcycle',
        icon: 'Motorcycle',
        color: 'gray',
        order: 9,
    },
    {
        name: 'พบปะ & ทริป',
        slug: 'meetup',
        icon: 'MapPin',
        color: 'pink',
        order: 10,
    },
];

async function seedForumCategories() {
    console.log('🌱 Seeding forum categories...');

    for (const cat of forumCategories) {
        await prisma.forumCategory.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name, icon: cat.icon, color: cat.color, order: cat.order },
            create: cat,
        });
        console.log(`  ✅ ${cat.name}`);
    }

    console.log(`\n✅ Done: ${forumCategories.length} forum categories seeded`);
}

seedForumCategories()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
