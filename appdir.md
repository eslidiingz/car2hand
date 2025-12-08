app/
├── page.tsx                  // หน้า Home (/)
├── layout.tsx                // Main Layout (Navbar + Footer)
│
├── buy/                      // หมวดซื้อรถ
│   ├── page.tsx              // หน้ารายการรถ (/buy)
│   ├── [carId]/              // หน้า Detail รถ (/buy/123)
│   │   └── page.tsx
│   └── compare/              // หน้าเปรียบเทียบ (/buy/compare)
│       └── page.tsx
│
├── sell/                     // หมวดขายรถ
│   ├── page.tsx              // หน้า Landing ขายรถ (/sell)
│   ├── estimate/             // หน้าประเมินราคา (/sell/estimate)
│   └── create/               // ฟอร์มลงขาย (/sell/create)
│
├── knowledge/                // หมวดความรู้
│   ├── page.tsx              // หน้าหลัก Wiki (/knowledge)
│   ├── [category]/           // หมวดหมู่บทความ (/knowledge/tips)
│   └── models/               
│       └── [modelId]/        // ข้อมูลรุ่นรถ (/knowledge/models/civic-fc)
│
├── community/                // หมวดชุมชน
│   ├── page.tsx              // หน้าบอร์ดรวม (/community)
│   ├── topic/
│   │   ├── create/           // ตั้งกระทู้ (/community/topic/create)
│   │   └── [topicId]/        // อ่านกระทู้ (/community/topic/456)
│   └── user/
│       └── [userId]/         // ดูโปรไฟล์คนอื่น (/community/user/guru-keng)
│
├── profile/                  // ส่วนจัดการสมาชิก (Protected Route)
│   ├── page.tsx              // Dashboard (/profile)
│   ├── garage/               // รถของฉัน (/profile/garage)
│   ├── listings/             // รถที่ลงขาย (/profile/listings)
│   ├── favorites/            // รถที่ชอบ (/profile/favorites)
│   └── chat/                 // ระบบแชท (/profile/chat)
│
├── services/                 // บริการเสริม
│   ├── inspection/           // (/services/inspection)
│   └── finance/              // (/services/finance)
│
├── (auth)/                   // หน้า Login/Register (Group Route)
│   ├── login/
│   └── register/
│
└── api/                      // Backend API Routes (ถ้าใช้ Next.js Fullstack)
    ├── cars/
    ├── users/
    └── chat/