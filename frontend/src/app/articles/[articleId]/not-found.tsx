import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center bg-surface px-4">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบบทความ</h2>
                <p className="text-gray-500 mb-6">บทความนี้อาจถูกลบหรือไม่มีอยู่</p>
                <Link
                    href="/articles"
                    className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition inline-block"
                >
                    กลับไปหน้าคลังความรู้
                </Link>
            </div>
        </div>
    );
}
