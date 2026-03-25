import prisma from "../src/db";

async function main() {
    console.log('🌱 Seeding packages...');

    const packages = [
        {
            name: 'Basic (Free)',
            nameTh: 'แพ็กเกจพื้นฐาน',
            slug: 'basic',
            description: 'แพ็กเกจฟรี สำหรับผู้ที่ต้องการลองใช้งาน',
            targetAudience: 'ขายคันเดียว (C2C)',
            price: 0,
            maxListings: 1,
            maxPhotosPerListing: 10,
            listingDurationDays: 30,
            autoBumpPerDay: 0,
            badge: null,
            searchPriority: 'normal',
            features: [
                'ลงประกาศได้ 1 รายการ',
                'รูปภาพสูงสุด 10 รูป',
                'ระยะเวลาประกาศ 30 วัน',
                'ดันโพสต์ด้วยตัวเอง',
            ],
            sortOrder: 0,
        },
        {
            name: 'Standard (Beginner)',
            nameTh: 'แพ็กเกจเริ่มต้น',
            slug: 'standard',
            description: 'สำหรับพ่อค้าอิสระ ลงประกาศได้มากขึ้น',
            targetAudience: 'พ่อค้าอิสระ/รถบ้าน',
            price: 299,
            maxListings: 5,
            maxPhotosPerListing: 15,
            listingDurationDays: 60,
            autoBumpPerDay: 1,
            badge: 'Verified Seller',
            searchPriority: 'higher',
            features: [
                'ลงประกาศได้ 5 รายการ',
                'รูปภาพสูงสุด 15 รูป',
                'ระยะเวลาประกาศ 60 วัน',
                'ดันโพสต์อัตโนมัติ 1 ครั้ง/วัน',
                'ป้าย Verified Seller',
                'อันดับการค้นหาดีกว่าทั่วไป',
            ],
            sortOrder: 1,
        },
        {
            name: 'Professional (Pro)',
            nameTh: 'แพ็กเกจมืออาชีพ',
            slug: 'professional',
            description: 'สำหรับเต็นท์รถขนาดเล็ก-กลาง',
            targetAudience: 'เต็นท์รถขนาดเล็ก',
            price: 990,
            maxListings: 20,
            maxPhotosPerListing: 25,
            listingDurationDays: 90,
            autoBumpPerDay: 3,
            badge: 'Hot Deal',
            searchPriority: 'top',
            features: [
                'ลงประกาศได้ 20 รายการ',
                'รูปภาพสูงสุด 25 รูป',
                'ระยะเวลาประกาศ 90 วัน',
                'ดันโพสต์อัตโนมัติ 3 ครั้ง/วัน',
                'ป้าย Hot Deal',
                'อันดับการค้นหาลำดับต้นๆ',
            ],
            sortOrder: 2,
        },
        {
            name: 'Premium (Elite)',
            nameTh: 'แพ็กเกจพรีเมียม',
            slug: 'premium',
            description: 'สำหรับโชว์รูมและเต็นท์ขนาดใหญ่',
            targetAudience: 'โชว์รูม/เต็นท์ใหญ่',
            price: 2500,
            maxListings: -1,
            maxPhotosPerListing: 40,
            listingDurationDays: -1,
            autoBumpPerDay: 5,
            badge: 'Premium Choice',
            searchPriority: 'priority',
            features: [
                'ลงประกาศไม่จำกัด',
                'รูปภาพสูงสุด 40 รูป',
                'ประกาศไม่มีหมดอายุ',
                'ดันโพสต์อัตโนมัติ 5 ครั้ง/วัน',
                'ป้าย Premium Choice',
                'อันดับการค้นหาบนสุด (Priority)',
            ],
            sortOrder: 3,
        },
    ];

    for (const pkg of packages) {
        await prisma.package.upsert({
            where: { slug: pkg.slug },
            update: pkg,
            create: pkg,
        });
        console.log(`  ✓ ${pkg.name}`);
    }

    console.log('✅ Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
