// src/app/main-app/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import AppLayout from './layout'; // Import the layout component
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation

const MainAppPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true); // State to manage loading

    useEffect(() => {
        const token = Cookies.get('authToken');
        if (!token) {
            router.push('/'); // Redirect to login if no token
        } else {
            setIsLoading(false); // Set loading to false if authenticated
        }
    }, [router]);

    if (isLoading) {
        return null; // Optionally return a loading spinner or nothing
    }

    return (
        <AppLayout>
            <h1 className="text-2xl text-black">Welcome to the Main App</h1>
            {/* Add your page content here */}
        </AppLayout>
    );
};

export default MainAppPage;
