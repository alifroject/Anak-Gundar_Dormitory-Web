// app/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    console.log('Middleware executed');

    // Cek semua cookies
    const cookies = request.cookies;
    console.log('Cookies:', cookies);

    const authToken = cookies.get('authToken'); // Dapatkan nilai authToken dari cookies
    const isAuthenticated = Boolean(authToken); // Cek apakah token ada
    const path = request.nextUrl.pathname;

    console.log('Requested Path:', path);
    console.log('Is Authenticated:', isAuthenticated);

    // Jika tidak terautentikasi dan mencoba mengakses /main-app
    if (!isAuthenticated && path.startsWith('/main-app')) {
        console.log('Redirecting to home because not authenticated');
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next(); // Lanjutkan jika terautentikasi
}

// Config untuk middleware
export const config = {
    matcher: ['/main-app/:path*'], // Middleware ini berlaku untuk semua rute di /main-app
};
