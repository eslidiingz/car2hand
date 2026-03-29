/**
 * LINE Service Module
 * Pure utility functions for LINE Messaging API integration
 */

import prisma from "./db";

// ดึง LINE settings จาก SystemSetting
export async function getLineSettings() {
    const settings = await prisma.systemSetting.findMany({
        where: { key: { startsWith: 'line.' } }
    });
    const map: Record<string, string> = {};
    settings.forEach(s => { map[s.key] = s.value; });
    return {
        channelId: map['line.channelId'] || '',
        channelSecret: map['line.channelSecret'] || '',
        channelAccessToken: map['line.channelAccessToken'] || '',
        loginChannelId: map['line.loginChannelId'] || '',
        loginChannelSecret: map['line.loginChannelSecret'] || '',
    };
}

// ทดสอบ connection
export async function testLineConnection(): Promise<{ success: boolean; botName?: string; error?: string }> {
    const { channelAccessToken } = await getLineSettings();
    if (!channelAccessToken) return { success: false, error: 'ยังไม่ได้ตั้งค่า Channel Access Token' };
    try {
        const res = await fetch('https://api.line.me/v2/bot/info', {
            headers: { Authorization: `Bearer ${channelAccessToken}` }
        });
        if (!res.ok) return { success: false, error: `LINE API Error: ${res.status}` };
        const data = await res.json();
        return { success: true, botName: data.displayName };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// ส่ง push message หา user คนเดียว
export async function pushMessage(lineUserId: string, messages: any[]) {
    const { channelAccessToken } = await getLineSettings();
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${channelAccessToken}`,
        },
        body: JSON.stringify({ to: lineUserId, messages }),
    });
    return { ok: res.ok, status: res.status };
}

// ส่ง multicast หลายคน (max 500 per request)
export async function multicast(lineUserIds: string[], messages: any[]) {
    const { channelAccessToken } = await getLineSettings();
    let totalSent = 0, totalFailed = 0;
    // batch of 500
    for (let i = 0; i < lineUserIds.length; i += 500) {
        const batch = lineUserIds.slice(i, i + 500);
        const res = await fetch('https://api.line.me/v2/bot/message/multicast', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${channelAccessToken}`,
            },
            body: JSON.stringify({ to: batch, messages }),
        });
        if (res.ok) totalSent += batch.length;
        else totalFailed += batch.length;
    }
    return { totalSent, totalFailed };
}

// สร้าง text message
export function buildTextMessage(text: string) {
    return [{ type: 'text', text }];
}

// แทนตัวแปรใน template
export function replaceVariables(content: string, data: Record<string, string>): string {
    return content.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || '');
}
