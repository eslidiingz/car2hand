/**
 * Seed Master Data - ยี่ห้อ รุ่น รุ่นย่อย
 * Run: bun run prisma/seed-master-data.ts
 */

import prisma from '../src/db';

// =============================================
// รถยนต์ยอดนิยมในไทย
// =============================================
const carBrands = [
    // 1. แบรนด์ญี่ปุ่น (เจ้าตลาดเดิม)
    { name: 'Toyota', nameTh: 'โตโยต้า', country: 'Japan', isPopular: true, order: 1, logo: 'http://localhost:9000/brands/cars/Toyota-300x300.png' },
    { name: 'Lexus', nameTh: 'เลกซัส', country: 'Japan', isPopular: false, order: 2, logo: 'http://localhost:9000/brands/cars/Lexus-300x300.png' },
    { name: 'Honda', nameTh: 'ฮอนด้า', country: 'Japan', isPopular: true, order: 3, logo: 'http://localhost:9000/brands/cars/Honda-300x300.png' },
    { name: 'Isuzu', nameTh: 'อีซูซุ', country: 'Japan', isPopular: true, order: 4, logo: 'http://localhost:9000/brands/cars/Isuzu-300x300.png' },
    { name: 'Mitsubishi', nameTh: 'มิตซูบิชิ', country: 'Japan', isPopular: true, order: 5, logo: 'http://localhost:9000/brands/cars/Misubishi-300x300.png' },
    { name: 'Mazda', nameTh: 'มาสด้า', country: 'Japan', isPopular: true, order: 6, logo: 'http://localhost:9000/brands/cars/Mazda-300x300.png' },
    { name: 'Nissan', nameTh: 'นิสสัน', country: 'Japan', isPopular: true, order: 7, logo: 'http://localhost:9000/brands/cars/Nissan-300x300.png' },
    { name: 'Suzuki', nameTh: 'ซูซูกิ', country: 'Japan', isPopular: false, order: 8, logo: 'http://localhost:9000/brands/cars/Suzuki-300x300.png' },
    { name: 'Subaru', nameTh: 'ซูบารุ', country: 'Japan', isPopular: false, order: 9, logo: 'http://localhost:9000/brands/cars/Subaru-300x300.png' },
    { name: 'Daihatsu', nameTh: 'ไดฮัทสุ', country: 'Japan', isPopular: false, order: 10, logo: 'http://localhost:9000/brands/cars/Daihatsu-300x300.png' },
    { name: 'Mitsuoka', nameTh: 'มิตซูโอกะ', country: 'Japan', isPopular: false, order: 11, logo: 'http://localhost:9000/brands/cars/Mitsuoka-300x300.png' },

    // 2. แบรนด์จีน (กลุ่มดาวรุ่งและ EV)
    { name: 'BYD', nameTh: 'บีวายดี', country: 'China', isPopular: true, order: 12, logo: 'http://localhost:9000/brands/cars/BYD-300x300.png' },
    { name: 'GWM', nameTh: 'เกรท วอลล์ มอเตอร์', country: 'China', isPopular: true, order: 13, logo: 'http://localhost:9000/brands/cars/GWM-300x300.png' },
    { name: 'MG', nameTh: 'เอ็มจี', country: 'China', isPopular: true, order: 14, logo: 'http://localhost:9000/brands/cars/MG-300x300.png' },
    { name: 'NETA', nameTh: 'เนต้า', country: 'China', isPopular: true, order: 15, logo: 'http://localhost:9000/brands/cars/Neta-300x300.png' },
    { name: 'Changan', nameTh: 'ฉางอัน', country: 'China', isPopular: false, order: 16, logo: 'http://localhost:9000/brands/cars/Changan-300x300.png' },
    { name: 'Aion', nameTh: 'ไอออน', country: 'China', isPopular: false, order: 17, logo: 'http://localhost:9000/brands/cars/Aion-300x300.png' },
    { name: 'Omoda', nameTh: 'โอโมด้า', country: 'China', isPopular: false, order: 18, logo: 'http://localhost:9000/brands/cars/Omoda-300x300.png' },
    { name: 'Jaecoo', nameTh: 'เจคู่', country: 'China', isPopular: false, order: 19, logo: 'http://localhost:9000/brands/cars/Jaecoo-300x300.png' },
    { name: 'Xpeng', nameTh: 'เอ็กซ์เผิง', country: 'China', isPopular: false, order: 20, logo: 'http://localhost:9000/brands/cars/Xpeng-300x300.png' },
    { name: 'Zeekr', nameTh: 'ซีคเกอร์', country: 'China', isPopular: false, order: 21, logo: 'http://localhost:9000/brands/cars/Zeekr-300x300.png' },
    { name: 'Wuling', nameTh: 'วู่หลิง', country: 'China', isPopular: false, order: 22, logo: 'http://localhost:9000/brands/cars/Wuling-300x300.png' },
    { name: 'Deepal', nameTh: 'ดีพอล', country: 'China', isPopular: false, order: 23, logo: 'http://localhost:9000/brands/cars/Deepal-300x300.png' },
    { name: 'Foton', nameTh: 'โฟตอน', country: 'China', isPopular: false, order: 24, logo: 'http://localhost:9000/brands/cars/Foton-300x300.png' },

    // 3. แบรนด์ยุโรป (กลุ่มหรูหราและสมรรถนะ)
    { name: 'Mercedes-Benz', nameTh: 'เมอร์เซเดส-เบนซ์', country: 'Germany', isPopular: true, order: 25, logo: 'http://localhost:9000/brands/cars/Mercedes-Benz-300x300.png' },
    { name: 'BMW', nameTh: 'บีเอ็มดับเบิลยู', country: 'Germany', isPopular: true, order: 26, logo: 'http://localhost:9000/brands/cars/BMW-300x300.png' },
    { name: 'Audi', nameTh: 'ออดี้', country: 'Germany', isPopular: false, order: 27, logo: 'http://localhost:9000/brands/cars/Audi-300x300.png' },
    { name: 'Mini', nameTh: 'มินิ', country: 'UK', isPopular: false, order: 28, logo: 'http://localhost:9000/brands/cars/Mini-300x300.png' },
    { name: 'Porsche', nameTh: 'ปอร์เช่', country: 'Germany', isPopular: false, order: 29, logo: 'http://localhost:9000/brands/cars/Porsche-300x300.png' },
    { name: 'Peugeot', nameTh: 'เปอโยต์', country: 'France', isPopular: false, order: 30, logo: 'http://localhost:9000/brands/cars/Peugeot-300x300.png' },
    { name: 'Volkswagen', nameTh: 'โฟล์คสวาเกน', country: 'Germany', isPopular: false, order: 31, logo: 'http://localhost:9000/brands/cars/Volkswagen-300x300.png' },
    { name: 'Land Rover', nameTh: 'แลนด์โรเวอร์', country: 'UK', isPopular: false, order: 32, logo: 'http://localhost:9000/brands/cars/Land-Rover-300x300.png' },
    { name: 'Jaguar', nameTh: 'จากัวร์', country: 'UK', isPopular: false, order: 33, logo: 'http://localhost:9000/brands/cars/Jaguar-300x300.png' },
    { name: 'Volvo', nameTh: 'วอลโว่', country: 'Sweden', isPopular: false, order: 34, logo: 'http://localhost:9000/brands/cars/Volvo-300x300.png' },
    { name: 'Alfa Romeo', nameTh: 'อัลฟ่า โรเมโอ', country: 'Italy', isPopular: false, order: 35, logo: 'http://localhost:9000/brands/cars/Alfa-Romeo-300x300.png' },
    { name: 'Citroen', nameTh: 'ซีตรอง', country: 'France', isPopular: false, order: 36, logo: 'http://localhost:9000/brands/cars/Citroen-300x300.png' },
    { name: 'Fiat', nameTh: 'ฟีอัต', country: 'Italy', isPopular: false, order: 37, logo: 'http://localhost:9000/brands/cars/Fiat-300x300.png' },
    { name: 'Seat', nameTh: 'เซียต', country: 'Spain', isPopular: false, order: 38, logo: 'http://localhost:9000/brands/cars/Seat-300x300.png' },

    // 4. แบรนด์อเมริกัน
    { name: 'Ford', nameTh: 'ฟอร์ด', country: 'USA', isPopular: true, order: 39, logo: 'http://localhost:9000/brands/cars/Ford-300x300.png' },
    { name: 'Tesla', nameTh: 'เทสล่า', country: 'USA', isPopular: false, order: 40, logo: 'http://localhost:9000/brands/cars/Tesla-300x300.png' },
    { name: 'Jeep', nameTh: 'จี๊ป', country: 'USA', isPopular: false, order: 41, logo: 'http://localhost:9000/brands/cars/Jeep-300x300.png' },
    { name: 'Chevrolet', nameTh: 'เชฟโรเลต', country: 'USA', isPopular: false, order: 42, logo: 'http://localhost:9000/brands/cars/Chevrolet-300x300.png' },
    { name: 'GMC', nameTh: 'จีเอ็มซี', country: 'USA', isPopular: false, order: 43, logo: 'http://localhost:9000/brands/cars/GMC-300x300.png' },

    // 5. แบรนด์เกาหลี
    { name: 'Hyundai', nameTh: 'ฮุนได', country: 'South Korea', isPopular: false, order: 44, logo: 'http://localhost:9000/brands/cars/Hyundai-300x300.png' },
    { name: 'Kia', nameTh: 'เกีย', country: 'South Korea', isPopular: false, order: 45, logo: 'http://localhost:9000/brands/cars/Kia-300x300.png' },
    { name: 'Ssangyong', nameTh: 'ซันยอง', country: 'South Korea', isPopular: false, order: 46, logo: 'http://localhost:9000/brands/cars/Ssangyong-300x300.png' },

    // 6. แบรนด์ Supercar & Ultra Luxury (มีตัวแทนจำหน่ายทางการ)
    { name: 'Ferrari', nameTh: 'เฟอร์รารี่', country: 'Supercar', isPopular: false, order: 47, logo: 'http://localhost:9000/brands/cars/Ferrari-300x300.png' },
    { name: 'Lamborghini', nameTh: 'แลมโบกินี่', country: 'Supercar', isPopular: false, order: 48, logo: 'http://localhost:9000/brands/cars/Lamborghini-300x300.png' },
    { name: 'Maserati', nameTh: 'มาเซราติ', country: 'Supercar', isPopular: false, order: 49, logo: 'http://localhost:9000/brands/cars/Maserati-300x300.png' },
    { name: 'Bentley', nameTh: 'เบนท์ลีย์', country: 'Supercar', isPopular: false, order: 50, logo: 'http://localhost:9000/brands/cars/Bentley-300x300.png' },
    { name: 'Rolls-Royce', nameTh: 'โรลส์-รอยซ์', country: 'Supercar', isPopular: false, order: 51, logo: 'http://localhost:9000/brands/cars/Rolls-Royce-300x300.png' },
    { name: 'Aston Martin', nameTh: 'แอสตัน มาร์ติน', country: 'Supercar', isPopular: false, order: 52, logo: 'http://localhost:9000/brands/cars/Aston-Martin-300x300.png' },
    { name: 'McLaren', nameTh: 'แม็คลาเรน', country: 'Supercar', isPopular: false, order: 53, logo: 'http://localhost:9000/brands/cars/McLaren-300x300.png' },
    { name: 'Lotus', nameTh: 'โลตัส', country: 'Supercar', isPopular: false, order: 54, logo: 'http://localhost:9000/brands/cars/Lotus-300x300.png' },

    // 7. แบรนด์อื่นๆ
    { name: 'Proton', nameTh: 'โปรตอน', country: 'Malaysia', isPopular: false, order: 55, logo: 'http://localhost:9000/brands/cars/Proton-300x300.png' },
    { name: 'TATA', nameTh: 'ทาทา', country: 'India', isPopular: false, order: 56, logo: 'http://localhost:9000/brands/cars/TATA-300x300.png' },
    { name: 'Thairung', nameTh: 'ไทยรุ่ง', country: 'Thailand', isPopular: false, order: 57, logo: 'http://localhost:9000/brands/cars/Thairung-300x300.png' },
];

