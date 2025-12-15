import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white py-10 mt-auto">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-xl font-bold mb-4">Car2Hand</h3>
                    <p className="text-gray-400">Your trusted marketplace for buying and selling second-hand cars with AI-powered valuations.</p>
                </div>
                <div>
                    <h4 className="font-bold mb-4">Quick Links</h4>
                    <ul className="space-y-2">
                        <li><Link href="/buy" className="text-gray-400 hover:text-white">Buy a Car</Link></li>
                        <li><Link href="/sell" className="text-gray-400 hover:text-white">Sell Your Car</Link></li>
                        <li><Link href="/knowledge" className="text-gray-400 hover:text-white">Knowledge Base</Link></li>
                        <li><Link href="/community" className="text-gray-400 hover:text-white">Community</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-4">Support</h4>
                    <ul className="space-y-2">
                        <li><Link href="/help" className="text-gray-400 hover:text-white">Help Center</Link></li>
                        <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
                        <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-4">About</h4>
                    <ul className="space-y-2">
                        <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                        <li><Link href="/services/inspection" className="text-gray-400 hover:text-white">Car Inspection</Link></li>
                        <li><Link href="/services/finance" className="text-gray-400 hover:text-white">Finance & Insurance</Link></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
                <p>&copy; {new Date().getFullYear()} Car2Hand. All rights reserved.</p>
            </div>
        </footer>
    );
}
