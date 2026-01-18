import prisma from '../src/db';

async function seedAdmin() {
    console.log('🌱 Seeding admin user...');

    const email = 'eslidiingz@gmail.com';
    const password = '@AdminNick1234';

    // Hash password with secure settings matching the auth logic
    const hashedPassword = await Bun.password.hash(password, {
        algorithm: 'argon2id',
        memoryCost: 65536,
        timeCost: 3
    });

    try {
        const admin = await prisma.admin.upsert({
            where: { email },
            update: {
                password: hashedPassword
            },
            create: {
                email,
                password: hashedPassword,
                fullName: 'Admin Nick'
            }
        });

        console.log(`✅ Admin user seeded: ${admin.email}`);
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
    }
}

seedAdmin()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