// รุ่นรถยนต์ที่ได้รับความนิยม
const carModels: Record<string, { name: string; bodyType: string; isPopular?: boolean }[]> = {
    'Toyota': [
        { name: 'Camry', bodyType: 'SEDAN', isPopular: true },
        { name: 'Corolla Altis', bodyType: 'SEDAN', isPopular: true },
        { name: 'Yaris', bodyType: 'HATCHBACK', isPopular: true },
        { name: 'Yaris Ativ', bodyType: 'SEDAN', isPopular: true },
        { name: 'Vios', bodyType: 'SEDAN', isPopular: true },
        { name: 'C-HR', bodyType: 'SUV', isPopular: true },
        { name: 'Corolla Cross', bodyType: 'SUV', isPopular: true },
        { name: 'Fortuner', bodyType: 'SUV', isPopular: true },
        { name: 'Hilux Revo', bodyType: 'PICKUP', isPopular: true },
        { name: 'Hilux Revo Rocco', bodyType: 'PICKUP', isPopular: true },
        { name: 'Veloz', bodyType: 'MPV' },
        { name: 'Alphard', bodyType: 'MPV' },
        { name: 'Innova', bodyType: 'MPV' },
        { name: 'Sienta', bodyType: 'MPV' },
        { name: 'GR86', bodyType: 'COUPE' },
        { name: 'Supra', bodyType: 'COUPE' },
        { name: 'bZ4X', bodyType: 'SUV' },
    ],
    'Honda': [
        { name: 'Civic', bodyType: 'SEDAN', isPopular: true },
        { name: 'Civic Hatchback', bodyType: 'HATCHBACK', isPopular: true },
        { name: 'Accord', bodyType: 'SEDAN', isPopular: true },
        { name: 'City', bodyType: 'SEDAN', isPopular: true },
        { name: 'City Hatchback', bodyType: 'HATCHBACK', isPopular: true },
        { name: 'Jazz', bodyType: 'HATCHBACK', isPopular: true },
        { name: 'HR-V', bodyType: 'SUV', isPopular: true },
        { name: 'CR-V', bodyType: 'SUV', isPopular: true },
        { name: 'BR-V', bodyType: 'MPV' },
        { name: 'WR-V', bodyType: 'SUV' },
        { name: 'e:N1', bodyType: 'SUV' },
    ],
    'Isuzu': [
        { name: 'D-Max', bodyType: 'PICKUP', isPopular: true },
        { name: 'D-Max Hi-Lander', bodyType: 'PICKUP', isPopular: true },
        { name: 'D-Max V-Cross', bodyType: 'PICKUP', isPopular: true },
        { name: 'MU-X', bodyType: 'SUV', isPopular: true },
    ],
    'Mazda': [
        { name: 'Mazda2', bodyType: 'HATCHBACK', isPopular: true },
        { name: 'Mazda2 Sedan', bodyType: 'SEDAN' },
        { name: 'Mazda3', bodyType: 'HATCHBACK', isPopular: true },
        { name: 'Mazda3 Sedan', bodyType: 'SEDAN' },
        { name: 'CX-3', bodyType: 'SUV' },
        { name: 'CX-30', bodyType: 'SUV', isPopular: true },
        { name: 'CX-5', bodyType: 'SUV', isPopular: true },
        { name: 'CX-8', bodyType: 'SUV' },
        { name: 'CX-60', bodyType: 'SUV' },
        { name: 'BT-50', bodyType: 'PICKUP' },
        { name: 'MX-5', bodyType: 'CONVERTIBLE' },
    ],
    'Mitsubishi': [
        { name: 'Attrage', bodyType: 'SEDAN' },
        { name: 'Mirage', bodyType: 'HATCHBACK' },
        { name: 'Xpander', bodyType: 'MPV', isPopular: true },
        { name: 'Pajero Sport', bodyType: 'SUV', isPopular: true },
        { name: 'Triton', bodyType: 'PICKUP', isPopular: true },
        { name: 'Outlander PHEV', bodyType: 'SUV' },
    ],
    'Nissan': [
        { name: 'Almera', bodyType: 'SEDAN' },
        { name: 'Note', bodyType: 'HATCHBACK' },
        { name: 'Kicks', bodyType: 'SUV', isPopular: true },
        { name: 'X-Trail', bodyType: 'SUV' },
        { name: 'Navara', bodyType: 'PICKUP', isPopular: true },
        { name: 'Terra', bodyType: 'SUV' },
        { name: 'Leaf', bodyType: 'HATCHBACK' },
        { name: 'GT-R', bodyType: 'COUPE' },
    ],
    'BMW': [
        { name: 'Series 1', bodyType: 'HATCHBACK' },
        { name: 'Series 2', bodyType: 'COUPE' },
        { name: 'Series 3', bodyType: 'SEDAN', isPopular: true },
        { name: 'Series 4', bodyType: 'COUPE' },
        { name: 'Series 5', bodyType: 'SEDAN', isPopular: true },
        { name: 'Series 6', bodyType: 'COUPE' },
        { name: 'Series 7', bodyType: 'SEDAN' },
        { name: 'Series 8', bodyType: 'COUPE' },
        { name: 'X1', bodyType: 'SUV', isPopular: true },
        { name: 'X2', bodyType: 'SUV' },
        { name: 'X3', bodyType: 'SUV', isPopular: true },
        { name: 'X4', bodyType: 'SUV' },
        { name: 'X5', bodyType: 'SUV' },
        { name: 'X6', bodyType: 'SUV' },
        { name: 'X7', bodyType: 'SUV' },
        { name: 'XM', bodyType: 'SUV' },
        { name: 'iX', bodyType: 'SUV' },
        { name: 'iX1', bodyType: 'SUV' },
        { name: 'iX2', bodyType: 'SUV' },
        { name: 'iX3', bodyType: 'SUV' },
        { name: 'i4', bodyType: 'SEDAN' },
        { name: 'i5', bodyType: 'SEDAN' },
        { name: 'i7', bodyType: 'SEDAN' },
        { name: 'M2', bodyType: 'COUPE' },
        { name: 'M3', bodyType: 'SEDAN' },
        { name: 'M4', bodyType: 'COUPE' },
        { name: 'M5', bodyType: 'SEDAN' },
        { name: 'M6', bodyType: 'COUPE' },
        { name: 'M8', bodyType: 'COUPE' },
        { name: 'Z4', bodyType: 'CONVERTIBLE' },
    ],
    'Mercedes-Benz': [
        { name: 'A-Class', bodyType: 'HATCHBACK' },
        { name: 'C-Class', bodyType: 'SEDAN', isPopular: true },
        { name: 'E-Class', bodyType: 'SEDAN', isPopular: true },
        { name: 'S-Class', bodyType: 'SEDAN' },
        { name: 'GLA', bodyType: 'SUV' },
        { name: 'GLB', bodyType: 'SUV' },
        { name: 'GLC', bodyType: 'SUV', isPopular: true },
        { name: 'GLE', bodyType: 'SUV' },
        { name: 'GLS', bodyType: 'SUV' },
        { name: 'EQA', bodyType: 'SUV' },
        { name: 'EQB', bodyType: 'SUV' },
        { name: 'EQE', bodyType: 'SEDAN' },
        { name: 'EQS', bodyType: 'SEDAN' },
    ],
    'Ford': [
        { name: 'Ranger', bodyType: 'PICKUP', isPopular: true },
        { name: 'Ranger Raptor', bodyType: 'PICKUP', isPopular: true },
        { name: 'Everest', bodyType: 'SUV', isPopular: true },
        { name: 'Territory', bodyType: 'SUV' },
        { name: 'Mustang', bodyType: 'COUPE' },
    ],
    'MG': [
        { name: 'MG3', bodyType: 'HATCHBACK' },
        { name: 'MG5', bodyType: 'SEDAN', isPopular: true },
        { name: 'MG ZS', bodyType: 'SUV', isPopular: true },
        { name: 'MG HS', bodyType: 'SUV', isPopular: true },
        { name: 'MG4 Electric', bodyType: 'HATCHBACK' },
        { name: 'MG EP', bodyType: 'WAGON' },
        { name: 'MG Extender', bodyType: 'PICKUP' },
    ],
    'BYD': [
        { name: 'Atto 3', bodyType: 'SUV', isPopular: true },
        { name: 'Dolphin', bodyType: 'HATCHBACK', isPopular: true },
        { name: 'Seal', bodyType: 'SEDAN', isPopular: true },
        { name: 'Sealion 6', bodyType: 'SUV' },
        { name: 'Sealion 7', bodyType: 'SUV' },
        { name: 'M6', bodyType: 'MPV' },
        { name: 'D9', bodyType: 'MPV' },
    ],
    'Lexus': [
        { name: 'CT', bodyType: 'HATCHBACK' },
        { name: 'IS', bodyType: 'SEDAN', isPopular: true },
        { name: 'ES', bodyType: 'SEDAN', isPopular: true },
        { name: 'LS', bodyType: 'SEDAN' },
        { name: 'UX', bodyType: 'SUV', isPopular: true },
        { name: 'NX', bodyType: 'SUV', isPopular: true },
        { name: 'RX', bodyType: 'SUV', isPopular: true },
        { name: 'GX', bodyType: 'SUV' },
        { name: 'LX', bodyType: 'SUV' },
        { name: 'LC', bodyType: 'COUPE' },
        { name: 'RC', bodyType: 'COUPE' },
        { name: 'LM', bodyType: 'MPV' },
        { name: 'RZ', bodyType: 'SUV' },
    ],
    'Suzuki': [
        { name: 'Swift', bodyType: 'HATCHBACK', isPopular: true },
        { name: 'Ciaz', bodyType: 'SEDAN', isPopular: true },
        { name: 'Celerio', bodyType: 'HATCHBACK' },
        { name: 'Ertiga', bodyType: 'MPV', isPopular: true },
        { name: 'XL7', bodyType: 'MPV' },
        { name: 'Jimny', bodyType: 'SUV', isPopular: true },
        { name: 'Vitara', bodyType: 'SUV' },
        { name: 'S-Cross', bodyType: 'SUV' },
        { name: 'Carry', bodyType: 'VAN' },
    ],
    'Subaru': [
        { name: 'XV', bodyType: 'SUV', isPopular: true },
        { name: 'Forester', bodyType: 'SUV', isPopular: true },
        { name: 'Outback', bodyType: 'WAGON' },
        { name: 'Crosstrek', bodyType: 'SUV' },
        { name: 'WRX', bodyType: 'SEDAN' },
        { name: 'BRZ', bodyType: 'COUPE' },
        { name: 'Levorg', bodyType: 'WAGON' },
        { name: 'Solterra', bodyType: 'SUV' },
    ],
    'Daihatsu': [
        { name: 'Mira', bodyType: 'HATCHBACK' },
        { name: 'Move', bodyType: 'HATCHBACK' },
        { name: 'Tanto', bodyType: 'HATCHBACK' },
        { name: 'Rocky', bodyType: 'SUV' },
        { name: 'Atrai', bodyType: 'VAN' },
        { name: 'Hijet', bodyType: 'VAN' },
    ],
    'Mitsuoka': [
        { name: 'Himiko', bodyType: 'CONVERTIBLE' },
        { name: 'Rock Star', bodyType: 'CONVERTIBLE' },
        { name: 'Viewt', bodyType: 'SEDAN' },
        { name: 'Galue', bodyType: 'SEDAN' },
        { name: 'Buddy', bodyType: 'SUV' },
    ],
    'GWM': [
        { name: 'ORA Good Cat', bodyType: 'HATCHBACK', isPopular: true },
        { name: 'Haval H6', bodyType: 'SUV', isPopular: true },
        { name: 'Haval Jolion', bodyType: 'SUV', isPopular: true },
        { name: 'Haval H6 HEV', bodyType: 'SUV' },
        { name: 'Tank 300', bodyType: 'SUV' },
        { name: 'Tank 500', bodyType: 'SUV' },
        { name: 'Poer', bodyType: 'PICKUP' },
        { name: 'Poer EV', bodyType: 'PICKUP' },
        { name: 'ORA 03', bodyType: 'HATCHBACK' },
    ],
    'NETA': [
        { name: 'NETA V', bodyType: 'SUV', isPopular: true },
        { name: 'NETA V-II', bodyType: 'SUV', isPopular: true },
        { name: 'NETA X', bodyType: 'SUV' },
    ],
    'Changan': [
        { name: 'CS35 Plus', bodyType: 'SUV' },
        { name: 'CS55 Plus', bodyType: 'SUV', isPopular: true },
        { name: 'CS75 Plus', bodyType: 'SUV', isPopular: true },
        { name: 'Lumin', bodyType: 'HATCHBACK' },
        { name: 'Uni-V', bodyType: 'SEDAN' },
        { name: 'Uni-T', bodyType: 'SUV' },
    ],
    'Aion': [
        { name: 'Aion Y Plus', bodyType: 'SUV', isPopular: true },
        { name: 'Aion V', bodyType: 'SUV' },
        { name: 'Aion S', bodyType: 'SEDAN' },
    ],
    'Omoda': [
        { name: 'Omoda 5', bodyType: 'SUV', isPopular: true },
        { name: 'Omoda 5 EV', bodyType: 'SUV' },
        { name: 'Omoda C5', bodyType: 'SUV' },
    ],
    'Jaecoo': [
        { name: 'Jaecoo 7', bodyType: 'SUV', isPopular: true },
        { name: 'Jaecoo 5', bodyType: 'SUV' },
        { name: 'Jaecoo 6', bodyType: 'SUV' },
    ],
    'Xpeng': [
        { name: 'G6', bodyType: 'SUV', isPopular: true },
        { name: 'G9', bodyType: 'SUV' },
        { name: 'P7', bodyType: 'SEDAN' },
    ],
    'Zeekr': [
        { name: 'Zeekr 001', bodyType: 'WAGON' },
        { name: 'Zeekr 009', bodyType: 'MPV' },
        { name: 'Zeekr X', bodyType: 'SUV', isPopular: true },
    ],
    'Wuling': [
        { name: 'Mini EV', bodyType: 'HATCHBACK', isPopular: true },
        { name: 'Bingo', bodyType: 'HATCHBACK' },
        { name: 'Almaz', bodyType: 'SUV' },
    ],
    'Deepal': [
        { name: 'Deepal S07', bodyType: 'SUV', isPopular: true },
        { name: 'Deepal L07', bodyType: 'SEDAN' },
        { name: 'Deepal G318', bodyType: 'SUV' },
    ],
    'Foton': [
        { name: 'Tunland V', bodyType: 'PICKUP', isPopular: true },
        { name: 'Tunland G', bodyType: 'PICKUP' },
        { name: 'Thunder', bodyType: 'PICKUP' },
    ],
    'Audi': [
        { name: 'A3', bodyType: 'SEDAN' },
        { name: 'A4', bodyType: 'SEDAN', isPopular: true },
        { name: 'A5', bodyType: 'COUPE' },
        { name: 'A6', bodyType: 'SEDAN', isPopular: true },
        { name: 'A7', bodyType: 'SEDAN' },
        { name: 'A8', bodyType: 'SEDAN' },
        { name: 'Q2', bodyType: 'SUV' },
        { name: 'Q3', bodyType: 'SUV', isPopular: true },
        { name: 'Q5', bodyType: 'SUV', isPopular: true },
        { name: 'Q7', bodyType: 'SUV' },
        { name: 'Q8', bodyType: 'SUV' },
        { name: 'e-tron', bodyType: 'SUV' },
        { name: 'e-tron GT', bodyType: 'SEDAN' },
        { name: 'RS3', bodyType: 'SEDAN' },
        { name: 'RS5', bodyType: 'COUPE' },
        { name: 'RS6 Avant', bodyType: 'WAGON' },
        { name: 'RS7', bodyType: 'SEDAN' },
        { name: 'TT', bodyType: 'COUPE' },
        { name: 'R8', bodyType: 'COUPE' },
    ],
    'Mini': [
        { name: 'Cooper', bodyType: 'HATCHBACK', isPopular: true },
        { name: 'Cooper S', bodyType: 'HATCHBACK', isPopular: true },
        { name: 'Cooper SE', bodyType: 'HATCHBACK' },
        { name: 'Countryman', bodyType: 'SUV', isPopular: true },
        { name: 'Countryman SE', bodyType: 'SUV' },
        { name: 'Clubman', bodyType: 'WAGON' },
        { name: 'John Cooper Works', bodyType: 'HATCHBACK' },
    ],
    'Porsche': [
        { name: '911', bodyType: 'COUPE', isPopular: true },
        { name: '718 Cayman', bodyType: 'COUPE' },
        { name: '718 Boxster', bodyType: 'CONVERTIBLE' },
        { name: 'Cayenne', bodyType: 'SUV', isPopular: true },
        { name: 'Macan', bodyType: 'SUV', isPopular: true },
        { name: 'Panamera', bodyType: 'SEDAN' },
        { name: 'Taycan', bodyType: 'SEDAN' },
    ],
    'Peugeot': [
        { name: '208', bodyType: 'HATCHBACK' },
        { name: '2008', bodyType: 'SUV', isPopular: true },
        { name: '3008', bodyType: 'SUV', isPopular: true },
        { name: '5008', bodyType: 'SUV' },
        { name: '308', bodyType: 'HATCHBACK' },
        { name: '408', bodyType: 'SEDAN' },
        { name: '508', bodyType: 'SEDAN' },
    ],
    'Volkswagen': [
        { name: 'Polo', bodyType: 'HATCHBACK' },
        { name: 'Golf', bodyType: 'HATCHBACK', isPopular: true },
        { name: 'Golf GTI', bodyType: 'HATCHBACK' },
        { name: 'Golf R', bodyType: 'HATCHBACK' },
        { name: 'Passat', bodyType: 'SEDAN' },
        { name: 'Arteon', bodyType: 'SEDAN' },
        { name: 'T-Cross', bodyType: 'SUV' },
        { name: 'T-Roc', bodyType: 'SUV' },
        { name: 'Tiguan', bodyType: 'SUV', isPopular: true },
        { name: 'Touareg', bodyType: 'SUV' },
        { name: 'ID.4', bodyType: 'SUV' },
        { name: 'Caravelle', bodyType: 'VAN' },
        { name: 'Amarok', bodyType: 'PICKUP' },
    ],
    'Land Rover': [
        { name: 'Defender', bodyType: 'SUV', isPopular: true },
        { name: 'Discovery', bodyType: 'SUV' },
        { name: 'Discovery Sport', bodyType: 'SUV', isPopular: true },
        { name: 'Range Rover', bodyType: 'SUV', isPopular: true },
        { name: 'Range Rover Sport', bodyType: 'SUV', isPopular: true },
        { name: 'Range Rover Velar', bodyType: 'SUV' },
        { name: 'Range Rover Evoque', bodyType: 'SUV', isPopular: true },
    ],
    'Jaguar': [
        { name: 'XE', bodyType: 'SEDAN' },
        { name: 'XF', bodyType: 'SEDAN', isPopular: true },
        { name: 'F-Pace', bodyType: 'SUV', isPopular: true },
        { name: 'E-Pace', bodyType: 'SUV' },
        { name: 'I-Pace', bodyType: 'SUV' },
        { name: 'F-Type', bodyType: 'COUPE' },
    ],
    'Volvo': [
        { name: 'S60', bodyType: 'SEDAN', isPopular: true },
        { name: 'S90', bodyType: 'SEDAN' },
        { name: 'V60', bodyType: 'WAGON' },
        { name: 'XC40', bodyType: 'SUV', isPopular: true },
        { name: 'XC40 Recharge', bodyType: 'SUV' },
        { name: 'XC60', bodyType: 'SUV', isPopular: true },
        { name: 'XC90', bodyType: 'SUV' },
        { name: 'C40 Recharge', bodyType: 'SUV' },
        { name: 'EX30', bodyType: 'SUV' },
        { name: 'EX90', bodyType: 'SUV' },
    ],
    'Alfa Romeo': [
        { name: 'Giulia', bodyType: 'SEDAN', isPopular: true },
        { name: 'Stelvio', bodyType: 'SUV', isPopular: true },
        { name: 'Tonale', bodyType: 'SUV' },
    ],
    'Citroen': [
        { name: 'C3', bodyType: 'HATCHBACK' },
        { name: 'C3 Aircross', bodyType: 'SUV' },
        { name: 'C5 Aircross', bodyType: 'SUV', isPopular: true },
        { name: 'C5 X', bodyType: 'SEDAN' },
    ],
    'Fiat': [
        { name: '500', bodyType: 'HATCHBACK', isPopular: true },
        { name: '500e', bodyType: 'HATCHBACK' },
        { name: '500X', bodyType: 'SUV' },
    ],
    'Seat': [
        { name: 'Ibiza', bodyType: 'HATCHBACK' },
        { name: 'Leon', bodyType: 'HATCHBACK', isPopular: true },
        { name: 'Arona', bodyType: 'SUV' },
        { name: 'Ateca', bodyType: 'SUV' },
    ],
    'Tesla': [
        { name: 'Model 3', bodyType: 'SEDAN', isPopular: true },
        { name: 'Model Y', bodyType: 'SUV', isPopular: true },
        { name: 'Model S', bodyType: 'SEDAN' },
        { name: 'Model X', bodyType: 'SUV' },
        { name: 'Cybertruck', bodyType: 'PICKUP' },
    ],
    'Jeep': [
        { name: 'Wrangler', bodyType: 'SUV', isPopular: true },
        { name: 'Gladiator', bodyType: 'PICKUP' },
        { name: 'Grand Cherokee', bodyType: 'SUV', isPopular: true },
        { name: 'Cherokee', bodyType: 'SUV' },
        { name: 'Compass', bodyType: 'SUV' },
        { name: 'Renegade', bodyType: 'SUV' },
        { name: 'Avenger', bodyType: 'SUV' },
    ],
    'Chevrolet': [
        { name: 'Colorado', bodyType: 'PICKUP', isPopular: true },
        { name: 'Trailblazer', bodyType: 'SUV', isPopular: true },
        { name: 'Captiva', bodyType: 'SUV' },
        { name: 'Corvette', bodyType: 'COUPE' },
        { name: 'Camaro', bodyType: 'COUPE' },
        { name: 'Bolt EV', bodyType: 'HATCHBACK' },
    ],
    'GMC': [
        { name: 'Sierra', bodyType: 'PICKUP' },
        { name: 'Canyon', bodyType: 'PICKUP' },
        { name: 'Yukon', bodyType: 'SUV' },
        { name: 'Terrain', bodyType: 'SUV' },
        { name: 'Hummer EV', bodyType: 'PICKUP' },
    ],
    'Hyundai': [
        { name: 'Accent', bodyType: 'SEDAN' },
        { name: 'Elantra', bodyType: 'SEDAN', isPopular: true },
        { name: 'Sonata', bodyType: 'SEDAN' },
        { name: 'Venue', bodyType: 'SUV' },
        { name: 'Kona', bodyType: 'SUV', isPopular: true },
        { name: 'Kona Electric', bodyType: 'SUV' },
        { name: 'Tucson', bodyType: 'SUV', isPopular: true },
        { name: 'Santa Fe', bodyType: 'SUV', isPopular: true },
        { name: 'Palisade', bodyType: 'SUV' },
        { name: 'Creta', bodyType: 'SUV', isPopular: true },
        { name: 'Stargazer', bodyType: 'MPV' },
        { name: 'Staria', bodyType: 'MPV' },
        { name: 'Ioniq 5', bodyType: 'SUV' },
        { name: 'Ioniq 6', bodyType: 'SEDAN' },
        { name: 'H-1', bodyType: 'VAN' },
    ],
    'Kia': [
        { name: 'Morning', bodyType: 'HATCHBACK' },
        { name: 'Rio', bodyType: 'SEDAN' },
        { name: 'Cerato', bodyType: 'SEDAN', isPopular: true },
        { name: 'K3', bodyType: 'SEDAN' },
        { name: 'K5', bodyType: 'SEDAN' },
        { name: 'Seltos', bodyType: 'SUV', isPopular: true },
        { name: 'Sportage', bodyType: 'SUV', isPopular: true },
        { name: 'Sorento', bodyType: 'SUV', isPopular: true },
        { name: 'Carnival', bodyType: 'MPV' },
        { name: 'EV6', bodyType: 'SUV' },
        { name: 'EV9', bodyType: 'SUV' },
        { name: 'Sonet', bodyType: 'SUV' },
        { name: 'Stinger', bodyType: 'SEDAN' },
    ],
    'Ssangyong': [
        { name: 'Tivoli', bodyType: 'SUV', isPopular: true },
        { name: 'Korando', bodyType: 'SUV' },
        { name: 'Rexton', bodyType: 'SUV', isPopular: true },
        { name: 'Musso', bodyType: 'PICKUP' },
        { name: 'Torres', bodyType: 'SUV' },
    ],
    'Ferrari': [
        { name: '296 GTB', bodyType: 'COUPE' },
        { name: '296 GTS', bodyType: 'CONVERTIBLE' },
        { name: 'Roma', bodyType: 'COUPE', isPopular: true },
        { name: 'Roma Spider', bodyType: 'CONVERTIBLE' },
        { name: 'SF90 Stradale', bodyType: 'COUPE' },
        { name: '812 Competizione', bodyType: 'COUPE' },
        { name: 'Purosangue', bodyType: 'SUV', isPopular: true },
        { name: 'F8 Tributo', bodyType: 'COUPE' },
        { name: '488', bodyType: 'COUPE' },
        { name: 'Portofino M', bodyType: 'CONVERTIBLE' },
    ],
    'Lamborghini': [
        { name: 'Huracan', bodyType: 'COUPE', isPopular: true },
        { name: 'Huracan Spyder', bodyType: 'CONVERTIBLE' },
        { name: 'Revuelto', bodyType: 'COUPE' },
        { name: 'Urus', bodyType: 'SUV', isPopular: true },
        { name: 'Urus SE', bodyType: 'SUV' },
    ],
    'Maserati': [
        { name: 'Ghibli', bodyType: 'SEDAN', isPopular: true },
        { name: 'Quattroporte', bodyType: 'SEDAN' },
        { name: 'Levante', bodyType: 'SUV', isPopular: true },
        { name: 'MC20', bodyType: 'COUPE' },
        { name: 'Grecale', bodyType: 'SUV' },
        { name: 'GranTurismo', bodyType: 'COUPE' },
    ],
    'Bentley': [
        { name: 'Continental GT', bodyType: 'COUPE', isPopular: true },
        { name: 'Continental GTC', bodyType: 'CONVERTIBLE' },
        { name: 'Flying Spur', bodyType: 'SEDAN', isPopular: true },
        { name: 'Bentayga', bodyType: 'SUV', isPopular: true },
    ],
    'Rolls-Royce': [
        { name: 'Ghost', bodyType: 'SEDAN', isPopular: true },
        { name: 'Phantom', bodyType: 'SEDAN' },
        { name: 'Wraith', bodyType: 'COUPE' },
        { name: 'Dawn', bodyType: 'CONVERTIBLE' },
        { name: 'Cullinan', bodyType: 'SUV', isPopular: true },
        { name: 'Spectre', bodyType: 'COUPE' },
    ],
    'Aston Martin': [
        { name: 'Vantage', bodyType: 'COUPE', isPopular: true },
        { name: 'DB11', bodyType: 'COUPE' },
        { name: 'DB12', bodyType: 'COUPE', isPopular: true },
        { name: 'DBS', bodyType: 'COUPE' },
        { name: 'DBX', bodyType: 'SUV', isPopular: true },
    ],
    'McLaren': [
        { name: '720S', bodyType: 'COUPE', isPopular: true },
        { name: '750S', bodyType: 'COUPE' },
        { name: 'Artura', bodyType: 'COUPE', isPopular: true },
        { name: 'GT', bodyType: 'COUPE' },
        { name: '765LT', bodyType: 'COUPE' },
    ],
    'Lotus': [
        { name: 'Emira', bodyType: 'COUPE', isPopular: true },
        { name: 'Eletre', bodyType: 'SUV', isPopular: true },
        { name: 'Emeya', bodyType: 'SEDAN' },
        { name: 'Evija', bodyType: 'COUPE' },
    ],
    'Proton': [
        { name: 'Saga', bodyType: 'SEDAN', isPopular: true },
        { name: 'Persona', bodyType: 'SEDAN' },
        { name: 'Iriz', bodyType: 'HATCHBACK' },
        { name: 'X50', bodyType: 'SUV', isPopular: true },
        { name: 'X70', bodyType: 'SUV' },
        { name: 'X90', bodyType: 'SUV' },
        { name: 'Exora', bodyType: 'MPV' },
    ],
    'TATA': [
        { name: 'Nexon', bodyType: 'SUV', isPopular: true },
        { name: 'Harrier', bodyType: 'SUV' },
        { name: 'Safari', bodyType: 'SUV' },
        { name: 'Punch', bodyType: 'SUV' },
    ],
    'Thairung': [
        { name: 'TR Transformer II', bodyType: 'SUV', isPopular: true },
        { name: 'TR Adventure', bodyType: 'SUV' },
    ],
};

