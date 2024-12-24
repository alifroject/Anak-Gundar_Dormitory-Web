import React, { useEffect, useState } from 'react';
import { dbFire } from "@/app/firebase/config";
import { collection, getDocs } from 'firebase/firestore';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { FaChartBar } from 'react-icons/fa'; // Import ikon untuk judul

// Register chart elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Tipe untuk data statistik
interface Stats {
    apartemen_bookings: number;
    kosan_bookings: number;
    month: string;
    total_bookings: number;
    unverified_bookings: number;
    day: { [key: string]: { total_transaksi: number; amount: number } };
}

// Tipe untuk data grafik
interface BarChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string;
        borderColor: string;
        borderWidth: number;
    }[];
}

interface PieChartData {
    labels: string[];
    datasets: {
        data: number[];
        backgroundColor: string[];
        hoverBackgroundColor: string[];
    }[];
}

const Auditing: React.FC = () => {
    const [stats, setStats] = useState<Stats[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string>('01'); // Default bulan Januari
    const [selectedYear, setSelectedYear] = useState<string>('2024'); // Default tahun 

    const currentMonth = new Date().getMonth() + 1; // getMonth() memberikan bulan 0-11, jadi tambah 1
    const currentYear = new Date().getFullYear();

    // Jika ini adalah pertama kali dimuat, set bulan dan tahun dengan nilai sekarang
    useEffect(() => {
        setSelectedMonth(String(currentMonth).padStart(2, '0')); // Menyusun format dua digit
        setSelectedYear(String(currentYear));
    }, []);

    const fetchStats = async (month: string, year: string) => {
        const querySnapshot = await getDocs(collection(dbFire, 'stats_booking'));
        const statsData: Stats[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const [monthDoc, yearDoc] = data.month.split("-");
            if (monthDoc === month && yearDoc === year) {
                statsData.push({
                    apartemen_bookings: data.apartemen_bookings,
                    kosan_bookings: data.kosan_bookings,
                    month: data.month,
                    total_bookings: data.total_bookings,
                    unverified_bookings: data.unverified_bookings,
                    day: data.day || {},
                });
            }
        });
        setStats(statsData);
    };


    // Data untuk grafik bar
    const barChartData: BarChartData = {
        labels: stats.map((stat) => stat.month),
        datasets: [
            {
                label: 'Apartemen Bookings',
                data: stats.map((stat) => stat.apartemen_bookings),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            },
            {
                label: 'Kosan Bookings',
                data: stats.map((stat) => stat.kosan_bookings),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }
        ]
    };


    const pieChartData: PieChartData = {
        labels: ['Total Bookings', 'Unverified Bookings'],
        datasets: [
            {
                data: [stats.reduce((sum, stat) => sum + stat.total_bookings, 0), stats.reduce((sum, stat) => sum + stat.unverified_bookings, 0)],
                backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
                hoverBackgroundColor: ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)']
            }
        ]
    };


    const getMonthName = (month: string) => {
        const months = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        const [monthNumber, year] = month.split("-");
        return `${months[parseInt(monthNumber) - 1]} ${year}`;
    };

    useEffect(() => {
        fetchStats(selectedMonth, selectedYear);
    }, [selectedMonth, selectedYear]);


    return (
        <div className=" bg-gray-800 mx-auto p-6">
            <div className="flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-300 p-6 rounded-xl shadow-lg mb-8">
                <h1 className="md:text-4xl text-[25px] font-extrabold text-gray-800">
                    <FaChartBar className="inline mr-3 text-blue-700" />
                    Grafik Statistik
                </h1>
            </div>

            {/* Flex wrapper untuk dropdowns */}
            <div className="flex flex-col md:flex-row justify-center mt-20 gap-8 mb-10">
                <div className="flex flex-col items-center">
                    <select
                        id="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="p-3 text-gray-800 text-lg border border-gray-300 rounded-md shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    >
                        {[
                            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                        ].map((monthName, index) => (
                            <option key={index} value={String(index + 1).padStart(2, '0')}>
                                {monthName}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col items-center">
                    <select
                        id="year"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="p-3 text-gray-800 text-lg border border-gray-300 rounded-md shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    >
                        {['2023', '2024', '2025'].map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Menampilkan data statistik */}
            {stats.length === 0 ? (
                <div className="flex items-center justify-center h-screen text-center">
                    <h2 className="text-xl font-semibold text-white-700">
                        Tidak ada data untuk bulan {getMonthName(`${selectedMonth}-${selectedYear}`)}.
                    </h2>
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="flex flex-col items-center mb-8">
                            {/* Box untuk grafik dan data */}
                            <div className="flex flex-col gap-8 mb-4 w-full md:flex-row p-4 border-2 border-gray-300 rounded-lg shadow-lg">
                                {/* Grafik Bar */}
                                <div className="w-full h-[500px] bg-white rounded-lg shadow-lg p-10">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Bar Chart - Bookings</h3>
                                    <Bar
                                        data={{
                                            ...barChartData,
                                            labels: [stat.month],
                                            datasets: [
                                                {
                                                    ...barChartData.datasets[0],
                                                    data: [stat.apartemen_bookings]
                                                },
                                                {
                                                    ...barChartData.datasets[1],
                                                    data: [stat.kosan_bookings]
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                tooltip: {
                                                    callbacks: {
                                                        label: (context: any) => {
                                                            let label = context.dataset.label || '';
                                                            if (label) {
                                                                label += ': ';
                                                            }
                                                            label += context.raw;
                                                            return label;
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>

                                {/* Grafik Pie */}
                                <div className="w-full h-[500px] bg-white rounded-lg shadow-lg p-4">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Pie Chart - Total vs Unverified</h3>
                                    <Pie
                                        data={{
                                            ...pieChartData,
                                            datasets: [
                                                {
                                                    ...pieChartData.datasets[0],
                                                    data: [stat.total_bookings, stat.unverified_bookings]
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                tooltip: {
                                                    callbacks: {
                                                        label: (context: any) => {
                                                            let label = context.label || '';
                                                            let value = context.raw || 0;
                                                            return `${label}: ${value}`;
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Grafik bar per hari */}
                            <div className="flex flex-col gap-8 w-full">
                                {Object.keys(stat.day).map((day, dayIndex) => (
                                    <div key={dayIndex} className="flex flex-col items-center">
                                        <div className="w-full p-4 border-2 border-gray-300 rounded-lg shadow-lg">
                                            <div className="w-full h-[500px] bg-white rounded-lg shadow-lg p-10 pb-20">
                                                <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Bar Chart - Total Transaksi (Hari {day})</h3>
                                                <Bar
                                                    data={{
                                                        labels: [`Hari ke-${day}`],
                                                        datasets: [{
                                                            label: 'Jumlah Gross Amount (Rp)',
                                                            data: [stat.day[day]?.amount || 0],
                                                            backgroundColor: 'rgba(255, 99, 132, 0.6)',
                                                            borderColor: 'rgba(255, 99, 132, 1)',
                                                            borderWidth: 1,
                                                        }]
                                                    }}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        plugins: {
                                                            tooltip: {
                                                                callbacks: {
                                                                    label: (context: any) => {
                                                                        const label = context.dataset.label || '';
                                                                        const value = context.raw || 0;
                                                                        const dayNumber = context.label.replace(/[^\d]/g, '');  // Hanya mengambil angka dari string "Hari 24"

                                                                        // Pastikan bahwa dayNumber sudah sesuai dengan key di stat.day
                                                                        const transactions = stat.day[dayNumber]?.total_transaksi ?? 0;

                                                                        return `${label}: ${value}, dan total transaksi: ${transactions}`;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

    );
};

export default Auditing;
