/**
 * Input Validation Schemas using Zod
 * OWASP: Input Validation
 */

import { z } from "zod";

// Custom validators
const phoneRegex = /^0[0-9]{9}$/;
const thaiEnglishRegex = /^[\u0E00-\u0E7Fa-zA-Z0-9\s\-_.]+$/;

/**
 * User Registration Schema
 */
export const registerSchema = z.object({
    fullName: z.string()
        .min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร')
        .max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร')
        .regex(thaiEnglishRegex, 'ชื่อต้องเป็นภาษาไทยหรืออังกฤษเท่านั้น'),

    email: z.string()
        .email('รูปแบบอีเมลไม่ถูกต้อง')
        .max(255, 'อีเมลต้องไม่เกิน 255 ตัวอักษร')
        .toLowerCase(),

    phoneNumber: z.string()
        .regex(phoneRegex, 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักและขึ้นต้นด้วย 0'),

    password: z.string()
        .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
        .max(72, 'รหัสผ่านต้องไม่เกิน 72 ตัวอักษร') // bcrypt limit
        .regex(/[A-Z]/, 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว')
        .regex(/[a-z]/, 'รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว')
        .regex(/[0-9]/, 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว')
});

/**
 * User Login Schema
 */
export const loginSchema = z.object({
    phoneNumber: z.string()
        .regex(phoneRegex, 'เบอร์โทรศัพท์ไม่ถูกต้อง'),

    password: z.string()
        .min(1, 'กรุณากรอกรหัสผ่าน')
        .max(72, 'รหัสผ่านไม่ถูกต้อง'),

    rememberMe: z.boolean().optional().default(false)
});
/**
 * Forgot Password Schema — request reset link by phone
 */
export const forgotPasswordSchema = z.object({
    phoneNumber: z.string()
        .regex(phoneRegex, 'เบอร์โทรศัพท์ไม่ถูกต้อง'),
});

/**
 * Reset Password Schema — verify token and set new password
 */
export const resetPasswordSchema = z.object({
    token: z.string()
        .min(1, 'token ไม่ถูกต้อง')
        .max(200, 'token ไม่ถูกต้อง'),

    password: z.string()
        .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
        .max(72, 'รหัสผ่านยาวเกินไป'),
});

/**
 * Contact Form Schema — for /contact page submissions
 */
export const contactSchema = z.object({
    name: z.string()
        .min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร')
        .max(100, 'ชื่อยาวเกินไป'),

    email: z.string()
        .email('อีเมลไม่ถูกต้อง')
        .max(200, 'อีเมลยาวเกินไป'),

    phoneNumber: z.string()
        .max(20, 'เบอร์โทรยาวเกินไป')
        .optional()
        .or(z.literal('')),

    subject: z.string()
        .min(1, 'กรุณาเลือกหัวข้อ')
        .max(100, 'หัวข้อยาวเกินไป'),

    message: z.string()
        .min(10, 'ข้อความต้องมีอย่างน้อย 10 ตัวอักษร')
        .max(5000, 'ข้อความยาวเกินไป'),
});

/**
 * Admin Login Schema
 */
export const adminLoginSchema = z.object({
    username: z.string()
        .min(1, 'กรุณากรอกชื่อผู้ใช้'),

    password: z.string()
        .min(1, 'กรุณากรอกรหัสผ่าน'),

    rememberMe: z.boolean().optional().default(false)
});

/**
 * Vehicle Listing Schema
 */
export const vehicleListingSchema = z.object({
    vehicleType: z.enum(['CAR', 'MOTORCYCLE'], {
        message: 'ประเภทยานพาหนะไม่ถูกต้อง'
    }),

    title: z.string()
        .min(10, 'หัวข้อต้องมีอย่างน้อย 10 ตัวอักษร')
        .max(200, 'หัวข้อต้องไม่เกิน 200 ตัวอักษร'),

    description: z.string()
        .max(5000, 'คำอธิบายต้องไม่เกิน 5000 ตัวอักษร')
        .optional()
        .nullable(),

    price: z.number()
        .positive('ราคาต้องมากกว่า 0')
        .max(100000000, 'ราคาต้องไม่เกิน 100,000,000 บาท'),

    brand: z.string()
        .min(1, 'กรุณาระบุยี่ห้อ')
        .max(100, 'ยี่ห้อต้องไม่เกิน 100 ตัวอักษร'),

    model: z.string()
        .min(1, 'กรุณาระบุรุ่น')
        .max(100, 'รุ่นต้องไม่เกิน 100 ตัวอักษร'),

    subModel: z.string()
        .max(100, 'รุ่นย่อยต้องไม่เกิน 100 ตัวอักษร')
        .optional()
        .nullable(),

    year: z.number()
        .int('ปีต้องเป็นจำนวนเต็ม')
        .min(1900, 'ปีไม่ถูกต้อง')
        .max(new Date().getFullYear() + 1, 'ปีไม่ถูกต้อง'),

    color: z.string()
        .min(1, 'กรุณาระบุสี')
        .max(50, 'สีต้องไม่เกิน 50 ตัวอักษร'),

    fuelType: z.enum(['PETROL', 'DIESEL', 'HYBRID', 'PLUGIN_HYBRID', 'EV', 'LPG', 'NGV'], {
        message: 'ประเภทเชื้อเพลิงไม่ถูกต้อง'
    }),

    transmission: z.enum(['AUTOMATIC', 'MANUAL', 'CVT', 'DCT', 'SEMI_AUTO'], {
        message: 'ประเภทเกียร์ไม่ถูกต้อง'
    }).optional().nullable(),

    engineSize: z.number()
        .positive('ขนาดเครื่องยนต์ต้องมากกว่า 0')
        .max(10000, 'ขนาดเครื่องยนต์ไม่ถูกต้อง')
        .optional()
        .nullable(),

    mileage: z.number()
        .min(0, 'เลขไมล์ต้องไม่ติดลบ')
        .max(10000000, 'เลขไมล์มากเกินไป')
        .optional()
        .nullable(),

    bodyType: z.enum(['SEDAN', 'HATCHBACK', 'SUV', 'MPV', 'PICKUP', 'COUPE', 'CONVERTIBLE', 'VAN', 'WAGON', 'SPORT', 'NAKED', 'CRUISER', 'TOURING', 'SCOOTER', 'CUB', 'TRAIL'], {
        message: 'ประเภทตัวถังไม่ถูกต้อง'
    }).optional().nullable(),

    plateProvince: z.string()
        .max(50)
        .optional()
        .nullable(),

    registrationType: z.enum(['FIRST_HAND', 'USED'], {
        message: 'ประเภทการจดทะเบียนไม่ถูกต้อง'
    }).optional().nullable(),

    condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR'], {
        message: 'สภาพรถไม่ถูกต้อง'
    }).optional().nullable(),


    hasAccident: z.boolean().default(false),
    hasModified: z.boolean().default(false),
    hasWarranty: z.boolean().default(false),

    province: z.string()
        .min(1, 'กรุณาระบุจังหวัด')
        .max(100),

    district: z.string()
        .max(100)
        .optional()
        .nullable()
});

/**
 * Update Listing Schema (partial)
 */
export const updateListingSchema = vehicleListingSchema.partial();

/**
 * Pagination Schema
 */
export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(12)
});

