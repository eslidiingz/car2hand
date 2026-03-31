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
    // === Batch 1: Toyota / Honda / Isuzu / Mazda / Mitsubishi / Nissan ===
    'Hilux Revo Rocco': [
        { name: '2.4 Rocco', engineSize: 2400, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.8 Rocco 4x4', engineSize: 2800, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'Sienta': [
        { name: '1.5 E', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 G', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 HV', engineSize: 1500, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: '1.5 HV Premium', engineSize: 1500, fuelType: 'HYBRID', transmission: 'CVT' },
    ],
    'GR86': [
        { name: '2.4 MT', engineSize: 2400, fuelType: 'PETROL', transmission: 'MANUAL' },
        { name: '2.4 AT', engineSize: 2400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.4 GR Sport MT', engineSize: 2400, fuelType: 'PETROL', transmission: 'MANUAL' },
    ],
    'Supra': [
        { name: '2.0 GR Sport', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '3.0 GR Sport', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '3.0 GR Sport Premium', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'A90 Final Edition', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Civic Hatchback': [
        { name: '1.5 Turbo', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 Turbo RS', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '2.0 e:HEV RS', engineSize: 2000, fuelType: 'HYBRID', transmission: 'CVT' },
    ],
    'Jazz': [
        { name: '1.5 S', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 SV', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 RS', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 RS Hybrid', engineSize: 1500, fuelType: 'HYBRID', transmission: 'CVT' },
    ],
    'e:N1': [
        { name: 'e:N1', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'D-Max Hi-Lander': [
        { name: '1.9 Hi-Lander', engineSize: 1900, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '3.0 Hi-Lander 4x4', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'D-Max V-Cross': [
        { name: '3.0 V-Cross 4x4 MT', engineSize: 3000, fuelType: 'DIESEL', transmission: 'MANUAL' },
        { name: '3.0 V-Cross 4x4 AT', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '3.0 V-Cross 4WD', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'Mazda2 Sedan': [
        { name: '1.3 C', engineSize: 1300, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.3 S', engineSize: 1300, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.3 SP', engineSize: 1300, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Mazda3 Sedan': [
        { name: '2.0 C', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0 S', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0 SP', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0 SP Sports', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'CX-3': [
        { name: '2.0 C', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0 S', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0 SP', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'CX-8': [
        { name: '2.5 C', engineSize: 2500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.5 S', engineSize: 2500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.5 SP', engineSize: 2500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.2 XDL Diesel', engineSize: 2200, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'CX-60': [
        { name: 'e-Skyactiv D 3.3', engineSize: 3300, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'e-Skyactiv PHEV', engineSize: 2500, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'MX-5': [
        { name: '2.0 Roadster', engineSize: 2000, fuelType: 'PETROL', transmission: 'MANUAL' },
        { name: '2.0 Roadster AT', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0 RF', engineSize: 2000, fuelType: 'PETROL', transmission: 'MANUAL' },
    ],
    'Attrage': [
        { name: '1.2 GLX', engineSize: 1200, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.2 GLS', engineSize: 1200, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.2 GT Premium', engineSize: 1200, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Mirage': [
        { name: '1.2 GLX', engineSize: 1200, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.2 GLS', engineSize: 1200, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.2 GT Premium', engineSize: 1200, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Outlander PHEV': [
        { name: '2.4 PHEV GT', engineSize: 2400, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: '2.4 PHEV GT Premium', engineSize: 2400, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Note': [
        { name: '1.2 S', engineSize: 1200, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.2 V', engineSize: 1200, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.2 e-Power', engineSize: 1200, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
    ],
    'X-Trail': [
        { name: '2.0 S 2WD', engineSize: 2000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '2.0 V 4WD', engineSize: 2000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 e-Power', engineSize: 1500, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
        { name: '1.5 e-Power 4WD', engineSize: 1500, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
    ],
    // === Batch 2: Nissan remaining + BMW ===
    'Terra': [
        { name: '2.3 V 4WD', engineSize: 2300, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.3 VL 4WD', engineSize: 2300, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'Leaf': [
        { name: 'Leaf 40 kWh', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Leaf e+ 62 kWh', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'GT-R': [
        { name: 'Premium', engineSize: 3800, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'Track Edition', engineSize: 3800, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'NISMO', engineSize: 3800, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Series 1': [
        { name: '118i M Sport', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '120i M Sport', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '120d M Sport', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'Series 2': [
        { name: '218i M Sport', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '220i M Sport', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'M235i xDrive', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Series 4': [
        { name: '420i M Sport', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '420d M Sport', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '430i M Sport', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'M440i xDrive', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Series 6': [
        { name: '630i M Sport', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '640d M Sport', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'M6 Gran Coupe', engineSize: 4400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Series 7': [
        { name: '730Ld M Sport', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '740Le xDrive', engineSize: 2000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: '750Li M Sport', engineSize: 4400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Series 8': [
        { name: '840i M Sport', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '840d M Sport', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'M850i xDrive', engineSize: 4400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'X2': [
        { name: 'sDrive18i M Sport', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'xDrive20d M Sport', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'M35i', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'X4': [
        { name: 'xDrive20d M Sport', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'xDrive30d M Sport', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'M40i', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'X6': [
        { name: 'xDrive30d M Sport', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'xDrive40i M Sport', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'M60i', engineSize: 4400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'X7': [
        { name: 'xDrive30d M Sport', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'xDrive40i M Sport', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'M60i', engineSize: 4400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'XM': [
        { name: 'XM', engineSize: 4400, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'XM Label Red', engineSize: 4400, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'iX': [
        { name: 'iX xDrive40', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'iX xDrive50', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'iX M60', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'iX1': [
        { name: 'xDrive30e M Sport', engineSize: 1500, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'eDrive20 M Sport', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'iX2': [
        { name: 'eDrive20 M Sport', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'xDrive30e M Sport', engineSize: 1500, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'iX3': [
        { name: 'iX3 M Sport', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'iX3 Impressive', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'i4': [
        { name: 'eDrive40 M Sport', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'xDrive40 M Sport', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'M50', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'i5': [
        { name: 'eDrive40 M Sport', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'xDrive40 M Sport', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'M60 xDrive', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'i7': [
        { name: 'xDrive60 M Sport', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'M70 xDrive', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'M2': [
        { name: 'M2', engineSize: 3000, fuelType: 'PETROL', transmission: 'MANUAL' },
        { name: 'M2 Competition', engineSize: 3000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'M3': [
        { name: 'M3', engineSize: 3000, fuelType: 'PETROL', transmission: 'MANUAL' },
        { name: 'M3 Competition', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'M3 CS', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'M4': [
        { name: 'M4 Competition', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'M4 CS', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'M4 CSL', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'M5': [
        { name: 'M5', engineSize: 4400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'M5 Competition', engineSize: 4400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'M5 CS', engineSize: 4400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'M8': [
        { name: 'M8 Competition Coupe', engineSize: 4400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'M8 Competition Gran Coupe', engineSize: 4400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Z4': [
        { name: 'sDrive20i M Sport', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'sDrive30i M Sport', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'M40i', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    // === Batch 3: Mercedes-Benz ===
    'A-Class': [
        { name: 'A200', engineSize: 1300, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'A200 AMG Dynamic', engineSize: 1300, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'A250 AMG Dynamic', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'AMG A45 S', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'S-Class': [
        { name: 'S350d AMG Dynamic', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'S500 AMG Dynamic', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'S580e AMG Dynamic', engineSize: 3000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'Maybach S580', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'GLA': [
        { name: 'GLA200 AMG Dynamic', engineSize: 1300, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'GLA250 AMG Dynamic', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'GLA250e AMG Dynamic', engineSize: 1300, fuelType: 'PLUGIN_HYBRID', transmission: 'DCT' },
        { name: 'AMG GLA45 S', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'GLB': [
        { name: 'GLB200 AMG Dynamic', engineSize: 1300, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'GLB220d AMG Dynamic', engineSize: 2000, fuelType: 'DIESEL', transmission: 'DCT' },
        { name: 'GLB250e AMG Dynamic', engineSize: 1300, fuelType: 'PLUGIN_HYBRID', transmission: 'DCT' },
        { name: 'AMG GLB35', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'GLE': [
        { name: 'GLE300d AMG Dynamic', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'GLE350e AMG Dynamic', engineSize: 2000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'GLE450 AMG Dynamic', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'AMG GLE53', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'AMG GLE63 S', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'GLS': [
        { name: 'GLS350d AMG Dynamic', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'GLS450 AMG Dynamic', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Maybach GLS600', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'AMG GLS63', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'EQA': [
        { name: 'EQA250', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'EQA250+ AMG Dynamic', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'EQA350 4MATIC', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'EQB': [
        { name: 'EQB250', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'EQB250+ AMG Dynamic', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'EQB350 4MATIC AMG Dynamic', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'EQE': [
        { name: 'EQE350+', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'EQE350+ AMG Dynamic', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'EQE500 4MATIC', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'AMG EQE53 4MATIC+', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'EQS': [
        { name: 'EQS450+', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'EQS450+ AMG Dynamic', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'EQS580 4MATIC', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'AMG EQS53 4MATIC+', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    // === Batch 4: Ford + MG + BYD + Lexus ===
    'Territory': [
        { name: '1.5 EcoBoost Trend', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 EcoBoost Titanium', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: 'EV Trend', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'EV Titanium', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Mustang': [
        { name: '2.3 EcoBoost', engineSize: 2300, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '5.0 GT', engineSize: 5000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '5.0 GT Premium', engineSize: 5000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Mach-E', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'MG3': [
        { name: '1.5 D', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.5 X', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'MG EP': [
        { name: 'MG EP', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'MG Extender': [
        { name: '2.0 C', engineSize: 2000, fuelType: 'DIESEL', transmission: 'MANUAL' },
        { name: '2.0 Grand C', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.0 Grand X', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'Sealion 6': [
        { name: 'DM-i', engineSize: 1500, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'EV', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Sealion 7': [
        { name: 'Standard Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Performance', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'M6': [
        { name: 'M6 EV', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'M6 DM-i', engineSize: 1500, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'D9': [
        { name: 'DM-i', engineSize: 1500, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'EV', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'CT': [
        { name: 'CT200h Luxury', engineSize: 1800, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: 'CT200h F Sport', engineSize: 1800, fuelType: 'HYBRID', transmission: 'CVT' },
    ],
    'LS': [
        { name: 'LS500h Grand Luxury', engineSize: 3500, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
        { name: 'LS500h Luxury', engineSize: 3500, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
    ],
    'GX': [
        { name: 'GX460 Luxury', engineSize: 4600, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'GX460 Premium', engineSize: 4600, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'LX': [
        { name: 'LX600 Luxury', engineSize: 3500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'LX600 Ultra Luxury', engineSize: 3500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'LX600 F Sport', engineSize: 3500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'LC': [
        { name: 'LC500 Sport+', engineSize: 5000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'LC500h Sport+', engineSize: 3500, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: 'LC500 Convertible', engineSize: 5000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'RC': [
        { name: 'RC300h Luxury', engineSize: 2500, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: 'RC300h F Sport', engineSize: 2500, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: 'RC350 F Sport', engineSize: 3500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'LM': [
        { name: 'LM350h 4-Seat', engineSize: 2500, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: 'LM350h 7-Seat', engineSize: 2500, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: 'LM500h 4-Seat', engineSize: 3500, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
    ],
    'RZ': [
        { name: 'RZ300e', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'RZ450e', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'RZ450e F Sport', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    // === Batch 5: Suzuki + Subaru + Daihatsu + Mitsuoka ===
    'Celerio': [
        { name: '1.0 GL', engineSize: 1000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.0 GLX', engineSize: 1000, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'XL7': [
        { name: '1.5 GL', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.5 GLX', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.5 Alpha', engineSize: 1500, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Vitara': [
        { name: '1.4 Turbo GL', engineSize: 1400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.4 Turbo GLX', engineSize: 1400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'e-Vitara', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'S-Cross': [
        { name: '1.4 Turbo GL', engineSize: 1400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.4 Turbo GLX', engineSize: 1400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Carry': [
        { name: '1.5 MT', engineSize: 1500, fuelType: 'PETROL', transmission: 'MANUAL' },
        { name: '1.5 AT', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'XV': [
        { name: '2.0 i-S EyeSight', engineSize: 2000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '2.0 i-P EyeSight', engineSize: 2000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '2.0 e-Boxer', engineSize: 2000, fuelType: 'HYBRID', transmission: 'CVT' },
    ],
    'Forester': [
        { name: '2.0 i-S EyeSight', engineSize: 2000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '2.0 i-P EyeSight', engineSize: 2000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '2.0 e-Boxer', engineSize: 2000, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: '2.0 GT Edition', engineSize: 2000, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Outback': [
        { name: '2.5 i-S EyeSight', engineSize: 2500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '2.5 i-T EyeSight', engineSize: 2500, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Crosstrek': [
        { name: '2.0 i-S EyeSight', engineSize: 2000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '2.0 e-Boxer', engineSize: 2000, fuelType: 'HYBRID', transmission: 'CVT' },
    ],
    'WRX': [
        { name: '2.4 Sport', engineSize: 2400, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '2.4 GT', engineSize: 2400, fuelType: 'PETROL', transmission: 'MANUAL' },
        { name: '2.4 S-Edition EyeSight', engineSize: 2400, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'BRZ': [
        { name: '2.4 MT', engineSize: 2400, fuelType: 'PETROL', transmission: 'MANUAL' },
        { name: '2.4 AT', engineSize: 2400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.4 S Edition', engineSize: 2400, fuelType: 'PETROL', transmission: 'MANUAL' },
    ],
    'Levorg': [
        { name: '1.8 GT-S EyeSight', engineSize: 1800, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.8 GT EyeSight', engineSize: 1800, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Solterra': [
        { name: 'AWD', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Z', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Mira': [
        { name: '660 L', engineSize: 660, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '660 X', engineSize: 660, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '660 RS', engineSize: 660, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Move': [
        { name: '660 L', engineSize: 660, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '660 X', engineSize: 660, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '660 Custom RS', engineSize: 660, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Tanto': [
        { name: '660 L', engineSize: 660, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '660 X', engineSize: 660, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '660 Custom RS', engineSize: 660, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Rocky': [
        { name: '1.0 Turbo G', engineSize: 1000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.2 e-Smart Hybrid G', engineSize: 1200, fuelType: 'HYBRID', transmission: 'CVT' },
        { name: '1.2 e-Smart Hybrid X', engineSize: 1200, fuelType: 'HYBRID', transmission: 'CVT' },
    ],
    'Atrai': [
        { name: '660 G', engineSize: 660, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '660 RS', engineSize: 660, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Hijet': [
        { name: '660 Standard', engineSize: 660, fuelType: 'PETROL', transmission: 'MANUAL' },
        { name: '660 Deluxe', engineSize: 660, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Himiko': [
        { name: '1.5 Cabriolet', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Rock Star': [
        { name: '2.0 Cabriolet', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Viewt': [
        { name: '1.2 Standard', engineSize: 1200, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.2 Nicola', engineSize: 1200, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Galue': [
        { name: '3.5 Sedan', engineSize: 3500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '3.5 Limousine', engineSize: 3500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Buddy': [
        { name: '1.5 SUV', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 Turbo SUV', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    // === Batch 6: GWM + Chinese brands ===
    'Haval H6 HEV': [
        { name: 'HEV Smart', engineSize: 1500, fuelType: 'HYBRID', transmission: 'DCT' },
        { name: 'HEV Premium', engineSize: 1500, fuelType: 'HYBRID', transmission: 'DCT' },
    ],
    'Tank 300': [
        { name: '2.0T Comfort', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0T Luxury', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0T Off-Road', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'HEV', engineSize: 2000, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Tank 500': [
        { name: '3.0T Luxury', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '3.0T Ultra', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'HEV', engineSize: 3000, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Poer': [
        { name: '2.0T MT', engineSize: 2000, fuelType: 'DIESEL', transmission: 'MANUAL' },
        { name: '2.0T AT', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'Poer EV': [
        { name: 'Standard Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'ORA 03': [
        { name: 'Standard Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Ultra Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'NETA X': [
        { name: 'Standard Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'PHEV', engineSize: 1500, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'CS35 Plus': [
        { name: '1.4T MT', engineSize: 1400, fuelType: 'PETROL', transmission: 'MANUAL' },
        { name: '1.4T AT', engineSize: 1400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'CS55 Plus': [
        { name: '1.5T MT', engineSize: 1500, fuelType: 'PETROL', transmission: 'MANUAL' },
        { name: '1.5T AT', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'HEV', engineSize: 1500, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
    ],
    'CS75 Plus': [
        { name: '1.5T AT', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0T AT', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'HEV', engineSize: 1500, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Lumin': [
        { name: 'Standard Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Uni-V': [
        { name: '1.5T AT', engineSize: 1500, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'HEV', engineSize: 1500, fuelType: 'HYBRID', transmission: 'DCT' },
    ],
    'Uni-T': [
        { name: '1.5T AT', engineSize: 1500, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'PHEV', engineSize: 1500, fuelType: 'PLUGIN_HYBRID', transmission: 'DCT' },
    ],
    'Aion Y Plus': [
        { name: 'Standard Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Max', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Aion V': [
        { name: 'Standard Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Plus', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Aion S': [
        { name: 'Standard Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Omoda 5': [
        { name: '1.5T MT', engineSize: 1500, fuelType: 'PETROL', transmission: 'MANUAL' },
        { name: '1.5T AT', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Omoda 5 EV': [
        { name: 'Standard Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Omoda C5': [
        { name: '1.5T AT', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'HEV', engineSize: 1500, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Jaecoo 7': [
        { name: '1.5T AT', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.5T 4WD', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'HEV', engineSize: 1500, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Jaecoo 5': [
        { name: '1.5T AT', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'EV', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Jaecoo 6': [
        { name: '1.5T AT', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'HEV', engineSize: 1500, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
    ],
    'G6': [
        { name: 'RWD Standard', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'RWD Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'AWD Performance', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'G9': [
        { name: 'RWD Standard', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'RWD Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'AWD Performance', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'P7': [
        { name: 'RWD Standard', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'RWD Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'AWD Performance', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Zeekr 001': [
        { name: 'RWD Standard', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'RWD Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'AWD Performance', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Zeekr 009': [
        { name: 'Standard', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Premium', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Zeekr X': [
        { name: 'RWD', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'AWD', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Mini EV': [
        { name: 'Standard Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Bingo': [
        { name: 'Standard Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Almaz': [
        { name: '1.5T AT', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: 'RS Turbo', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Deepal S07': [
        { name: 'Standard Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'PHEV', engineSize: 1500, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Deepal L07': [
        { name: 'Standard Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Deepal G318': [
        { name: '2.0T AT', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'PHEV', engineSize: 1500, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Tunland V': [
        { name: '2.0T MT', engineSize: 2000, fuelType: 'DIESEL', transmission: 'MANUAL' },
        { name: '2.0T AT', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.0T 4WD', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'Tunland G': [
        { name: '2.0T MT', engineSize: 2000, fuelType: 'DIESEL', transmission: 'MANUAL' },
        { name: '2.0T AT', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'Thunder': [
        { name: '2.4T MT', engineSize: 2400, fuelType: 'DIESEL', transmission: 'MANUAL' },
        { name: '2.4T AT', engineSize: 2400, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    // === Batch 7: Audi + Mini + Porsche + Peugeot ===
    'A3': [
        { name: '35 TFSI', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '40 TFSI Quattro', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '45 TFSI e Quattro', engineSize: 1400, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'RS3', engineSize: 2500, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'A5': [
        { name: '40 TFSI S line', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '45 TFSI Quattro S line', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'RS5', engineSize: 2900, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'A7': [
        { name: '55 TFSI Quattro S line', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '55 TFSI e Quattro S line', engineSize: 3000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'RS7', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'A8': [
        { name: '55 TFSI Quattro', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '60 TFSI e Quattro', engineSize: 3000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'L 60 TFSI e Quattro', engineSize: 3000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Q2': [
        { name: '35 TFSI', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '35 TFSI S line', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Q7': [
        { name: '45 TFSI Quattro', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '55 TFSI Quattro S line', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '60 TFSI e Quattro S line', engineSize: 3000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Q8': [
        { name: '55 TFSI Quattro S line', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '60 TFSI e Quattro S line', engineSize: 3000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'RS Q8', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'SQ8', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'e-tron': [
        { name: '50 Quattro', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: '55 Quattro', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'S Quattro', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'e-tron GT': [
        { name: 'e-tron GT', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'RS e-tron GT', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'RS3': [
        { name: 'RS3 Sedan', engineSize: 2500, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'RS3 Sportback', engineSize: 2500, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'RS5': [
        { name: 'RS5 Coupe', engineSize: 2900, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'RS5 Sportback', engineSize: 2900, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'RS6 Avant': [
        { name: 'RS6 Avant', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'RS6 Avant Performance', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'RS7': [
        { name: 'RS7 Sportback', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'RS7 Sportback Performance', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'TT': [
        { name: 'TT Coupe 2.0 TFSI', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'TTS Coupe', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'TT RS Coupe', engineSize: 2500, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'TT Roadster', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'R8': [
        { name: 'R8 V10', engineSize: 5200, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'R8 V10 Performance', engineSize: 5200, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'R8 V10 Spyder', engineSize: 5200, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Cooper SE': [
        { name: 'Cooper SE', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Cooper SE Level 2', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Cooper SE Level 3', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Countryman SE': [
        { name: 'SE ALL4', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'SE ALL4 Level 2', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Clubman': [
        { name: 'Cooper S ALL4', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'JCW ALL4', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'John Cooper Works': [
        { name: 'JCW', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'JCW GP', engineSize: 2000, fuelType: 'PETROL', transmission: 'MANUAL' },
    ],
    '718 Cayman': [
        { name: '718 Cayman', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '718 Cayman S', engineSize: 2500, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '718 Cayman GTS 4.0', engineSize: 4000, fuelType: 'PETROL', transmission: 'MANUAL' },
        { name: 'Cayman GT4', engineSize: 4000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    '718 Boxster': [
        { name: '718 Boxster', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '718 Boxster S', engineSize: 2500, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '718 Boxster GTS 4.0', engineSize: 4000, fuelType: 'PETROL', transmission: 'MANUAL' },
        { name: 'Boxster Spyder', engineSize: 4000, fuelType: 'PETROL', transmission: 'MANUAL' },
    ],
    'Panamera': [
        { name: 'Panamera 4', engineSize: 2900, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Panamera 4S', engineSize: 2900, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Panamera 4 E-Hybrid', engineSize: 2900, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'Panamera Turbo S', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Panamera Turbo S E-Hybrid', engineSize: 4000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Taycan': [
        { name: 'Taycan', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Taycan 4S', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Taycan GTS', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Taycan Turbo', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Taycan Turbo S', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    '208': [
        { name: '1.2 PureTech Active', engineSize: 1200, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.2 PureTech Allure', engineSize: 1200, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'e-208', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    '2008': [
        { name: '1.2 PureTech Active', engineSize: 1200, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.2 PureTech Allure', engineSize: 1200, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'e-2008', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    '3008': [
        { name: '1.6 THP Active', engineSize: 1600, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.6 THP Allure', engineSize: 1600, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'PHEV', engineSize: 1600, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'e-3008', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    '5008': [
        { name: '1.6 THP Allure', engineSize: 1600, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'PHEV', engineSize: 1600, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'e-5008', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    '308': [
        { name: '1.2 PureTech Active', engineSize: 1200, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.2 PureTech Allure', engineSize: 1200, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'PHEV', engineSize: 1600, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    '408': [
        { name: '1.2 PureTech Allure', engineSize: 1200, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'PHEV', engineSize: 1600, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    '508': [
        { name: '1.6 PureTech Allure', engineSize: 1600, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'SW PHEV', engineSize: 1600, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'PSE PHEV', engineSize: 1600, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    // === Batch 8: VW + Land Rover + Jaguar + Volvo ===
    'Polo': [
        { name: '1.0 TSI Comfortline', engineSize: 1000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.0 TSI Highline', engineSize: 1000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0 TSI GTI', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Golf': [
        { name: '1.4 TSI Comfortline', engineSize: 1400, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '1.5 TSI Highline', engineSize: 1500, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '1.4 GTE PHEV', engineSize: 1400, fuelType: 'PLUGIN_HYBRID', transmission: 'DCT' },
        { name: 'e-Golf', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Golf GTI': [
        { name: 'GTI', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'GTI Clubsport', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Golf R': [
        { name: 'Golf R', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'Golf R 333', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Passat': [
        { name: '2.0 TDI Highline', engineSize: 2000, fuelType: 'DIESEL', transmission: 'DCT' },
        { name: '1.8 TSI Highline', engineSize: 1800, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '1.4 GTE PHEV', engineSize: 1400, fuelType: 'PLUGIN_HYBRID', transmission: 'DCT' },
    ],
    'Arteon': [
        { name: '2.0 TSI Elegance', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '2.0 TSI R-Line 4Motion', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'R', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'T-Cross': [
        { name: '1.0 TSI Comfortline', engineSize: 1000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.0 TSI Highline', engineSize: 1000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'T-Roc': [
        { name: '1.5 TSI Comfortline', engineSize: 1500, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '2.0 TSI R-Line', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'R', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Tiguan': [
        { name: '1.4 TSI Comfortline', engineSize: 1400, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '2.0 TDI Highline', engineSize: 2000, fuelType: 'DIESEL', transmission: 'DCT' },
        { name: '1.4 eHybrid Elegance', engineSize: 1400, fuelType: 'PLUGIN_HYBRID', transmission: 'DCT' },
        { name: 'Allspace 2.0 TDI', engineSize: 2000, fuelType: 'DIESEL', transmission: 'DCT' },
    ],
    'Touareg': [
        { name: '3.0 TDI', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '3.0 TSI', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'R PHEV', engineSize: 3000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'ID.4': [
        { name: 'ID.4 Pure+', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'ID.4 Pro', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'ID.4 GTX', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Caravelle': [
        { name: '2.0 TDI Comfortline', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.0 TDI Highline', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'Amarok': [
        { name: '3.0 TDI Highline', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'V6 TDI Aventura', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'V6 Panamericana', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'Discovery': [
        { name: 'D250 S', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'D300 SE', engineSize: 3000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'P360 S', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Discovery Sport': [
        { name: 'P200 S', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'P250 SE', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'P300e SE', engineSize: 1500, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Range Rover Velar': [
        { name: 'P250 S', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'P400 SE', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'P400e SE', engineSize: 2000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'XE': [
        { name: '2.0D Pure', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.0 Prestige', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'P300 R-Dynamic SE', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'XF': [
        { name: '2.0D Pure', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'P250 SE', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'P300 R-Dynamic SE', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'F-Pace': [
        { name: '2.0D Pure', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'P250 SE', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'P400e SE', engineSize: 2000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'SVR', engineSize: 5000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'E-Pace': [
        { name: 'P200 S', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'P250 SE', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'P300e SE', engineSize: 1500, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'I-Pace': [
        { name: 'EV400 S', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'EV400 SE', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'EV400 HSE', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'F-Type': [
        { name: 'P300 Coupe', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'P450 Coupe', engineSize: 5000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'P575 R Coupe', engineSize: 5000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'P300 Convertible', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'S90': [
        { name: 'B5 Plus', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'B6 AWD', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'T8 Recharge AWD', engineSize: 2000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'V60': [
        { name: 'B4 Momentum', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'B5 R-Design', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'T6 Recharge AWD', engineSize: 2000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'XC40 Recharge': [
        { name: 'Pure Electric Single', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Pure Electric Twin', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'XC90': [
        { name: 'B5 AWD Plus', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'B6 AWD Ultimate', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'T8 Recharge AWD', engineSize: 2000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'C40 Recharge': [
        { name: 'Single Motor', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Twin Motor', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'EX30': [
        { name: 'Single Motor', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Twin Motor', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'EX90': [
        { name: 'Twin Motor', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Twin Motor Performance', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    // === Batch 9: Alfa Romeo + Citroen + Fiat + Seat + Tesla + Jeep ===
    'Giulia': [
        { name: '2.0 Sprint', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0 Veloce', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Quadrifoglio', engineSize: 2900, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Stelvio': [
        { name: '2.0 Sprint', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0 Veloce', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Quadrifoglio', engineSize: 2900, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Tonale': [
        { name: '1.5 MHEV Sprint', engineSize: 1500, fuelType: 'HYBRID', transmission: 'DCT' },
        { name: '1.5 MHEV Veloce', engineSize: 1500, fuelType: 'HYBRID', transmission: 'DCT' },
        { name: 'PHEV Q4', engineSize: 1300, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'C3': [
        { name: '1.2 PureTech Feel', engineSize: 1200, fuelType: 'PETROL', transmission: 'MANUAL' },
        { name: '1.2 PureTech Shine', engineSize: 1200, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'C3 Aircross': [
        { name: '1.2 PureTech Feel', engineSize: 1200, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.2 PureTech Shine', engineSize: 1200, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'C5 Aircross': [
        { name: '1.6 PureTech Feel', engineSize: 1600, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.6 PureTech Shine', engineSize: 1600, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'PHEV Shine', engineSize: 1600, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'C5 X': [
        { name: '1.6 PureTech Shine', engineSize: 1600, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'PHEV Shine', engineSize: 1600, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    '500': [
        { name: '1.0 MHEV Action', engineSize: 1000, fuelType: 'HYBRID', transmission: 'MANUAL' },
        { name: '1.0 MHEV Dolcevita', engineSize: 1000, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
    ],
    '500e': [
        { name: '500e Action', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: '500e La Prima', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: '500e Convertible', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    '500X': [
        { name: '1.3 Sport', engineSize: 1300, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '1.5 MHEV City Cross', engineSize: 1500, fuelType: 'HYBRID', transmission: 'DCT' },
    ],
    'Ibiza': [
        { name: '1.0 TSI Reference', engineSize: 1000, fuelType: 'PETROL', transmission: 'MANUAL' },
        { name: '1.0 TSI Style', engineSize: 1000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'FR 1.5 TSI', engineSize: 1500, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Leon': [
        { name: '1.5 TSI Style', engineSize: 1500, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '2.0 TDI FR', engineSize: 2000, fuelType: 'DIESEL', transmission: 'DCT' },
        { name: 'e-Hybrid FR', engineSize: 1400, fuelType: 'PLUGIN_HYBRID', transmission: 'DCT' },
        { name: 'Cupra Leon', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Arona': [
        { name: '1.0 TSI Reference', engineSize: 1000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.0 TSI Style', engineSize: 1000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'FR 1.5 TSI', engineSize: 1500, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Ateca': [
        { name: '1.5 TSI Style', engineSize: 1500, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '2.0 TDI FR', engineSize: 2000, fuelType: 'DIESEL', transmission: 'DCT' },
        { name: 'Cupra Ateca', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Model S': [
        { name: 'Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Plaid', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Model X': [
        { name: 'Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Plaid', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Cybertruck': [
        { name: 'Rear-Wheel Drive', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'All-Wheel Drive', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Cyberbeast', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Wrangler': [
        { name: '2.0T Sport', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0T Sahara', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0T Rubicon', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '4xe PHEV Sahara', engineSize: 2000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: '4xe PHEV Rubicon', engineSize: 2000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Gladiator': [
        { name: '3.6 Sport', engineSize: 3600, fuelType: 'PETROL', transmission: 'MANUAL' },
        { name: '3.6 Sahara', engineSize: 3600, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '3.6 Rubicon', engineSize: 3600, fuelType: 'PETROL', transmission: 'MANUAL' },
    ],
    'Grand Cherokee': [
        { name: '3.6 Laredo', engineSize: 3600, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '3.6 Limited', engineSize: 3600, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '3.6 Overland', engineSize: 3600, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '4xe PHEV', engineSize: 2000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Cherokee': [
        { name: '2.4 Sport', engineSize: 2400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.4 Latitude', engineSize: 2400, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '3.2 Overland', engineSize: 3200, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Compass': [
        { name: '1.3 Turbo Sport', engineSize: 1300, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '1.3 Turbo Limited', engineSize: 1300, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '4xe PHEV', engineSize: 1300, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Renegade': [
        { name: '1.3 Turbo Sport', engineSize: 1300, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '1.3 Turbo Limited', engineSize: 1300, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '4xe PHEV', engineSize: 1300, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Avenger': [
        { name: '1.2 Turbo Altitude', engineSize: 1200, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'e-Hybrid', engineSize: 1600, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
        { name: '4xe PHEV', engineSize: 1300, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    // === Batch 10: Chevrolet + GMC + Hyundai + Kia + Ssangyong ===
    'Captiva': [
        { name: '1.5 LT', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 LTZ', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: 'EV', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Corvette': [
        { name: 'Stingray 3LT', engineSize: 6200, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'Z06', engineSize: 5500, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'E-Ray', engineSize: 6200, fuelType: 'HYBRID', transmission: 'DCT' },
    ],
    'Camaro': [
        { name: '2.0T LT', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '3.6 LT1', engineSize: 3600, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '6.2 SS', engineSize: 6200, fuelType: 'PETROL', transmission: 'MANUAL' },
        { name: 'ZL1', engineSize: 6200, fuelType: 'PETROL', transmission: 'MANUAL' },
    ],
    'Bolt EV': [
        { name: 'Bolt EV 1LT', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Bolt EV 2LT', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Bolt EUV Premier', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Sierra': [
        { name: '2.7T SLE', engineSize: 2700, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '5.3 SLT', engineSize: 5300, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '6.2 AT4X', engineSize: 6200, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'EV', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Canyon': [
        { name: '2.5 SLE', engineSize: 2500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.7T AT4', engineSize: 2700, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.7T Denali', engineSize: 2700, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Yukon': [
        { name: '5.3 SLE', engineSize: 5300, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '5.3 SLT', engineSize: 5300, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '6.2 Denali', engineSize: 6200, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Terrain': [
        { name: '1.5T SLE', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0T SLT', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0T Denali', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Hummer EV': [
        { name: 'Edition 1', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: '3X', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: '2X', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Accent': [
        { name: '1.4 GL', engineSize: 1400, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.4 GLS', engineSize: 1400, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Elantra': [
        { name: '1.6 Smart', engineSize: 1600, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.6 Premium', engineSize: 1600, fuelType: 'PETROL', transmission: 'CVT' },
        { name: 'N Line', engineSize: 1600, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'N', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Sonata': [
        { name: '2.0 Smart', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0 Premium', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0 HEV', engineSize: 2000, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Venue': [
        { name: '1.0T Smart', engineSize: 1000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '1.0T Premium', engineSize: 1000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Kona': [
        { name: '1.6T Smart', engineSize: 1600, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '1.6T Premium', engineSize: 1600, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'N Line', engineSize: 1600, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Kona Electric': [
        { name: 'Standard Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Palisade': [
        { name: '2.2D Smart', engineSize: 2200, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.2D Premium', engineSize: 2200, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '3.8 Calligraphy', engineSize: 3800, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Stargazer': [
        { name: '1.5T Smart', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5T Premium', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Staria': [
        { name: '2.2D Smart', engineSize: 2200, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.2D Premium', engineSize: 2200, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'PHEV', engineSize: 1600, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Ioniq 5': [
        { name: 'Standard Range RWD', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range RWD', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range AWD', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'N', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Ioniq 6': [
        { name: 'Standard Range RWD', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range RWD', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range AWD', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'H-1': [
        { name: '2.5D Deluxe', engineSize: 2500, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.5D Grand Starex', engineSize: 2500, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'Morning': [
        { name: '1.0 LX', engineSize: 1000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.0 LX+', engineSize: 1000, fuelType: 'PETROL', transmission: 'CVT' },
        { name: 'GT', engineSize: 1000, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Rio': [
        { name: '1.4 LX', engineSize: 1400, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.4 LX+', engineSize: 1400, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Cerato': [
        { name: '1.6 LX', engineSize: 1600, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.6 SX', engineSize: 1600, fuelType: 'PETROL', transmission: 'CVT' },
        { name: 'GT', engineSize: 1600, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'K3': [
        { name: '1.5 LX', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 SX', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'K5': [
        { name: '1.6T LX', engineSize: 1600, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.6T GT-Line', engineSize: 1600, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.0 HEV', engineSize: 2000, fuelType: 'HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Carnival': [
        { name: '2.2D LX', engineSize: 2200, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.2D SX', engineSize: 2200, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '3.5 SX Prestige', engineSize: 3500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'EV6': [
        { name: 'Standard Range RWD', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range RWD', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range AWD', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'GT', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'EV9': [
        { name: 'Standard Range RWD', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Long Range AWD', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'GT-Line', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Sonet': [
        { name: '1.5 LX', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.5 SX', engineSize: 1500, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.0T GT-Line', engineSize: 1000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Stinger': [
        { name: '2.0T', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '3.3T GT', engineSize: 3300, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '3.3T GT AWD', engineSize: 3300, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Tivoli': [
        { name: '1.5T 2WD', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.5T AWD', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Korando': [
        { name: '1.5T 2WD', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.5T AWD', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'e-Korando', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Rexton': [
        { name: '2.2D 4WD', engineSize: 2200, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.2D Ultimate', engineSize: 2200, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.2D 7-Seat', engineSize: 2200, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'Musso': [
        { name: '2.2D Standard', engineSize: 2200, fuelType: 'DIESEL', transmission: 'MANUAL' },
        { name: '2.2D Premium', engineSize: 2200, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: '2.2D Grand', engineSize: 2200, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'Torres': [
        { name: '1.5T 2WD', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.5T AWD', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'EVX', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    // === Batch 11: Supercar + Proton + TATA + Thairung ===
    '296 GTB': [
        { name: '296 GTB', engineSize: 3000, fuelType: 'PLUGIN_HYBRID', transmission: 'DCT' },
        { name: '296 GTB Assetto Fiorano', engineSize: 3000, fuelType: 'PLUGIN_HYBRID', transmission: 'DCT' },
    ],
    '296 GTS': [
        { name: '296 GTS', engineSize: 3000, fuelType: 'PLUGIN_HYBRID', transmission: 'DCT' },
        { name: '296 GTS Assetto Fiorano', engineSize: 3000, fuelType: 'PLUGIN_HYBRID', transmission: 'DCT' },
    ],
    'Roma': [
        { name: 'Roma', engineSize: 3900, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Roma Spider': [
        { name: 'Roma Spider', engineSize: 3900, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'SF90 Stradale': [
        { name: 'SF90 Stradale', engineSize: 4000, fuelType: 'PLUGIN_HYBRID', transmission: 'DCT' },
        { name: 'SF90 Spider', engineSize: 4000, fuelType: 'PLUGIN_HYBRID', transmission: 'DCT' },
        { name: 'SF90 XX Stradale', engineSize: 4000, fuelType: 'PLUGIN_HYBRID', transmission: 'DCT' },
    ],
    '812 Competizione': [
        { name: '812 Competizione', engineSize: 6500, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '812 Competizione A', engineSize: 6500, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Purosangue': [
        { name: 'Purosangue V12', engineSize: 6500, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'F8 Tributo': [
        { name: 'F8 Tributo', engineSize: 3900, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'F8 Spider', engineSize: 3900, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    '488': [
        { name: '488 GTB', engineSize: 3900, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '488 Spider', engineSize: 3900, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '488 Pista', engineSize: 3900, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Portofino M': [
        { name: 'Portofino M', engineSize: 3900, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Huracan': [
        { name: 'Huracan EVO RWD', engineSize: 5200, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'Huracan EVO AWD', engineSize: 5200, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'Huracan Sterrato', engineSize: 5200, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'Huracan Tecnica', engineSize: 5200, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Huracan Spyder': [
        { name: 'Huracan EVO RWD Spyder', engineSize: 5200, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'Huracan EVO Spyder AWD', engineSize: 5200, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Revuelto': [
        { name: 'Revuelto PHEV', engineSize: 6500, fuelType: 'PLUGIN_HYBRID', transmission: 'DCT' },
    ],
    'Urus': [
        { name: 'Urus', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Urus S', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Urus Performante', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Urus SE': [
        { name: 'Urus SE PHEV', engineSize: 4000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
    ],
    'Ghibli': [
        { name: 'Ghibli GT', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Ghibli Modena', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Ghibli Trofeo', engineSize: 3800, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Quattroporte': [
        { name: 'Quattroporte GT', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Quattroporte Modena', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Quattroporte Trofeo', engineSize: 3800, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Levante': [
        { name: 'Levante GT', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Levante Modena', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Levante Trofeo', engineSize: 3800, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'MC20': [
        { name: 'MC20', engineSize: 3000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'MC20 Cielo', engineSize: 3000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'MC20 Icona', engineSize: 3000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Grecale': [
        { name: 'Grecale GT', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Grecale Modena', engineSize: 2000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Grecale Trofeo', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Folgore EV', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'GranTurismo': [
        { name: 'GranTurismo Modena', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'GranTurismo Trofeo', engineSize: 3000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'GranTurismo Folgore EV', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Continental GT': [
        { name: 'Continental GT V8', engineSize: 4000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'Continental GT W12', engineSize: 6000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'Continental GT Speed', engineSize: 6000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Continental GTC': [
        { name: 'Continental GTC V8', engineSize: 4000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'Continental GTC W12', engineSize: 6000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Flying Spur': [
        { name: 'Flying Spur V8', engineSize: 4000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'Flying Spur W12', engineSize: 6000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'Flying Spur Speed', engineSize: 6000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'Flying Spur Hybrid', engineSize: 3000, fuelType: 'PLUGIN_HYBRID', transmission: 'DCT' },
    ],
    'Bentayga': [
        { name: 'Bentayga V8', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Bentayga EWB', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Bentayga Hybrid', engineSize: 3000, fuelType: 'PLUGIN_HYBRID', transmission: 'AUTOMATIC' },
        { name: 'Bentayga Speed', engineSize: 6000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Ghost': [
        { name: 'Ghost', engineSize: 6750, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Ghost Extended', engineSize: 6750, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Ghost Black Badge', engineSize: 6750, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Phantom': [
        { name: 'Phantom', engineSize: 6750, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Phantom Extended', engineSize: 6750, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Wraith': [
        { name: 'Wraith', engineSize: 6600, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Wraith Black Badge', engineSize: 6600, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Dawn': [
        { name: 'Dawn', engineSize: 6600, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Dawn Black Badge', engineSize: 6600, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Cullinan': [
        { name: 'Cullinan', engineSize: 6750, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Cullinan Black Badge', engineSize: 6750, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Cullinan Series II', engineSize: 6750, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Spectre': [
        { name: 'Spectre', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Vantage': [
        { name: 'Vantage', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Vantage Roadster', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Vantage F1 Edition', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'DB11': [
        { name: 'DB11 V8', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'DB11 AMR', engineSize: 5200, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'DB11 Volante V8', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'DB12': [
        { name: 'DB12 Coupe', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'DB12 Volante', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'DBS': [
        { name: 'DBS', engineSize: 5200, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'DBS Volante', engineSize: 5200, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'DBS 770 Ultimate', engineSize: 5200, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'DBX': [
        { name: 'DBX', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'DBX707', engineSize: 4000, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    '720S': [
        { name: '720S Coupe', engineSize: 4000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '720S Spider', engineSize: 4000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    '750S': [
        { name: '750S Coupe', engineSize: 4000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '750S Spider', engineSize: 4000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Artura': [
        { name: 'Artura', engineSize: 3000, fuelType: 'PLUGIN_HYBRID', transmission: 'DCT' },
        { name: 'Artura Spider', engineSize: 3000, fuelType: 'PLUGIN_HYBRID', transmission: 'DCT' },
        { name: 'Artura Trophy', engineSize: 3000, fuelType: 'PLUGIN_HYBRID', transmission: 'DCT' },
    ],
    'GT': [
        { name: 'GT Coupe', engineSize: 4000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    '765LT': [
        { name: '765LT Coupe', engineSize: 4000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '765LT Spider', engineSize: 4000, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'Emira': [
        { name: 'Emira V6 First Edition', engineSize: 3500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'Emira 4-cylinder', engineSize: 2000, fuelType: 'PETROL', transmission: 'DCT' },
        { name: 'Emira V6 GT Edition', engineSize: 3500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Eletre': [
        { name: 'Eletre', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Eletre S', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Eletre R', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Emeya': [
        { name: 'Emeya', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Emeya S', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
        { name: 'Emeya R', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Evija': [
        { name: 'Evija', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Saga': [
        { name: '1.3 Standard MT', engineSize: 1300, fuelType: 'PETROL', transmission: 'MANUAL' },
        { name: '1.3 Standard AT', engineSize: 1300, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.3 Premium MT', engineSize: 1300, fuelType: 'PETROL', transmission: 'MANUAL' },
        { name: '1.3 Premium AT', engineSize: 1300, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Persona': [
        { name: '1.6 Standard MT', engineSize: 1600, fuelType: 'PETROL', transmission: 'MANUAL' },
        { name: '1.6 Standard AT', engineSize: 1600, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.6 Premium AT', engineSize: 1600, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Iriz': [
        { name: '1.3 Standard', engineSize: 1300, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.6 Executive', engineSize: 1600, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'X50': [
        { name: '1.5T Standard', engineSize: 1500, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '1.5T Executive', engineSize: 1500, fuelType: 'PETROL', transmission: 'DCT' },
        { name: '1.5T Flagship', engineSize: 1500, fuelType: 'PETROL', transmission: 'DCT' },
    ],
    'X70': [
        { name: '1.8T Executive 2WD', engineSize: 1800, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.8T Premium AWD', engineSize: 1800, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'X90': [
        { name: '1.5T Executive', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '1.5T Premium AWD', engineSize: 1500, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'Exora': [
        { name: '1.6 CFE Standard', engineSize: 1600, fuelType: 'PETROL', transmission: 'CVT' },
        { name: '1.6 CFE Premium', engineSize: 1600, fuelType: 'PETROL', transmission: 'CVT' },
    ],
    'Nexon': [
        { name: '1.2T XM', engineSize: 1200, fuelType: 'PETROL', transmission: 'MANUAL' },
        { name: '1.2T XZ+', engineSize: 1200, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'EV', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Harrier': [
        { name: '2.0 XE', engineSize: 2000, fuelType: 'DIESEL', transmission: 'MANUAL' },
        { name: '2.0 XZ+', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
        { name: 'EV', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'Safari': [
        { name: '2.0 XE', engineSize: 2000, fuelType: 'DIESEL', transmission: 'MANUAL' },
        { name: '2.0 XZ+', engineSize: 2000, fuelType: 'DIESEL', transmission: 'AUTOMATIC' },
    ],
    'Punch': [
        { name: '1.2 Pure', engineSize: 1200, fuelType: 'PETROL', transmission: 'MANUAL' },
        { name: '1.2 Accomplished', engineSize: 1200, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: 'EV', engineSize: 0, fuelType: 'EV', transmission: 'AUTOMATIC' },
    ],
    'TR Transformer II': [
        { name: '2.7 4WD 4-Door', engineSize: 2700, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
        { name: '2.7 4WD 2-Door', engineSize: 2700, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
    ],
    'TR Adventure': [
        { name: '2.7 Adventure', engineSize: 2700, fuelType: 'PETROL', transmission: 'AUTOMATIC' },
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
