import prisma from "../src/db";

async function main() {
    console.log('🌱 Seeding packages...');

    const packages = [
        {
            name: 'Basic',
            nameTh: 'แพ็กเกจพื้นฐาน',
            slug: 'basic',
            description: 'แพ็กเกจฟรี สำหรับผู้ที่ต้องการลองใช้งาน',
            targetAudience: 'ขายคันเดียว (C2C)',
            price: 0,
            maxListings: 3,
            maxPhotosPerListing: 15,
            listingDurationDays: 45,
            autoBumpPerDay: 0,
            manualBumpPerDay: 1,
            badge: null,
            searchPriority: 'normal',
            features: [
                'ลงประกาศได้สูงสุด 3 รายการ',
                'รูปภาพสูงสุด 15 รูป',
                'ระยะเวลาประกาศ 45 วัน',
                'ดันโพสต์ด้วยตัวเอง 1 ครั้ง/คัน/วัน',
            ],
            sortOrder: 0,
        },
        {
            name: 'Standard',
            nameTh: 'แพ็กเกจเริ่มต้น',
            slug: 'standard',
            description: 'สำหรับพ่อค้าอิสระ ลงประกาศได้มากขึ้น',
            targetAudience: 'พ่อค้าอิสระ/รถบ้าน',
            price: 299,
            maxListings: 8,
            maxPhotosPerListing: 20,
            listingDurationDays: 60,
            autoBumpPerDay: 1,
            manualBumpPerDay: 1,
            // NOTE: Badge removed — "Verified Seller" is now KYC-earned (ยืนยันตัวตน),
            // not a paid perk. Package badges are cosmetic/commercial only.
            badge: null,
            searchPriority: 'higher',
            features: [
                'ลงประกาศได้ 8 รายการ',
                'รูปภาพสูงสุด 20 รูป',
                'ระยะเวลาประกาศ 60 วัน',
                'ดันโพสต์อัตโนมัติ 1 ครั้ง/วัน + ด้วยตัวเอง 1 ครั้ง/คัน/วัน',
                'อันดับการค้นหาดีกว่าทั่วไป',
            ],
            sortOrder: 1,
        },
        {
            name: 'Professional',
            nameTh: 'แพ็กเกจมืออาชีพ',
            slug: 'professional',
            description: 'สำหรับเต็นท์รถขนาดเล็ก-กลาง',
            targetAudience: 'เต็นท์รถขนาดเล็ก',
            price: 699,
            maxListings: 20,
            maxPhotosPerListing: 30,
            listingDurationDays: 90,
            autoBumpPerDay: 3,
            manualBumpPerDay: 2,
            badge: 'Hot Deal',
            searchPriority: 'top',
            features: [
                'ลงประกาศได้ 20 รายการ',
                'รูปภาพสูงสุด 30 รูป',
                'ระยะเวลาประกาศ 90 วัน',
                'ดันโพสต์อัตโนมัติ 3 ครั้ง/วัน + ด้วยตัวเอง 2 ครั้ง/คัน/วัน',
                'ป้าย Hot Deal',
                'AI ช่วยแนะนำราคา (AI Price Suggest)',
                'อันดับการค้นหาลำดับต้นๆ',
            ],
            sortOrder: 2,
        },
        {
            name: 'Dealer',
            nameTh: 'แพ็กเกจดีลเลอร์',
            slug: 'premium',
            description: 'สำหรับโชว์รูมและเต็นท์ขนาดใหญ่',
            targetAudience: 'โชว์รูม/เต็นท์ใหญ่',
            price: 1990,
            maxListings: 150,
            maxPhotosPerListing: 40,
            listingDurationDays: 180,
            autoBumpPerDay: 5,
            manualBumpPerDay: 3,
            badge: 'Premium Choice',
            searchPriority: 'priority',
            features: [
                'ลงประกาศสูงสุด 150 รายการ',
                'รูปภาพสูงสุด 40 รูป/ประกาศ',
                'ประกาศแสดงนาน 180 วัน',
                'ดันโพสต์อัตโนมัติ 5 ครั้ง/วัน + ด้วยตัวเอง 3 ครั้ง/คัน/วัน',
                'ป้าย Premium Choice',
                'AI ช่วยแนะนำราคา (AI Price Suggest)',
                'หน้า Showroom ของคุณเอง',
                'อัปโหลดประกาศจำนวนมาก (Bulk Upload CSV)',
                'ระบบวิเคราะห์ข้อมูล (Analytics)',
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

    // =============================================
    // Seed Inspection Packages
    // =============================================
    console.log('🔍 Seeding inspection packages...');

    await prisma.inspectionPackage.deleteMany();

    const inspectionPackages = [
        {
            name: 'Standard Check',
            nameEn: 'Standard Check',
            price: 1500,
            description: 'ตรวจสภาพพื้นฐานครอบคลุม 4 จุดสำคัญ',
            features: [
                'ตรวจโครงสร้างตัวถัง (ชนหนัก/ตัดต่อ)',
                'ตรวจสภาพสีรอบคัน',
                'ตรวจห้องเครื่อง & ของเหลว',
                'ตรวจภายในห้องโดยสาร',
            ],
            isRecommended: false,
            order: 0,
        },
        {
            name: 'Premium Full Option',
            nameEn: 'Premium Full Option',
            price: 2500,
            description: 'ตรวจสภาพแบบครบวงจร รวมทุกรายการ + สแกนคอมพิวเตอร์ + ทดลองขับ',
            features: [
                'รวมทุกอย่างใน Standard',
                'ตรวจใต้ท้องรถ (ช่วงล่าง/สนิม)',
                'สแกนระบบไฟด้วยคอมพิวเตอร์ (OBD2)',
                'ทดลองขับจริง (Test Drive)',
            ],
            isRecommended: true,
            order: 1,
        },
    ];

    for (const pkg of inspectionPackages) {
        await prisma.inspectionPackage.create({ data: pkg });
        console.log(`  ✓ ${pkg.name}`);
    }

    // =============================================
    // Seed Service Partners
    // =============================================
    console.log('🏦 Seeding service partners...');

    await prisma.servicePartner.deleteMany();

    const servicePartners = [
        // Banks
        {
            name: 'SCB',
            type: 'BANK' as const,
            highlight: 'อนุมัติไว 1 วัน',
            description: 'ธนาคารไทยพาณิชย์',
            order: 0,
        },
        {
            name: 'Kasikorn (KBank)',
            type: 'BANK' as const,
            highlight: 'ดอกเบี้ยพิเศษ',
            description: 'ธนาคารกสิกรไทย',
            order: 1,
        },
        {
            name: 'Thanachart',
            type: 'BANK' as const,
            highlight: 'รับทุกอาชีพ',
            description: 'ธนาคารธนชาต',
            order: 2,
        },
        {
            name: 'Krungsri',
            type: 'BANK' as const,
            highlight: 'ผ่อนนาน 84 งวด',
            description: 'ธนาคารกรุงศรีอยุธยา',
            order: 3,
        },
        // Insurance
        {
            name: 'วิริยะประกันภัย',
            type: 'INSURANCE' as const,
            highlight: 'เบี้ยต่ำ คุ้มครองสูง',
            description: 'Viriyah Insurance',
            order: 0,
        },
        {
            name: 'เมืองไทยประกันภัย',
            type: 'INSURANCE' as const,
            highlight: 'เคลมง่าย รวดเร็ว',
            description: 'Muang Thai Insurance',
            order: 1,
        },
        {
            name: 'กรุงเทพประกันภัย',
            type: 'INSURANCE' as const,
            highlight: 'ประกันชั้น 1 ราคาพิเศษ',
            description: 'Bangkok Insurance',
            order: 2,
        },
    ];

    for (const partner of servicePartners) {
        await prisma.servicePartner.create({ data: partner });
        console.log(`  ✓ ${partner.name}`);
    }

    // =============================================
    // Seed Admin Settings (idempotent — only insert if missing)
    // =============================================
    console.log('⚙️  Seeding admin settings...');

    const adminSettings: Array<{ key: string; value: unknown }> = [
        { key: 'basicListingRequiresApproval', value: true },
    ];

    for (const s of adminSettings) {
        const existing = await prisma.adminSetting.findUnique({ where: { key: s.key } });
        if (!existing) {
            await prisma.adminSetting.create({
                data: { key: s.key, value: s.value as never },
            });
            console.log(`  ✓ ${s.key} = ${JSON.stringify(s.value)}`);
        } else {
            console.log(`  • ${s.key} (already set, skipped)`);
        }
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
