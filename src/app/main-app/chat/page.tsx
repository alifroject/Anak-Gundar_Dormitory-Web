"use client";

import React from 'react';
import Layout from '@/app/main-app/layout';

const Chat = () => {
    return (
        <>
            <Layout>
                <div className=""> {/* Set both width and height to full */}

                    <div className="bg-white rounded-lg shadow-lg p-6 flex items-center">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-800">
                                Daftarkan Kos Anda di Anak Gundar
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Berbagai fitur dan layanan untuk meningkatkan bisnis kos Anda
                            </p>
                            <button className="mt-4 px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition">
                                Pelajari Lebih Lanjut
                            </button>
                        </div>
                        <div className="ml-6">
                            <img
                                src="https://placehold.co/200x200"
                                alt="Two people looking at a phone"
                                className="rounded-lg"
                            />
                        </div>

                    </div>
                </div>
            </Layout>
        </>
    );
};

export default Chat;
