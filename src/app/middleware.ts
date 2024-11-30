// app/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    console.log('Middleware executed');

    // Cek semua cookies
    const cookies = request.cookies;
    console.log('Cookies:', cookies);

    const authToken = cookies.get('authToken');
    const isAuthenticated = Boolean(authToken); 
    const path = request.nextUrl.pathname;

    console.log('Requested Path:', path);
    console.log('Is Authenticated:', isAuthenticated);


    if (!isAuthenticated && path.startsWith('/main-app')) {
        console.log('Redirecting to home because not authenticated');
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next(); 
}

// Config untuk middleware
export const config = {
    matcher: ['/main-app/:path*'], 
};