// รุ่นย่อยสำหรับรุ่นยอดนิยม
const carSubModels: Record<string, { name: string; engineSize?: number; fuelType?: string; transmission?: string }[]> = {
    'Civic': [
        { name: '1.5 Turbo', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 Turbo RS', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '2.0 e:HEV', engineSize: 2000, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: '2.0 e:HEV RS', engineSize: 2000, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: 'Type R', engineSize: 2000, fuelType: 'PETROL', transmission: 'MANUAL' },
    ],
    'Camry': [
        { name: '2.0 G', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.5 HV', engineSize: 2500, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: '2.5 HV Premium', engineSize: 2500, fuelType: 'HYBRID', transmission: 'CVT' },
    ],
    'Corolla Cross': [
        { name: '1.8 Sport', engineSize: 1800, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.8 HV Smart', engineSize: 1800, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: '1.8 HV Premium', engineSize: 1800, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: '1.8 HV Premium Safety', engineSize: 1800, fuelType: 'HYBRID', transmission: 'CVT' },
    ],
    'Fortuner': [
        { name: '2.4 G', engineSize: 2400, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.4 V', engineSize: 2400, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.8 GR Sport', engineSize: 2800, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.8 Legender', engineSize: 2800, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'HR-V': [
        { name: '1.5 S', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 E', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 EL', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: 'e:HEV RS', engineSize: 1500, fuelType: 'HYBRID', transmission: 'CVT' },
    ],
    'CR-V': [
        { name: '2.0 S', engineSize: 2000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '2.0 E', engineSize: 2000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: 'e:HEV EL', engineSize: 2000, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: 'e:HEV RS', engineSize: 2000, fuelType: 'HYBRID', transmission: 'CVT' },
    ],
    'Ranger': [
        { name: '2.0 XL', engineSize: 2000, fuelType: 'DIESEL', transmission: 'MANUAL' },
        { name: '2.0 XL+', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.0 XLT', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.0 Bi-Turbo Wildtrak', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '3.0 V6 Wildtrak', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'Series 3': [
        { name: '320d Sport', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '320d M Sport', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '330e M Sport', engineSize: 2000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: '330i M Sport', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'M340i xDrive', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Series 5': [
        { name: '520d Sport', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '520d M Sport', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '530e M Sport', engineSize: 2000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: '530i M Sport', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    // === Toyota เพิ่มเติม ===
    'Corolla Altis': [
        { name: '1.6 G', engineSize: 1600, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.8 Sport', engineSize: 1800, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.8 HV Smart', engineSize: 1800, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: '1.8 HV Premium', engineSize: 1800, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: 'GR Sport', engineSize: 1800, fuelType: 'HYBRID', transmission: 'CVT' },
    ],
    'Yaris': [
        { name: '1.2 Sport', engineSize: 1200, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.2 Sport Premium', engineSize: 1200, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Yaris Ativ': [
        { name: '1.2 Sport', engineSize: 1200, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.2 Sport Premium', engineSize: 1200, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Vios': [
        { name: '1.5 J', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 E', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 G', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'C-HR': [
        { name: '1.8 Entry', engineSize: 1800, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.8 Mid', engineSize: 1800, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.8 HV Mid', engineSize: 1800, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: '1.8 HV Hi', engineSize: 1800, fuelType: 'HYBRID', transmission: 'CVT' },
    ],
    'Hilux Revo': [
        { name: '2.4 J', engineSize: 2400, fuelType: 'DIESEL', transmission: 'MANUAL' },
        { name: '2.4 J Plus', engineSize: 2400, fuelType: 'DIESEL', transmission: 'MANUAL' },
        { name: '2.4 Entry', engineSize: 2400, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.4 E', engineSize: 2400, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.4 G', engineSize: 2400, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.8 Prerunner', engineSize: 2800, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.8 4x4', engineSize: 2800, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'Alphard': [
        { name: '2.5 HV', engineSize: 2500, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: '2.5 HV Executive Lounge', engineSize: 2500, fuelType: 'HYBRID', transmission: 'CVT' },
    ],
    'Veloz': [
        { name: '1.5 Smart', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 Premium', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Innova': [
        { name: '2.0 Entry', engineSize: 2000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '2.0 Smart', engineSize: 2000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '2.0 HV Smart', engineSize: 2000, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: '2.0 HV Premium', engineSize: 2000, fuelType: 'HYBRID', transmission: 'CVT' },
    ],
    'bZ4X': [
        { name: 'FWD', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'AWD', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    // === Honda เพิ่มเติม ===
    'Accord': [
        { name: '1.5 Turbo', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 Turbo EL', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '2.0 e:HEV EL', engineSize: 2000, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: '2.0 e:HEV Tech', engineSize: 2000, fuelType: 'HYBRID', transmission: 'CVT' },
    ],
    'City': [
        { name: '1.0 Turbo SV', engineSize: 1000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.0 Turbo S+', engineSize: 1000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.0 Turbo RS', engineSize: 1000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: 'e:HEV SV', engineSize: 1500, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: 'e:HEV RS', engineSize: 1500, fuelType: 'HYBRID', transmission: 'CVT' },
    ],
    'City Hatchback': [
        { name: '1.0 Turbo SV', engineSize: 1000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.0 Turbo S+', engineSize: 1000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.0 Turbo RS', engineSize: 1000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: 'e:HEV RS', engineSize: 1500, fuelType: 'HYBRID', transmission: 'CVT' },
    ],
    'BR-V': [
        { name: '1.5 S', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 E', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 EL', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'WR-V': [
        { name: '1.5 SV', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 S+', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 RS', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    // === Isuzu ===
    'D-Max': [
        { name: '1.9 S', engineSize: 1900, fuelType: 'DIESEL', transmission: 'MANUAL' },
        { name: '1.9 L', engineSize: 1900, fuelType: 'DIESEL', transmission: 'MANUAL' },
        { name: '1.9 Hi-Lander', engineSize: 1900, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '3.0 V-Cross', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '3.0 V-Cross 4x4', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'MU-X': [
        { name: '1.9 Active', engineSize: 1900, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '1.9 Elegant', engineSize: 1900, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '3.0 Ultimate', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '3.0 Ultimate 4x4', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    // === Mazda ===
    'Mazda2': [
        { name: '1.3 C', engineSize: 1300, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.3 S', engineSize: 1300, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.3 SP', engineSize: 1300, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.3 SP Sports', engineSize: 1300, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Mazda3': [
        { name: '2.0 C', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0 S', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0 SP', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0 SP Sports', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'CX-30': [
        { name: '2.0 C', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0 S', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0 SP', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'e-Skyactiv X', engineSize: 2000, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
    ],
    'CX-5': [
        { name: '2.0 C', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0 S', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0 SP', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.2 XDL', engineSize: 2200, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'BT-50': [
        { name: '1.9 S', engineSize: 1900, fuelType: 'DIESEL', transmission: 'MANUAL' },
        { name: '1.9 Hi-Racer', engineSize: 1900, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '3.0 SP', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '3.0 SP 4x4', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    // === Mitsubishi ===
    'Xpander': [
        { name: '1.5 GT', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 GLS-LTD', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 GLS', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: 'HEV', engineSize: 1500, fuelType: 'HYBRID', transmission: 'CVT' },
    ],
    'Pajero Sport': [
        { name: '2.4 GT', engineSize: 2400, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.4 GT Premium', engineSize: 2400, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.4 GT Premium 4WD', engineSize: 2400, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'Triton': [
        { name: '2.4 GLX', engineSize: 2400, fuelType: 'DIESEL', transmission: 'MANUAL' },
        { name: '2.4 GLS', engineSize: 2400, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.4 GT', engineSize: 2400, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.4 GT Premium', engineSize: 2400, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.4 GT Premium 4WD', engineSize: 2400, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    // === Nissan ===
    'Almera': [
        { name: '1.0 Turbo S', engineSize: 1000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.0 Turbo E', engineSize: 1000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.0 Turbo EL', engineSize: 1000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.0 Turbo VL', engineSize: 1000, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Kicks': [
        { name: 'S', engineSize: 1200, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
        { name: 'E', engineSize: 1200, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
        { name: 'VL', engineSize: 1200, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Navara': [
        { name: '2.3 S', engineSize: 2300, fuelType: 'DIESEL', transmission: 'MANUAL' },
        { name: '2.3 E', engineSize: 2300, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.3 V', engineSize: 2300, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.3 Calibre V', engineSize: 2300, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.3 PRO-4X', engineSize: 2300, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    // === Ford เพิ่มเติม ===
    'Ranger Raptor': [
        { name: '2.0 Bi-Turbo', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '3.0 V6 EcoBoost', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Everest': [
        { name: '2.0 Turbo Trend', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.0 Turbo Sport', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.0 Bi-Turbo Titanium+', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '3.0 V6 Wildtrak 4WD', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    // === MG ===
    'MG5': [
        { name: '1.5 D', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 X', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'MG ZS': [
        { name: '1.5 D', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 X', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: 'EV', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'MG HS': [
        { name: '1.5 D', engineSize: 1500, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '1.5 X', engineSize: 1500, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'PHEV', engineSize: 1500, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'MG4 Electric': [
        { name: 'Standard Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'XPower', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    // === BYD ===
    'Atto 3': [
        { name: 'Standard Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Extended Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Dolphin': [
        { name: 'Standard Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Extended Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Premium', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Seal': [
        { name: 'Dynamic', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Premium', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Performance', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    // === Mercedes-Benz ===
    'C-Class': [
        { name: 'C200 Avantgarde', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'C220d AMG Dynamic', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'C300e AMG Dynamic', engineSize: 2000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'AMG C43', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'AMG C63 S', engineSize: 2000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'E-Class': [
        { name: 'E220d Avantgarde', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'E220d AMG Dynamic', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'E350e AMG Dynamic', engineSize: 2000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'AMG E53', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'GLC': [
        { name: 'GLC200 AMG Dynamic', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'GLC220d AMG Dynamic', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'GLC300e AMG Dynamic', engineSize: 2000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'AMG GLC43', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    // === Lexus ===
    'IS': [
        { name: 'IS300h Grand Luxury', engineSize: 2500, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: 'IS300h Luxury', engineSize: 2500, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: 'IS300h Premium', engineSize: 2500, fuelType: 'HYBRID', transmission: 'CVT' },
    ],
    'ES': [
        { name: 'ES300h Luxury', engineSize: 2500, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: 'ES300h Grand Luxury', engineSize: 2500, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: 'ES300h Premium', engineSize: 2500, fuelType: 'HYBRID', transmission: 'CVT' },
    ],
    'NX': [
        { name: 'NX350h Grand Luxury', engineSize: 2500, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: 'NX350h F Sport', engineSize: 2500, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: 'NX450h+ F Sport', engineSize: 2500, fuelType: 'PLUGIN_HYBRID', transmission: 'CVT' },
    ],
    'RX': [
        { name: 'RX350h Luxury', engineSize: 2500, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: 'RX350h Grand Luxury', engineSize: 2500, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: 'RX350h F Sport', engineSize: 2500, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: 'RX500h F Sport Performance', engineSize: 2400, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
    ],
    'UX': [
        { name: 'UX250h Grand Luxury', engineSize: 2000, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: 'UX250h Luxury', engineSize: 2000, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: 'UX300e', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    // === BMW เพิ่มเติม ===
    'X1': [
        { name: 'sDrive18i xLine', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'sDrive18d M Sport', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'xDrive30e M Sport', engineSize: 1500, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'X3': [
        { name: 'xDrive20d xLine', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'xDrive20d M Sport', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'xDrive30e M Sport', engineSize: 2000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'M40i', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'X5': [
        { name: 'xDrive30d M Sport', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'xDrive45e M Sport', engineSize: 3000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'M50i', engineSize: 4400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    // === Audi ===
    'A4': [
        { name: '35 TFSI', engineSize: 1400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '40 TFSI Quattro', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '45 TFSI Quattro S line', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'A6': [
        { name: '45 TFSI Quattro S line', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '55 TFSI Quattro S line', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Q3': [
        { name: '35 TFSI', engineSize: 1400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '35 TFSI S line', engineSize: 1400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Q5': [
        { name: '40 TDI Quattro', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '45 TFSI Quattro S line', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '55 TFSI e Quattro S line', engineSize: 2000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    // === Volvo ===
    'S60': [
        { name: 'B3 Plus', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'B5 R-Design', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'T8 Recharge', engineSize: 2000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'XC40': [
        { name: 'B3', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'B4 R-Design', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Recharge Pure Electric', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'XC60': [
        { name: 'B5 Momentum', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'B5 R-Design', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'T8 Recharge', engineSize: 2000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    // === Suzuki ===
    'Swift': [
        { name: '1.2 GL', engineSize: 1200, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.2 GLX', engineSize: 1200, fuelType: 'PETROL', transmission: 'CVT' },
        { name: 'Sport', engineSize: 1400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Ciaz': [
        { name: '1.2 GL', engineSize: 1200, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.2 GLX', engineSize: 1200, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.2 RS', engineSize: 1200, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Ertiga': [
        { name: '1.5 GL', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.5 GX', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.5 RS', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Jimny': [
        { name: '1.5 GL', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.5 GLX', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    // === GWM ===
    'ORA Good Cat': [
        { name: '400 Tech', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: '400 Pro', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: '500 Ultra', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: '500 GT', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Haval H6': [
        { name: 'HEV', engineSize: 1500, fuelType: 'HYBRID', transmission: 'DCT' },
        { name: 'HEV Ultra', engineSize: 1500, fuelType: 'HYBRID', transmission: 'DCT' },
        { name: 'PHEV', engineSize: 1500, fuelType: 'PLUGIN_HYBRID', transmission: 'DCT' },
    ],
    'Haval Jolion': [
        { name: 'HEV', engineSize: 1500, fuelType: 'HYBRID', transmission: 'DCT' },
        { name: 'HEV Ultra', engineSize: 1500, fuelType: 'HYBRID', transmission: 'DCT' },
    ],
    // === Hyundai ===
    'Creta': [
        { name: '1.5 Smart', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 Premium', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Tucson': [
        { name: '1.6 Turbo Smart', engineSize: 1600, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '1.6 Turbo Premium', engineSize: 1600, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '1.6 Turbo HEV', engineSize: 1600, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Santa Fe': [
        { name: '2.5 Smart', engineSize: 2500, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '2.5 Premium', engineSize: 2500, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '1.6 HEV', engineSize: 1600, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
    ],
    // === Kia ===
    'Seltos': [
        { name: '1.5 Smart', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 Premium', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Sportage': [
        { name: '1.6 Turbo GT-Line', engineSize: 1600, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '1.6 Turbo HEV', engineSize: 1600, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Sorento': [
        { name: '2.5 Smart', engineSize: 2500, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '2.5 Premium', engineSize: 2500, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '1.6 HEV', engineSize: 1600, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
    ],
    // === Chevrolet ===
    'Colorado': [
        { name: '2.5 LS', engineSize: 2500, fuelType: 'DIESEL', transmission: 'MANUAL' },
        { name: '2.5 LT', engineSize: 2500, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.5 LTZ', engineSize: 2500, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.5 High Country', engineSize: 2500, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'Trailblazer': [
        { name: '2.5 LT', engineSize: 2500, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.5 LTZ', engineSize: 2500, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.5 Premier', engineSize: 2500, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    // === Tesla ===
    'Model 3': [
        { name: 'Standard Range Plus', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Performance', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Model Y': [
        { name: 'Standard Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Performance', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    // === Porsche ===
    '911': [
        { name: 'Carrera', engineSize: 3000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'Carrera S', engineSize: 3000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'Carrera 4S', engineSize: 3000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'Turbo', engineSize: 3800, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'Turbo S', engineSize: 3800, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'GT3', engineSize: 4000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'GT3 RS', engineSize: 4000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Cayenne': [
        { name: 'Cayenne', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Cayenne S', engineSize: 2900, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Cayenne E-Hybrid', engineSize: 3000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'Cayenne Turbo GT', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Macan': [
        { name: 'Macan', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'Macan S', engineSize: 2900, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'Macan GTS', engineSize: 2900, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'Macan Electric', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    // === Land Rover ===
    'Defender': [
        { name: '90 D250', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '110 D250', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '110 P400', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '110 V8', engineSize: 5000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Range Rover': [
        { name: 'D350 Autobiography', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'P530 First Edition', engineSize: 4400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'P440e Autobiography', engineSize: 3000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Range Rover Sport': [
        { name: 'D250 S', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'D350 Autobiography Dynamic', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'P440e Dynamic SE', engineSize: 3000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'P530 First Edition', engineSize: 4400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Range Rover Evoque': [
        { name: 'P200 S', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'P250 R-Dynamic SE', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    // === Mini ===
    'Cooper': [
        { name: 'Cooper Classic', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Cooper Exclusive', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Cooper S': [
        { name: 'Cooper S Classic', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Cooper S Exclusive', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Countryman': [
        { name: 'Cooper Classic', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Cooper S Exclusive', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Cooper SE', engineSize: 1500, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    // === NETA ===
    'NETA V': [
        { name: 'Standard Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'NETA V-II': [
        { name: 'Standard Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
};

// =============================================
// มอเตอร์ไซค์ยอดนิยมในไทย
// =============================================
const motorcycleBrands = [
    { name: 'Honda', nameTh: 'ฮอนด้า', country: 'Japan', isPopular: true, order: 1, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/honda.png' },
    { name: 'Yamaha', nameTh: 'ยามาฮ่า', country: 'Japan', isPopular: true, order: 2, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Yamaha_Motor_Logo_%28full%29.svg/500px-Yamaha_Motor_Logo_%28full%29.svg.png' },
    { name: 'Kawasaki', nameTh: 'คาวาซากิ', country: 'Japan', isPopular: true, order: 3, logo: 'https://images.seeklogo.com/logo-png/23/1/kawasaki-logo-png_seeklogo-236008.png' },
    { name: 'Suzuki', nameTh: 'ซูซูกิ', country: 'Japan', isPopular: true, order: 4, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/suzuki.png' },
    { name: 'GPX', nameTh: 'จีพีเอ็กซ์', country: 'Thailand', isPopular: true, order: 5, logo: 'https://gpxthailand.com/wp-content/uploads/2021/12/logo-GPX-Gray.png' },
    { name: 'Vespa', nameTh: 'เวสป้า', country: 'Italy', isPopular: false, order: 6, logo: 'https://images.seeklogo.com/logo-png/14/1/vespa-logo-png_seeklogo-148461.png' },
    { name: 'Ducati', nameTh: 'ดูคาติ', country: 'Italy', isPopular: false, order: 7, logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Ducati_red_logo.svg' },
    { name: 'BMW Motorrad', nameTh: 'บีเอ็มดับเบิลยู มอเตอร์ราด', country: 'Germany', isPopular: false, order: 8, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/bmw.png' },
    { name: 'Harley-Davidson', nameTh: 'ฮาร์เลย์-เดวิดสัน', country: 'USA', isPopular: false, order: 9, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Harley-Davidson_logo.svg/500px-Harley-Davidson_logo.svg.png' },
    { name: 'KTM', nameTh: 'เคทีเอ็ม', country: 'Austria', isPopular: false, order: 10, logo: 'https://images.seeklogo.com/logo-png/20/1/ktm-logo-png_seeklogo-209726.png' },
    { name: 'Royal Enfield', nameTh: 'รอยัล เอนฟิลด์', country: 'India', isPopular: false, order: 11, logo: 'https://images.seeklogo.com/logo-png/42/1/royal-enfield-logo-png_seeklogo-425859.png' },
    { name: 'Benelli', nameTh: 'เบเนลลี่', country: 'Italy', isPopular: false, order: 12, logo: 'https://images.seeklogo.com/logo-png/1/1/benelli-logo-png_seeklogo-18338.png' },
    { name: 'Triumph', nameTh: 'ไทรอัมพ์', country: 'UK', isPopular: false, order: 13, logo: 'https://images.seeklogo.com/logo-png/19/1/triumph-logo-png_seeklogo-192849.png' },
];

const motorcycleModels: Record<string, { name: string; bodyType: string; isPopular?: boolean }[]> = {
    'Honda': [
        { name: 'Wave 110i', bodyType: 'UNDERBONE', isPopular: true },
        { name: 'Wave 125i', bodyType: 'UNDERBONE', isPopular: true },
        { name: 'Click 125i', bodyType: 'SCOOTER', isPopular: true },
        { name: 'Click 160', bodyType: 'SCOOTER', isPopular: true },
        { name: 'Scoopy i', bodyType: 'SCOOTER', isPopular: true },
        { name: 'PCX 160', bodyType: 'SCOOTER', isPopular: true },
        { name: 'ADV 160', bodyType: 'SCOOTER', isPopular: true },
        { name: 'Forza 350', bodyType: 'SCOOTER' },
        { name: 'Rebel 500', bodyType: 'CRUISER' },
        { name: 'CB150R', bodyType: 'NAKED' },
        { name: 'CB300R', bodyType: 'NAKED' },
        { name: 'CB500F', bodyType: 'NAKED' },
        { name: 'CBR150R', bodyType: 'SPORT', isPopular: true },
        { name: 'CBR250RR', bodyType: 'SPORT' },
        { name: 'CBR500R', bodyType: 'SPORT' },
        { name: 'CBR650R', bodyType: 'SPORT' },
        { name: 'CBR1000RR-R', bodyType: 'SPORT' },
        { name: 'CRF250L', bodyType: 'ADVENTURE' },
        { name: 'CRF300L', bodyType: 'ADVENTURE' },
        { name: 'Africa Twin', bodyType: 'ADVENTURE' },
    ],
    'Yamaha': [
        { name: 'Finn', bodyType: 'UNDERBONE' },
        { name: 'Finn UBS', bodyType: 'UNDERBONE' },
        { name: 'Mio', bodyType: 'SCOOTER', isPopular: true },
        { name: 'Grand Filano', bodyType: 'SCOOTER', isPopular: true },
        { name: 'NMAX', bodyType: 'SCOOTER', isPopular: true },
        { name: 'XMAX', bodyType: 'SCOOTER', isPopular: true },
        { name: 'TMAX', bodyType: 'SCOOTER' },
        { name: 'YZF-R15', bodyType: 'SPORT', isPopular: true },
        { name: 'YZF-R3', bodyType: 'SPORT' },
        { name: 'YZF-R6', bodyType: 'SPORT' },
        { name: 'YZF-R1', bodyType: 'SPORT' },
        { name: 'MT-03', bodyType: 'NAKED' },
        { name: 'MT-07', bodyType: 'NAKED' },
        { name: 'MT-09', bodyType: 'NAKED' },
        { name: 'XSR155', bodyType: 'CAFE_RACER' },
        { name: 'XSR700', bodyType: 'CAFE_RACER' },
        { name: 'Tenere 700', bodyType: 'ADVENTURE' },
        { name: 'WR155R', bodyType: 'DIRT' },
    ],
    'Kawasaki': [
        { name: 'Z125', bodyType: 'NAKED' },
        { name: 'Z400', bodyType: 'NAKED', isPopular: true },
        { name: 'Z650', bodyType: 'NAKED' },
        { name: 'Z900', bodyType: 'NAKED' },
        { name: 'Z H2', bodyType: 'NAKED' },
        { name: 'Ninja 250', bodyType: 'SPORT' },
        { name: 'Ninja 400', bodyType: 'SPORT', isPopular: true },
        { name: 'Ninja 650', bodyType: 'SPORT' },
        { name: 'Ninja ZX-6R', bodyType: 'SPORT' },
        { name: 'Ninja ZX-10R', bodyType: 'SPORT' },
        { name: 'Versys 650', bodyType: 'ADVENTURE' },
        { name: 'Versys 1000', bodyType: 'ADVENTURE' },
        { name: 'Vulcan S', bodyType: 'CRUISER', isPopular: true },
        { name: 'W175', bodyType: 'CUB' },
        { name: 'W800', bodyType: 'CUB' },
        { name: 'KLX 150', bodyType: 'DIRT' },
        { name: 'KLX 250', bodyType: 'DIRT' },
    ],
    'GPX': [
        { name: 'Demon 125', bodyType: 'NAKED' },
        { name: 'Demon 150 GR', bodyType: 'SPORT', isPopular: true },
        { name: 'Demon 150 GN', bodyType: 'NAKED' },
        { name: 'Legend 150', bodyType: 'CUB' },
        { name: 'Legend 200', bodyType: 'CUB', isPopular: true },
        { name: 'Gentleman 200', bodyType: 'CAFE_RACER' },
        { name: 'Popz 110', bodyType: 'UNDERBONE' },
        { name: 'MAD 300', bodyType: 'NAKED' },
        { name: 'Drone 150', bodyType: 'NAKED' },
        { name: 'GR200R', bodyType: 'SPORT' },
        { name: 'Raider 120', bodyType: 'UNDERBONE' },
    ],
    'Suzuki': [
        { name: 'Smash 110', bodyType: 'UNDERBONE', isPopular: true },
        { name: 'Raider 150', bodyType: 'UNDERBONE', isPopular: true },
        { name: 'Address 110', bodyType: 'SCOOTER' },
        { name: 'Burgman Street 125', bodyType: 'SCOOTER' },
        { name: 'GSX-R150', bodyType: 'SPORT', isPopular: true },
        { name: 'GSX-S150', bodyType: 'NAKED' },
        { name: 'V-Strom 250', bodyType: 'ADVENTURE' },
        { name: 'V-Strom 650', bodyType: 'ADVENTURE' },
        { name: 'V-Strom 1050', bodyType: 'ADVENTURE' },
        { name: 'GSX-S750', bodyType: 'NAKED' },
        { name: 'GSX-S1000', bodyType: 'NAKED' },
        { name: 'GSX-R1000R', bodyType: 'SPORT' },
        { name: 'Katana', bodyType: 'NAKED' },
        { name: 'Hayabusa', bodyType: 'SPORT' },
        { name: 'Gixxer SF 250', bodyType: 'SPORT' },
    ],
    'Vespa': [
        { name: 'Primavera 150', bodyType: 'SCOOTER', isPopular: true },
        { name: 'Sprint 150', bodyType: 'SCOOTER', isPopular: true },
        { name: 'GTS 150', bodyType: 'SCOOTER' },
        { name: 'GTS 300', bodyType: 'SCOOTER', isPopular: true },
        { name: 'LX 125', bodyType: 'SCOOTER' },
        { name: 'S 125', bodyType: 'SCOOTER' },
        { name: 'Elettrica', bodyType: 'SCOOTER' },
        { name: 'GTV', bodyType: 'SCOOTER' },
        { name: '946', bodyType: 'SCOOTER' },
    ],
    'Ducati': [
        { name: 'Monster', bodyType: 'NAKED', isPopular: true },
        { name: 'Monster SP', bodyType: 'NAKED' },
        { name: 'Streetfighter V2', bodyType: 'NAKED' },
        { name: 'Streetfighter V4', bodyType: 'NAKED' },
        { name: 'Panigale V2', bodyType: 'SPORT', isPopular: true },
        { name: 'Panigale V4', bodyType: 'SPORT' },
        { name: 'Panigale V4 S', bodyType: 'SPORT' },
        { name: 'Multistrada V2', bodyType: 'ADVENTURE' },
        { name: 'Multistrada V4', bodyType: 'ADVENTURE', isPopular: true },
        { name: 'Scrambler Icon', bodyType: 'CAFE_RACER', isPopular: true },
        { name: 'Scrambler Full Throttle', bodyType: 'CAFE_RACER' },
        { name: 'Scrambler Nightshift', bodyType: 'CAFE_RACER' },
        { name: 'Diavel V4', bodyType: 'CRUISER' },
        { name: 'DesertX', bodyType: 'ADVENTURE' },
        { name: 'Hypermotard 950', bodyType: 'NAKED' },
    ],
    'BMW Motorrad': [
        { name: 'G 310 R', bodyType: 'NAKED', isPopular: true },
        { name: 'G 310 GS', bodyType: 'ADVENTURE', isPopular: true },
        { name: 'F 750 GS', bodyType: 'ADVENTURE' },
        { name: 'F 850 GS', bodyType: 'ADVENTURE', isPopular: true },
        { name: 'F 900 R', bodyType: 'NAKED' },
        { name: 'F 900 XR', bodyType: 'ADVENTURE' },
        { name: 'R 1250 GS', bodyType: 'ADVENTURE', isPopular: true },
        { name: 'R 1250 GS Adventure', bodyType: 'ADVENTURE' },
        { name: 'R 1250 RT', bodyType: 'TOURING' },
        { name: 'R nineT', bodyType: 'CAFE_RACER' },
        { name: 'S 1000 R', bodyType: 'NAKED' },
        { name: 'S 1000 RR', bodyType: 'SPORT' },
        { name: 'S 1000 XR', bodyType: 'ADVENTURE' },
        { name: 'C 400 X', bodyType: 'SCOOTER' },
        { name: 'C 400 GT', bodyType: 'SCOOTER' },
        { name: 'CE 04', bodyType: 'SCOOTER' },
        { name: 'K 1600 GTL', bodyType: 'TOURING' },
        { name: 'M 1000 RR', bodyType: 'SPORT' },
    ],
    'Harley-Davidson': [
        { name: 'Street 750', bodyType: 'CRUISER' },
        { name: 'Iron 883', bodyType: 'CRUISER', isPopular: true },
        { name: 'Forty-Eight', bodyType: 'CRUISER' },
        { name: 'Softail Standard', bodyType: 'CRUISER' },
        { name: 'Street Bob 114', bodyType: 'CRUISER', isPopular: true },
        { name: 'Fat Boy 114', bodyType: 'CRUISER', isPopular: true },
        { name: 'Fat Bob 114', bodyType: 'CRUISER' },
        { name: 'Heritage Classic 114', bodyType: 'CRUISER' },
        { name: 'Breakout 117', bodyType: 'CRUISER' },
        { name: 'Low Rider S', bodyType: 'CRUISER' },
        { name: 'Road King', bodyType: 'TOURING' },
        { name: 'Street Glide', bodyType: 'TOURING', isPopular: true },
        { name: 'Road Glide', bodyType: 'TOURING' },
        { name: 'Ultra Limited', bodyType: 'TOURING' },
        { name: 'Pan America', bodyType: 'ADVENTURE' },
        { name: 'Sportster S', bodyType: 'CRUISER' },
        { name: 'Nightster', bodyType: 'CRUISER' },
        { name: 'LiveWire', bodyType: 'NAKED' },
    ],
    'KTM': [
        { name: '125 Duke', bodyType: 'NAKED', isPopular: true },
        { name: '200 Duke', bodyType: 'NAKED', isPopular: true },
        { name: '390 Duke', bodyType: 'NAKED', isPopular: true },
        { name: '790 Duke', bodyType: 'NAKED' },
        { name: '890 Duke R', bodyType: 'NAKED' },
        { name: '1290 Super Duke R', bodyType: 'NAKED' },
        { name: 'RC 200', bodyType: 'SPORT' },
        { name: 'RC 390', bodyType: 'SPORT' },
        { name: '250 Adventure', bodyType: 'ADVENTURE' },
        { name: '390 Adventure', bodyType: 'ADVENTURE', isPopular: true },
        { name: '890 Adventure', bodyType: 'ADVENTURE' },
        { name: '1290 Super Adventure S', bodyType: 'ADVENTURE' },
        { name: '450 EXC-F', bodyType: 'DIRT' },
        { name: '300 EXC', bodyType: 'DIRT' },
    ],
    'Royal Enfield': [
        { name: 'Classic 350', bodyType: 'CAFE_RACER', isPopular: true },
        { name: 'Meteor 350', bodyType: 'CRUISER', isPopular: true },
        { name: 'Hunter 350', bodyType: 'CAFE_RACER', isPopular: true },
        { name: 'Bullet 350', bodyType: 'CAFE_RACER' },
        { name: 'Continental GT 650', bodyType: 'CAFE_RACER', isPopular: true },
        { name: 'Interceptor 650', bodyType: 'CAFE_RACER', isPopular: true },
        { name: 'Super Meteor 650', bodyType: 'CRUISER' },
        { name: 'Himalayan', bodyType: 'ADVENTURE', isPopular: true },
        { name: 'Scram 411', bodyType: 'ADVENTURE' },
    ],
    'Benelli': [
        { name: 'TNT 135', bodyType: 'NAKED' },
        { name: 'TNT 150', bodyType: 'NAKED' },
        { name: 'TNT 249S', bodyType: 'SPORT' },
        { name: 'TNT 302S', bodyType: 'NAKED', isPopular: true },
        { name: 'TNT 600', bodyType: 'NAKED' },
        { name: '502C', bodyType: 'CRUISER' },
        { name: 'TRK 251', bodyType: 'ADVENTURE' },
        { name: 'TRK 502 X', bodyType: 'ADVENTURE', isPopular: true },
        { name: 'Leoncino 250', bodyType: 'CAFE_RACER' },
        { name: 'Leoncino 500', bodyType: 'CAFE_RACER' },
        { name: 'Imperiale 400', bodyType: 'CAFE_RACER', isPopular: true },
    ],
    'Triumph': [
        { name: 'Trident 660', bodyType: 'NAKED', isPopular: true },
        { name: 'Street Triple 765', bodyType: 'NAKED', isPopular: true },
        { name: 'Street Triple RS', bodyType: 'NAKED' },
        { name: 'Speed Triple 1200', bodyType: 'NAKED' },
        { name: 'Bonneville T100', bodyType: 'CAFE_RACER', isPopular: true },
        { name: 'Bonneville T120', bodyType: 'CAFE_RACER' },
        { name: 'Bonneville Speedmaster', bodyType: 'CRUISER' },
        { name: 'Bonneville Bobber', bodyType: 'CRUISER' },
        { name: 'Scrambler 900', bodyType: 'CAFE_RACER' },
        { name: 'Scrambler 1200', bodyType: 'ADVENTURE' },
        { name: 'Tiger 660 Sport', bodyType: 'ADVENTURE', isPopular: true },
        { name: 'Tiger 900', bodyType: 'ADVENTURE' },
        { name: 'Tiger 1200', bodyType: 'ADVENTURE' },
        { name: 'Thruxton RS', bodyType: 'CAFE_RACER' },
        { name: 'Rocket 3', bodyType: 'CRUISER' },
        { name: 'Speed 400', bodyType: 'CAFE_RACER', isPopular: true },
        { name: 'Scrambler 400 X', bodyType: 'CAFE_RACER' },
        { name: 'Daytona 660', bodyType: 'SPORT' },
    ],
};

async function seedMasterData() {
    console.log('🌱 Starting master data seed...');

    // =============================================
    // Seed Car Brands & Models
    // =============================================
    console.log('\n🚗 Seeding car brands...');
    for (const brandData of carBrands) {
        const brand = await prisma.brand.upsert({
            where: {
                name_vehicleType: {
                    name: brandData.name,
                    vehicleType: 'CAR'
                }
            },
            update: {
                nameTh: brandData.nameTh,
                country: brandData.country,
                logo: brandData.logo,
                isPopular: brandData.isPopular,
                order: brandData.order
            },
            create: {
                name: brandData.name,
                nameTh: brandData.nameTh,
                country: brandData.country,
                logo: brandData.logo,
                vehicleType: 'CAR',
                isPopular: brandData.isPopular,
                order: brandData.order
            }
        });
        console.log(`  ✓ ${brand.name}`);

        // Seed models for this brand
        const models = carModels[brandData.name] || [];
        for (let i = 0; i < models.length; i++) {
            const modelData = models[i];
            const model = await prisma.vehicleModel.upsert({
                where: {
                    brandId_name: {
                        brandId: brand.id,
                        name: modelData.name
                    }
                },
                update: {},
                create: {
                    name: modelData.name,
                    brandId: brand.id,
                    bodyType: modelData.bodyType as 'SEDAN' | 'HATCHBACK' | 'SUV' | 'CROSSOVER' | 'MPV' | 'PICKUP' | 'COUPE' | 'CONVERTIBLE' | 'WAGON' | 'VAN',
                    isPopular: modelData.isPopular || false,
                    order: i
                }
            });

            // Seed sub-models if available
            const subModels = carSubModels[modelData.name] || [];
            for (let j = 0; j < subModels.length; j++) {
                const subModelData = subModels[j];
                await prisma.vehicleSubModel.upsert({
                    where: {
                        modelId_name: {
                            modelId: model.id,
                            name: subModelData.name
                        }
                    },
                    update: {},
                    create: {
                        name: subModelData.name,
                        modelId: model.id,
                        engineSize: subModelData.engineSize,
                        fuelType: subModelData.fuelType as 'PETROL' | 'DIESEL' | 'HYBRID' | 'PLUGIN_HYBRID' | 'EV' | 'LPG' | 'NGV' | undefined,
                        transmission: subModelData.transmission as 'AUTOMATIC' | 'MANUAL' | 'CVT' | 'DCT' | 'SEMI_AUTO' | undefined,
                        order: j
                    }
                });
            }
        }
    }

    // =============================================
    // Seed Motorcycle Brands & Models
    // =============================================
    console.log('\n🏍️ Seeding motorcycle brands...');
    for (const brandData of motorcycleBrands) {
        const brand = await prisma.brand.upsert({
            where: {
                name_vehicleType: {
                    name: brandData.name,
                    vehicleType: 'MOTORCYCLE'
                }
            },
            update: {
                logo: brandData.logo
            },
            create: {
                name: brandData.name,
                nameTh: brandData.nameTh,
                country: brandData.country,
                logo: brandData.logo,
                vehicleType: 'MOTORCYCLE',
                isPopular: brandData.isPopular,
                order: brandData.order
            }
        });
        console.log(`  ✓ ${brand.name}`);

        // Seed models for this brand
        const models = motorcycleModels[brandData.name] || [];
        for (let i = 0; i < models.length; i++) {
            const modelData = models[i];
            await prisma.vehicleModel.upsert({
                where: {
                    brandId_name: {
                        brandId: brand.id,
                        name: modelData.name
                    }
                },
                update: {},
                create: {
                    name: modelData.name,
                    brandId: brand.id,
                    bodyType: modelData.bodyType as 'STANDARD' | 'SCOOTER' | 'SPORT' | 'NAKED' | 'CRUISER' | 'TOURING' | 'ADVENTURE' | 'DIRT' | 'CAFE_RACER' | 'UNDERBONE' | 'CUB',
                    isPopular: modelData.isPopular || false,
                    order: i
                }
            });
        }
    }

    console.log('\n✅ Master data seeded successfully!');

    // Summary
    const brandsCount = await prisma.brand.count();
    const modelsCount = await prisma.vehicleModel.count();
    const subModelsCount = await prisma.vehicleSubModel.count();

    console.log(`
📊 Summary:
   - Brands: ${brandsCount}
   - Models: ${modelsCount}
   - SubModels: ${subModelsCount}
`);
}

seedMasterData()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
