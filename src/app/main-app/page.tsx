"use client";

import React, { useEffect, useState } from 'react';
import AppLayout from './layout';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const MainAppPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log("Checking for auth token...");
        const token = Cookies.get('authToken');
        if (!token) {
            console.log("No token found, redirecting...");
            router.push('/'); // Redirect to login if no token
        } else {
            console.log("Token found, loading page...");
            setIsLoading(false);
        }
    }, [router]);

    if (isLoading) {
        console.log("Loading...");
        return null; // Optionally show a spinner or loading message
    }

    return (
        <AppLayout>
            <h1 className="text-2xl text-black">Welcome to the Main App</h1>
        </AppLayout>
    );
};

export default MainAppPage;
