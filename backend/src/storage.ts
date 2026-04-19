import sharp from 'sharp';
import { getActiveProvider, getProviderByType } from './storage/factory';
import type { StorageProvider } from './storage/provider';

// Legacy single-bucket constant retained for callers that reference it directly.
export const BUCKET = process.env.MINIO_BUCKET || 'uploads';

// =============================================
// Path Builders - สร้าง path ตามโครงสร้าง
// =============================================

export function buildAvatarPath(userId: string, filename: string): string {
    return `${userId}/avatar/${filename}`;
}

export function buildListingImagePath(userId: string, listingId: string, filename: string): string {
    return `${userId}/listings/${listingId}/${filename}`;
}

export function buildArticlePath(filename: string): string {
    return `articles/${filename}`;
}

export function buildSellerLogoPath(userId: string, filename: string): string {
    return `${userId}/seller/logo/${filename}`;
}

export function buildSellerCoverPath(userId: string, filename: string): string {
    return `${userId}/seller/cover/${filename}`;
}

// =============================================
// URL Builders
// =============================================

// Synchronous version kept for backwards compatibility — synthesizes a MinIO URL
// from env even when the active provider differs. Callers that need a guaranteed
// active-provider URL should use `uploadFile` (which returns the correct URL) or
// call the async `getActiveProvider()` themselves.
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

export async function uploadFile(
    objectPath: string,
    buffer: Buffer,
    contentType: string
): Promise<string> {
    const provider = await getActiveProvider();
    return provider.upload(objectPath, buffer, contentType);
}

export async function convertToWebP(
    buffer: Buffer,
    quality: number = 80
): Promise<Buffer> {
    return sharp(buffer)
        .webp({ quality })
        .toBuffer();
}

export async function processImage(
    buffer: Buffer,
    options: {
        maxWidth?: number;
        maxHeight?: number;
        quality?: number;
        addWatermark?: boolean;
    } = {}
): Promise<Buffer> {
    const { maxWidth, maxHeight, quality = 80, addWatermark = false } = options;

    let image = sharp(buffer)
        .resize({
            width: maxWidth,
            height: maxHeight,
            fit: 'inside',
            withoutEnlargement: true
        });

    if (addWatermark) {
        const watermarkBuffer = await sharp('assets/watermark.svg')
            .extend({
                bottom: 16,
                right: 16,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .toBuffer();

        image = image.composite([{
            input: watermarkBuffer,
            gravity: 'southeast'
        }]);
    }

    return image
        .webp({ quality })
        .toBuffer();
}

export async function uploadAvatar(
    userId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string }
): Promise<string> {
    const webpBuffer = await processImage(file.buffer, {
        maxWidth: 300,
        maxHeight: 300
    });

    const baseFilename = generateFilename(file.originalname);
    const webpFilename = baseFilename.replace(/\.[^.]+$/, '.webp');
    const objectPath = buildAvatarPath(userId, webpFilename);

    const url = await uploadFile(objectPath, webpBuffer, 'image/webp');

    const allAvatars = await listFiles(`${userId}/avatar/`);
    const oldAvatars = allAvatars.filter(f => f.name !== objectPath);
    for (const old of oldAvatars) {
        try { await deleteFile(old.name); } catch { }
    }

    return url;
}

export async function uploadListingImage(
    userId: string,
    listingId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string },
    order?: number
): Promise<{ url: string; order: number }> {
    const webpBuffer = await processImage(file.buffer, {
        maxWidth: 800,
        addWatermark: true
    });

    const baseFilename = generateFilename(file.originalname);
    const webpFilename = baseFilename.replace(/\.[^.]+$/, '.webp');
    const filename = order !== undefined
        ? `${order}-${webpFilename}`
        : webpFilename;

    const objectPath = buildListingImagePath(userId, listingId, filename);
    const url = await uploadFile(objectPath, webpBuffer, 'image/webp');

    return { url, order: order ?? 0 };
}

export async function uploadArticleImage(
    file: { buffer: Buffer; originalname: string; mimetype: string }
): Promise<string> {
    const webpBuffer = await processImage(file.buffer, {
        maxWidth: 960,
        maxHeight: 640
    });

    const baseFilename = generateFilename(file.originalname);
    const webpFilename = baseFilename.replace(/\.[^.]+$/, '.webp');
    const objectPath = buildArticlePath(webpFilename);

    return uploadFile(objectPath, webpBuffer, 'image/webp');
}

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

export async function deleteFile(objectPath: string): Promise<void> {
    const provider = await getActiveProvider();
    await provider.delete(objectPath);
}

export async function deleteByPrefix(prefix: string): Promise<number> {
    const provider = await getActiveProvider();
    return provider.deleteByPrefix(prefix);
}

export async function deleteAvatarFiles(userId: string): Promise<number> {
    return deleteByPrefix(`${userId}/avatar/`);
}

export async function deleteListingImages(userId: string, listingId: string): Promise<number> {
    return deleteByPrefix(`${userId}/listings/${listingId}/`);
}

export async function deleteUserFiles(userId: string): Promise<number> {
    return deleteByPrefix(`${userId}/`);
}

// =============================================
// List Files Functions
// =============================================

export async function listFiles(prefix: string): Promise<Array<{ name: string; url: string; size: number }>> {
    const provider = await getActiveProvider();
    return provider.list(prefix);
}

export async function getListingImages(userId: string, listingId: string): Promise<Array<{ name: string; url: string; size: number }>> {
    return listFiles(`${userId}/listings/${listingId}/`);
}

// =============================================
// Utility Functions
// =============================================

export function generateFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `${timestamp}-${random}.${ext}`;
}

export async function ensureBucket(): Promise<void> {
    const provider = await getActiveProvider();
    await provider.ensureBucket();
}

export function isValidImageType(mimetype: string): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    return validTypes.includes(mimetype);
}

export function isValidFileSize(size: number, maxSizeMB: number = 10): boolean {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return size <= maxBytes;
}

/**
 * ดึง object path จาก URL — matches MinIO `/<bucket>/` shape and the configured
 * Cloudflare R2 public URL base. Stays synchronous for backwards compatibility
 * (DB rows can contain URLs from either provider, so both shapes are checked).
 */
export function extractObjectPath(url: string | null | undefined): string | null {
    if (!url) return null;

    const r2Base = (process.env.CLOUDFLARE_R2_PUBLIC_URL || '').replace(/\/+$/, '');
    if (r2Base) {
        const prefix = `${r2Base}/`;
        if (url.startsWith(prefix)) {
            return url.slice(prefix.length) || null;
        }
    }

    const bucketStr = `/${BUCKET}/`;
    if (url.includes(bucketStr)) {
        return url.split(bucketStr)[1] || null;
    }
    return null;
}

export async function deleteOldFile(oldUrl: string | null | undefined): Promise<boolean> {
    const objectPath = extractObjectPath(oldUrl);
    if (!objectPath) return false;
    try {
        await deleteFile(objectPath);
        return true;
    } catch (err) {
        console.warn('Failed to delete old file:', objectPath, err);
        return false;
    }
}

export type { StorageProvider };
export { getActiveProvider, getProviderByType };
