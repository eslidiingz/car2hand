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
    { name: 'Toyota', nameTh: 'โตโยต้า', country: 'Japan', isPopular: true, order: 1, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/toyota.png' },
    { name: 'Lexus', nameTh: 'เลกซัส', country: 'Japan', isPopular: false, order: 2, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/lexus.png' },
    { name: 'Honda', nameTh: 'ฮอนด้า', country: 'Japan', isPopular: true, order: 3, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/honda.png' },
    { name: 'Isuzu', nameTh: 'อีซูซุ', country: 'Japan', isPopular: true, order: 4, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/isuzu.png' },
    { name: 'Mitsubishi', nameTh: 'มิตซูบิชิ', country: 'Japan', isPopular: true, order: 5, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mitsubishi.png' },
    { name: 'Mazda', nameTh: 'มาสด้า', country: 'Japan', isPopular: true, order: 6, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mazda.png' },
    { name: 'Nissan', nameTh: 'นิสสัน', country: 'Japan', isPopular: true, order: 7, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/nissan.png' },
    { name: 'Suzuki', nameTh: 'ซูซูกิ', country: 'Japan', isPopular: false, order: 8, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/suzuki.png' },
    { name: 'Subaru', nameTh: 'ซูบารุ', country: 'Japan', isPopular: false, order: 9, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/subaru.png' },

    // 2. แบรนด์จีน (กลุ่มดาวรุ่งและ EV)
    { name: 'BYD', nameTh: 'บีวายดี', country: 'China', isPopular: true, order: 10, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/byd.png' },
    { name: 'GWM', nameTh: 'เกรท วอลล์ มอเตอร์', country: 'China', isPopular: true, order: 11, logo: 'https://www.grandprix.co.th/wp-content/uploads/2025/06/2025-GWM-Logo-RGB-Digital_2-1-1-660x400.png' },
    { name: 'MG', nameTh: 'เอ็มจี', country: 'China', isPopular: true, order: 12, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mg.png' },
    { name: 'NETA', nameTh: 'เนต้า', country: 'China', isPopular: true, order: 13, logo: 'https://yt3.googleusercontent.com/QfhyKq0NKTVJPVYo2_umEltjZFZafyRGEQhoe64C_06dOOibpywmeBFtWBcFTqAGnaIwYirn=s160-c-k-c0x00ffffff-no-rj' },
    { name: 'Changan', nameTh: 'ฉางอัน', country: 'China', isPopular: false, order: 14, logo: '' },
    { name: 'AION', nameTh: 'ไอออน', country: 'China', isPopular: false, order: 15, logo: '' },
    { name: 'Omoda', nameTh: 'โอโมด้า', country: 'China', isPopular: false, order: 16, logo: '' },
    { name: 'Jaecoo', nameTh: 'เจโก้', country: 'China', isPopular: false, order: 17, logo: '' },
    { name: 'XPeng', nameTh: 'เอ็กซ์เผิง', country: 'China', isPopular: false, order: 18, logo: '' },
    { name: 'Zeekr', nameTh: 'ซีคเกอร์', country: 'China', isPopular: false, order: 19, logo: '' },
    { name: 'Wuling', nameTh: 'วู่หลิง', country: 'China', isPopular: false, order: 20, logo: '' },
    { name: 'Volvo', nameTh: 'วอลโว่', country: 'Sweden', isPopular: false, order: 21, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/volvo.png' },

    // 3. แบรนด์ยุโรป (กลุ่มหรูหราและสมรรถนะ)
    { name: 'Mercedes-Benz', nameTh: 'เมอร์เซเดส-เบนซ์', country: 'Germany', isPopular: true, order: 22, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mercedes-benz.png' },
    { name: 'BMW', nameTh: 'บีเอ็มดับเบิลยู', country: 'Germany', isPopular: true, order: 23, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/bmw.png' },
    { name: 'Audi', nameTh: 'ออดี้', country: 'Germany', isPopular: false, order: 24, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/audi.png' },
    { name: 'Mini', nameTh: 'มินิ', country: 'UK', isPopular: false, order: 25, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mini.png' },
    { name: 'Porsche', nameTh: 'ปอร์เช่', country: 'Germany', isPopular: false, order: 26, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/porsche.png' },
    { name: 'Peugeot', nameTh: 'เปอโยต์', country: 'France', isPopular: false, order: 27, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/peugeot.png' },
    { name: 'Volkswagen', nameTh: 'โฟล์คสวาเกน', country: 'Germany', isPopular: false, order: 28, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/volkswagen.png' },
    { name: 'Land Rover', nameTh: 'แลนด์โรเวอร์', country: 'UK', isPopular: false, order: 29, logo: '' },
    { name: 'Jaguar', nameTh: 'จากัวร์', country: 'UK', isPopular: false, order: 30, logo: '' },

    // 4. แบรนด์อเมริกัน
    { name: 'Ford', nameTh: 'ฟอร์ด', country: 'USA', isPopular: true, order: 31, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/ford.png' },
    { name: 'Tesla', nameTh: 'เทสล่า', country: 'USA', isPopular: false, order: 32, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/tesla.png' },
    { name: 'Jeep', nameTh: 'จี๊ป', country: 'USA', isPopular: false, order: 33, logo: '' },

    // 5. แบรนด์เกาหลี
    { name: 'Hyundai', nameTh: 'ฮุนได', country: 'South Korea', isPopular: false, order: 34, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/hyundai.png' },
    { name: 'Kia', nameTh: 'เกีย', country: 'South Korea', isPopular: false, order: 35, logo: 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/kia.png' },

    // 6. แบรนด์ Supercar & Ultra Luxury (มีตัวแทนจำหน่ายทางการ)
    { name: 'Ferrari', nameTh: 'เฟอร์รารี่', country: 'Supercar', isPopular: false, order: 36, logo: '' },
    { name: 'Lamborghini', nameTh: 'แลมโบกินี่', country: 'Supercar', isPopular: false, order: 37, logo: '' },
    { name: 'Maserati', nameTh: 'มาเซราติ', country: 'Supercar', isPopular: false, order: 38, logo: '' },
    { name: 'Bentley', nameTh: 'เบนท์ลีย์', country: 'Supercar', isPopular: false, order: 39, logo: '' },
    { name: 'Rolls-Royce', nameTh: 'โรลส์-รอยซ์', country: 'Supercar', isPopular: false, order: 40, logo: '' },
    { name: 'Aston Martin', nameTh: 'แอสตัน มาร์ติน', country: 'Supercar', isPopular: false, order: 41, logo: '' },
    { name: 'McLaren', nameTh: 'แม็คลาเรน', country: 'Supercar', isPopular: false, order: 42, logo: '' },
    { name: 'Lotus', nameTh: 'โลตัส', country: 'Supercar', isPopular: false, order: 43, logo: '' },
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
        { name: 'Series 3', bodyType: 'SEDAN', isPopular: true },
        { name: 'Series 5', bodyType: 'SEDAN', isPopular: true },
        { name: 'Series 7', bodyType: 'SEDAN' },
        { name: 'X1', bodyType: 'SUV', isPopular: true },
        { name: 'X3', bodyType: 'SUV', isPopular: true },
        { name: 'X5', bodyType: 'SUV' },
        { name: 'X7', bodyType: 'SUV' },
        { name: 'Z4', bodyType: 'CONVERTIBLE' },
        { name: 'iX', bodyType: 'SUV' },
        { name: 'iX3', bodyType: 'SUV' },
        { name: 'i4', bodyType: 'SEDAN' },
        { name: 'i7', bodyType: 'SEDAN' },
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
