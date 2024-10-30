import React from 'react';
import Layout from '@/app/main-app/layout';
import Dropdown from '@/app/main-app/dashboard/dropdown'

const Dashboard = () => {
    return (
        <>
            <Layout>
                <div className='m-0'>
                    <div className="bg-white ml-2 rounded-lg xs:m-0 shadow-lg p-6 flex flex-col xs sm:flex-row items-center">
                        <div className="flex-1 mb-4 sm:mb-0">
                            <h1 className="text-2xl font-bold text-gray-800">
                                Segera cari kos
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Berbagai fitur dan layanan untuk mencari kos impian
                            </p>
                            <button className="mt-4 px-4 py-2 border border-blue-500 text-xs sm:text-sm md:text-base text-blue-500 rounded hover:bg-blue-500 hover:text-white transition">
                                Pelajari Lebih Lanjut
                            </button>

                        </div>
                        <div className="ml-0 sm:ml-6">
                            <img
                                src="https://placehold.co/200x200"
                                alt="Two people looking at a phone"
                                className="rounded-lg w-full sm:w-auto"
                            />
                        </div>
                    </div>

                    <div className='mt-4 ml-2 flex m-4 w-'><Dropdown></Dropdown></div>
                </div>
            </Layout>
        </>
    );
};

export default Dashboard;
