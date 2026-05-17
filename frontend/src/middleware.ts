import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Note: /sell (the create form) is intentionally NOT protected — guests can
// fill the whole form; login is enforced only at the publish step. /sell/edit
// stays protected (owners only).
const PROTECTED_PATHS = ['/profile', '/sell/edit'];

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
