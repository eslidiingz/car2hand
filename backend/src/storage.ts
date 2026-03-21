import * as Minio from 'minio';
import sharp from 'sharp';

// MinIO Client Configuration
export const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});

// Single bucket for all uploads
export const BUCKET = process.env.MINIO_BUCKET || 'uploads';

// =============================================
// Path Builders - สร้าง path ตามโครงสร้าง
// =============================================

/**
 * สร้าง path สำหรับ avatar
 * Structure: {userId}/avatar/{filename}
 */
export function buildAvatarPath(userId: string, filename: string): string {
    return `${userId}/avatar/${filename}`;
}

/**
 * สร้าง path สำหรับรูป listing
 * Structure: {userId}/listings/{listingId}/{filename}
 */
export function buildListingImagePath(userId: string, listingId: string, filename: string): string {
    return `${userId}/listings/${listingId}/${filename}`;
}

/**
 * สร้าง path สำหรับรูปบทความ
 * Structure: admin/articles/{filename}
 */
export function buildArticlePath(filename: string): string {
    return `articles/${filename}`;
}


// =============================================
// URL Builders
// =============================================

/**
 * สร้าง public URL สำหรับเข้าถึงไฟล์
 */
export function getPublicUrl(objectPath: string): string {
    const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
    const port = process.env.MINIO_PORT || '9000';
    const useSSL = process.env.MINIO_USE_SSL === 'true';
    const protocol = useSSL ? 'https' : 'http';
    return `${protocol}://${endpoint}:${port}/${BUCKET}/${objectPath}`;
}

// =============================================
// File Upload Functions
// =============================================

/**
 * อัพโหลดไฟล์ทั่วไป
 */
export async function uploadFile(
    objectPath: string,
    buffer: Buffer,
    contentType: string
): Promise<string> {
    await minioClient.putObject(BUCKET, objectPath, buffer, buffer.length, {
        'Content-Type': contentType,
    });
    return getPublicUrl(objectPath);
}

/**
 * แปลงรูปภาพเป็น WebP format
 * @param buffer - Buffer ของรูปภาพเดิม
 * @param quality - คุณภาพ WebP (1-100, default: 80)
 * @returns Buffer ของรูปภาพ WebP
 */
export async function convertToWebP(
    buffer: Buffer,
    quality: number = 80
): Promise<Buffer> {
    return sharp(buffer)
        .webp({ quality })
        .toBuffer();
}

/**
 * แปลงและ resize รูปภาพเป็น WebP
 * @param buffer - Buffer ของรูปภาพเดิม
 * @param options - ตัวเลือกการแปลง
 */
export async function processImage(
    buffer: Buffer,
    options: {
        maxWidth?: number;
        maxHeight?: number;
        quality?: number;
    } = {}
): Promise<Buffer> {
    const { maxWidth, maxHeight, quality = 80 } = options;

    return sharp(buffer)
        .resize({
            width: maxWidth,
            height: maxHeight,
            fit: 'inside',
            withoutEnlargement: true
        })
        .webp({ quality })
        .toBuffer();
}

/**
 * อัพโหลด Avatar - แปลงเป็น WebP อัตโนมัติ
 * @returns URL ของรูป avatar
 */
export async function uploadAvatar(
    userId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string }
): Promise<string> {
    // ลบ avatar เก่าก่อน (ถ้ามี)
    await deleteAvatarFiles(userId);

    // แปลงรูปเป็น WebP (ขนาดเล็กกว่าสำหรับ avatar)
    const webpBuffer = await processImage(file.buffer, {
        maxWidth: 400,
        maxHeight: 400
    });

    const baseFilename = generateFilename(file.originalname);
    const webpFilename = baseFilename.replace(/\.[^.]+$/, '.webp');
    const objectPath = buildAvatarPath(userId, webpFilename);

    return uploadFile(objectPath, webpBuffer, 'image/webp');
}

/**
 * อัพโหลดรูป Listing (รถ/มอเตอร์ไซค์) - แปลงเป็น WebP อัตโนมัติ
 * @returns URL ของรูป
 */
export async function uploadListingImage(
    userId: string,
    listingId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string },
    order?: number
): Promise<{ url: string; order: number }> {
    // แปลงรูปเป็น WebP
    const webpBuffer = await processImage(file.buffer, {
        maxWidth: 800
    });

    // สร้างชื่อไฟล์แบบ .webp
    const baseFilename = generateFilename(file.originalname);
    const webpFilename = baseFilename.replace(/\.[^.]+$/, '.webp');
    const filename = order !== undefined
        ? `${order}-${webpFilename}`
        : webpFilename;

    const objectPath = buildListingImagePath(userId, listingId, filename);
    const url = await uploadFile(objectPath, webpBuffer, 'image/webp');

    return { url, order: order ?? 0 };
}

/**
 * อัพโหลดรูปของ Article - แปลงเป็น WebP อัตโนมัติ
 * @returns URL ของรูป
 */
