"use client";

import { Bell, BellOff, BellRing } from 'lucide-react';
import { useWebPush } from '@/hooks/useWebPush';
import { useState } from 'react';

/**
 * User-facing toggle for Web Push notifications.
 *
 * Place this in Settings / Notification preferences.
 * Automatically hides itself on unsupported browsers (old Safari, etc.).
 */
export default function PushNotificationToggle() {
  const { supported, permission, subscribed, ready, busy, subscribe, unsubscribe, sendTest } = useWebPush();
  const [testSent, setTestSent] = useState<null | 'ok' | 'error'>(null);

  if (!ready) {
    return (
      <div className="h-20 bg-gray-50 rounded-2xl animate-pulse" aria-hidden />
    );
  }

  if (!supported) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-gray-500 flex items-start gap-3">
        <BellOff size={20} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-gray-700">เบราว์เซอร์ไม่รองรับการแจ้งเตือน</p>
          <p className="text-xs mt-1">ลองใช้ Chrome, Edge, หรือ Firefox เวอร์ชันล่าสุด เพื่อรับการแจ้งเตือน</p>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-sm flex items-start gap-3">
        <BellOff size={20} className="flex-shrink-0 mt-0.5 text-orange-500" />
        <div>
          <p className="font-bold text-gray-800">การแจ้งเตือนถูกปิด</p>
          <p className="text-xs text-gray-600 mt-1">
            คุณปิดกั้นการแจ้งเตือนไว้ในเบราว์เซอร์ — เปิดได้ที่เมนู &quot;Site Settings&quot; หรือไอคอน 🔒 ข้างที่อยู่เว็บ
          </p>
        </div>
      </div>
    );
  }

  const handleToggle = async () => {
    if (subscribed) {
      await unsubscribe();
    } else {
      const ok = await subscribe();
      if (ok) {
        // Auto-send a welcome test so the user sees it works
        await sendTest();
        setTestSent('ok');
        setTimeout(() => setTestSent(null), 4000);
      }
    }
  };

  const handleTest = async () => {
    const ok = await sendTest();
    setTestSent(ok ? 'ok' : 'error');
    setTimeout(() => setTestSent(null), 3000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${subscribed ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
          {subscribed ? <BellRing size={20} /> : <Bell size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 text-sm sm:text-base">การแจ้งเตือนผ่านเบราว์เซอร์</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            รับแจ้งเตือนเมื่อมีข้อความใหม่ ประกาศถูกอนุมัติ หรือแพ็กเกจใกล้หมดอายุ แม้ไม่ได้เปิดเว็บไว้
          </p>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <button
              onClick={handleToggle}
              disabled={busy}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition disabled:opacity-60 ${
                subscribed
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-primary text-white hover:bg-opacity-90'
              }`}
            >
              {busy ? 'กำลังดำเนินการ...' : subscribed ? 'ปิดการแจ้งเตือน' : 'เปิดการแจ้งเตือน'}
            </button>
            {subscribed && (
              <button
                onClick={handleTest}
                disabled={busy}
                className="px-3 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:border-primary hover:text-primary transition disabled:opacity-60"
              >
                ทดสอบ
              </button>
            )}
            {testSent === 'ok' && (
              <span className="text-xs text-green-600 font-medium">ส่งแล้ว — ตรวจสอบที่แถบแจ้งเตือน</span>
            )}
            {testSent === 'error' && (
              <span className="text-xs text-red-500 font-medium">ส่งไม่สำเร็จ ลองใหม่อีกครั้ง</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
