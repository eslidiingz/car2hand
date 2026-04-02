import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/profile', '/sell/create', '/sell/edit'];

export function middleware(request: NextRequest) {
    const hasSession = request.cookies.get('has_session');
    const isProtected = PROTECTED_PATHS.some(p =>
        request.nextUrl.pathname.startsWith(p)
    );

    if (isProtected && !hasSession) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/profile/:path*', '/sell/:path*'],
};