export async function uploadArticleImage(
    file: { buffer: Buffer; originalname: string; mimetype: string }
): Promise<string> {
    // แปลงรูปเป็น WebP
    const webpBuffer = await processImage(file.buffer, {
        maxWidth: 960,
        maxHeight: 640
    });

    // สร้างชื่อไฟล์แบบ .webp
    const baseFilename = generateFilename(file.originalname);
    const webpFilename = baseFilename.replace(/\.[^.]+$/, '.webp');
    const objectPath = buildArticlePath(webpFilename);

    return uploadFile(objectPath, webpBuffer, 'image/webp');
}


/**
 * อัพโหลดหลายรูปสำหรับ Listing
 */
export async function uploadListingImages(
    userId: string,
    listingId: string,
    files: Array<{ buffer: Buffer; originalname: string; mimetype: string }>
): Promise<Array<{ url: string; order: number }>> {
    const results = await Promise.all(
        files.map((file, index) => uploadListingImage(userId, listingId, file, index))
    );
    return results;
}

// =============================================
// File Delete Functions
// =============================================

/**
 * ลบไฟล์เดี่ยว
 */
export async function deleteFile(objectPath: string): Promise<void> {
    await minioClient.removeObject(BUCKET, objectPath);
}

/**
 * ลบไฟล์ทั้งหมดที่ขึ้นต้นด้วย prefix
 */
export async function deleteByPrefix(prefix: string): Promise<number> {
    const objectsList: string[] = [];
    const stream = minioClient.listObjects(BUCKET, prefix, true);

    return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
            if (obj.name) {
                objectsList.push(obj.name);
            }
        });

        stream.on('error', reject);

        stream.on('end', async () => {
            if (objectsList.length === 0) {
                resolve(0);
                return;
            }

            try {
                await minioClient.removeObjects(BUCKET, objectsList);
                resolve(objectsList.length);
            } catch (err) {
                reject(err);
            }
        });
    });
}

/**
 * ลบ Avatar ของ user
 */
export async function deleteAvatarFiles(userId: string): Promise<number> {
    const prefix = `${userId}/avatar/`;
    return deleteByPrefix(prefix);
}

/**
 * ลบรูปทั้งหมดของ Listing
 */
export async function deleteListingImages(userId: string, listingId: string): Promise<number> {
    const prefix = `${userId}/listings/${listingId}/`;
    return deleteByPrefix(prefix);
}

/**
 * ลบไฟล์ทั้งหมดของ User (เมื่อลบบัญชี)
 * รวมถึง avatar และ รูป listings ทั้งหมด
 */
export async function deleteUserFiles(userId: string): Promise<number> {
    const prefix = `${userId}/`;
    return deleteByPrefix(prefix);
}

// =============================================
// List Files Functions
// =============================================

/**
 * ดึงรายการไฟล์ตาม prefix
 */
export async function listFiles(prefix: string): Promise<Array<{ name: string; url: string; size: number }>> {
    const files: Array<{ name: string; url: string; size: number }> = [];
    const stream = minioClient.listObjects(BUCKET, prefix, true);

    return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
            if (obj.name) {
                files.push({
                    name: obj.name,
                    url: getPublicUrl(obj.name),
                    size: obj.size || 0,
                });
            }
        });

        stream.on('error', reject);
        stream.on('end', () => resolve(files));
    });
}

/**
 * ดึงรายการรูปของ Listing
 */
export async function getListingImages(userId: string, listingId: string): Promise<Array<{ name: string; url: string; size: number }>> {
    const prefix = `${userId}/listings/${listingId}/`;
    return listFiles(prefix);
}

// =============================================
// Utility Functions
// =============================================

/**
 * สร้างชื่อไฟล์ unique
 */
export function generateFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `${timestamp}-${random}.${ext}`;
}

/**
 * ตรวจสอบและสร้าง bucket ถ้ายังไม่มี
 */
export async function ensureBucket(): Promise<void> {
    const exists = await minioClient.bucketExists(BUCKET);
    if (!exists) {
        await minioClient.makeBucket(BUCKET);
        // Set bucket policy to public read
        const policy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Effect: 'Allow',
                    Principal: { AWS: ['*'] },
                    Action: ['s3:GetObject'],
                    Resource: [`arn:aws:s3:::${BUCKET}/*`],
                },
            ],
        };
        await minioClient.setBucketPolicy(BUCKET, JSON.stringify(policy));
        console.log(`✅ Created bucket: ${BUCKET}`);
    }
}

/**
 * ตรวจสอบว่าไฟล์เป็นรูปภาพหรือไม่
 */
export function isValidImageType(mimetype: string): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    return validTypes.includes(mimetype);
}

/**
 * ตรวจสอบขนาดไฟล์ (default: 10MB)
 */
export function isValidFileSize(size: number, maxSizeMB: number = 10): boolean {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return size <= maxBytes;
}

export default minioClient;
