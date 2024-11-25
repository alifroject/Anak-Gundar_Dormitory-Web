import { motion } from "framer-motion";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

const teamMembers = [
    { name: "John Doe", role: "Backend and Frontend", image: "/images/john.jpg" },
    { name: "Jane Smith", role: "Figma Designer", image: "/images/jane.jpg" },
    { name: "Michael Johnson", role: "Bug Hunter And Software Tester", image: "/images/michael.jpg" },
    { name: "Emily Davis", role: "Data Collector", image: "/images/emily.jpg" },
    { name: "Chris Lee", role: "Data Collector", image: "/images/chris.jpg" },
];

export default function Career() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-indigo-200 flex flex-col items-center justify-center px-6 py-10">
            {/* Title Section */}
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

            {/* Box Section */}
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
                            className="w-24 h-24 rounded-full mb-4 border-4 border-indigo-500"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                        />
                        <h2 className="text-xl font-semibold text-gray-800">
                            {member.name}
                        </h2>
                        <p className="text-sm text-gray-600 text-center">
                            {member.role}
                        </p>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
