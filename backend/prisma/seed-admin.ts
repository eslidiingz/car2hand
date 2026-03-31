import prisma from '../src/db';

async function seedAdmin() {
    console.log('🌱 Seeding admin user...');

    const username = 'admin';
    const password = 'adminPassword';

    // Hash password with secure settings matching the auth logic
    const hashedPassword = await Bun.password.hash(password, {
        algorithm: 'argon2id',
        memoryCost: 65536,
        timeCost: 3
    });

    try {
        const admin = await prisma.admin.upsert({
            where: { username },
            update: {
                password: hashedPassword
            },
            create: {
                username,
                password: hashedPassword,
                fullName: 'Administrator'
            }
        });

        console.log(`✅ Admin user seeded: ${admin.username}`);
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
    }
}

seedAdmin()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
