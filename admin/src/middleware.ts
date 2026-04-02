import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const hasSession = request.cookies.get('admin_session');
    const isLoginPage = request.nextUrl.pathname === '/login';

    if (!isLoginPage && !hasSession) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!login|_next/static|_next/image|favicon.ico|api).*)'],
};
