import { motion } from "framer-motion";
import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faTimes } from '@fortawesome/free-solid-svg-icons';

// Definisikan tipe untuk anggota tim
interface TeamMember {
    name: string;
    role: string;
    image: string;
}

const teamMembers: TeamMember[] = [
    { name: "Alif Jovani Safik", role: "Backend and Frontend", image: "/Alif.jpg" },
    { name: "Achmad Raihan", role: "Figma Designer", image: "/Raihan.png" },
    { name: "Kaka Arsya Permana", role: "Bug Hunter And Software Tester", image: "/Kaka.png" },
    { name: "Ajji Tana Arifainy", role: "Data Collector", image: "/Aji.jpg" },
    { name: "Alvaro Cesio Nehemia Silitonga", role: "Data Collector", image: "/Alvaro.png" },
];

const Career: React.FC = () => {
    // State untuk mengontrol modal dan gambar yang dipilih
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string>("");

    // Fungsi untuk membuka modal dan menyetel gambar yang dipilih
    const openModal = (image: string) => {
        setSelectedImage(image);
        setIsModalOpen(true);
    };

    // Fungsi untuk menutup modal
    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-indigo-200 flex flex-col items-center justify-center px-6 py-10">
            <motion.div
                className="flex flex-col items-center mb-10"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
            >
                <div className="bg-indigo-500 text-white p-4 rounded-full shadow-lg mb-4">
                    <FontAwesomeIcon icon={faUsers} className="text-4xl" />
                </div>
                <div className="flex justify-center items-center ">
                    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-8 py-6 rounded-lg shadow-lg w-full max-w-3xl">
                        <h1
                            className="text-3xl md:text-4xl text-[20px] font-bold text-center tracking-wide leading-tight"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            Anggota Kelompok 6
                        </h1>
                    </div>
                </div>

                <p className="text-gray-600 mt-4 text-center md:text-lg max-w-2xl">
                    Berikut adalah daftar anggota kelompok kami dengan peran masing-masing.
                </p>
            </motion.div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.3 },
                    },
                }}
            >
                {teamMembers.map((member, index) => (
                    <motion.div
                        key={index}
                        className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center transition-transform transform hover:scale-105 hover:shadow-2xl"
                        variants={{
                            hidden: { opacity: 0, y: 50 },
                            visible: { opacity: 1, y: 0 },
                        }}
                    >
                        <motion.img
                            src={member.image}
                            alt={member.name}
                            className="w-40 h-40 rounded-full mb-4 border-4 border-indigo-500 cursor-pointer"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => openModal(member.image)}  // Menangani klik pada gambar
                        />
                        <h2 className="text-xl md:text-[25px] font-semibold text-gray-800">
                            {member.name}
                        </h2>
                        <p className="text-sm md:text-[15px] text-gray-600 text-center">
                            {member.role}
                        </p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Modal untuk gambar besar */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl w-full relative">
                        {/* Tombol Close */}
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 shadow-md hover:bg-red-600 transition-all ease-in-out duration-300"
                        >
                            <FontAwesomeIcon icon={faTimes} className="text-xl" />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Large View"
                            className="w-full h-auto max-w-full max-h-[80vh] object-contain rounded-lg"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Career;