/**
 * ID Parameter Schema
 */
export const idParamSchema = z.object({
    id: z.string().uuid('ID ไม่ถูกต้อง')
});

/**
 * Validate and return parsed data or throw error
 */
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
    const result = schema.safeParse(data);

    if (!result.success) {
        const errors = result.error.issues.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message
        }));

        throw {
            status: 400,
            error: 'Validation Error',
            message: 'ข้อมูลไม่ถูกต้อง',
            errors
        };
    }

    return result.data;
};

/**
 * Article Schema
 */
export const articleSchema = z.object({
    title: z.string()
        .min(2, 'หัวข้อต้องมีอย่างน้อย 2 ตัวอักษร')
        .max(200, 'หัวข้อต้องไม่เกิน 200 ตัวอักษร'),

    content: z.string()
        .min(20, 'เนื้อหาต้องมีอย่างน้อย 20 ตัวอักษร'),

    excerpt: z.string()
        .max(500, 'คำโปรยต้องไม่เกิน 500 ตัวอักษร')
        .optional()
        .nullable(),

    categoryId: z.string().min(1, 'กรุณาเลือกหมวดหมู่'),

    featuredImage: z.string()
        .url('รูปแบบ URL รูปภาพไม่ถูกต้อง')
        .optional()
        .nullable(),

    status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT')
});

/**
 * Article Category Schema
 */
export const categorySchema = z.object({
    name: z.string()
        .min(1, 'ชื่อหมวดหมู่ต้องมีอย่างน้อย 1 ตัวอักษร')
        .max(100, 'ชื่อหมวดหมู่ต้องไม่เกิน 100 ตัวอักษร'),

    slug: z.string()
        .min(1, 'Slug ต้องมีอย่างน้อย 1 ตัวอักษร')
        .max(100, 'Slug ต้องไม่เกิน 100 ตัวอักษร')
        .regex(/^[a-z0-9-]+$/, 'Slug ต้องเป็นภาษาอังกฤษ ตัวเลข หรือขีดกลางเท่านั้น')
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VehicleListingInput = z.infer<typeof vehicleListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type ArticleInput = z.infer<typeof articleSchema>;
