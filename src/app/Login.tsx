"use client";
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    FacebookAuthProvider,
    GoogleAuthProvider,
} from "firebase/auth";
import { auth, dbFire } from "@/app/firebase/config"; // Import db for Firestore
import { doc, setDoc, getDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF } from "@fortawesome/free-brands-svg-icons";
import Cookies from "js-cookie";


interface LoginProps {
    onClose: () => void;
    onLoginSuccess: () => void;
    originPath: string;
    onLoginSubmit: () => void; // Add this property to LoginProps
}

const Login: React.FC<LoginProps> = ({ onClose, onLoginSuccess, originPath, onLoginSubmit }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState(""); // New state for email
    const [password, setPassword] = useState(""); // New state for password
    const [isAdminMode, setIsAdminMode] = useState(false); // State for admin mode
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);



    interface User {
        uid: string;
        email: string | null;
        displayName?: string | null;
    }



    useEffect(() => {
        setIsOpen(true);
        const handleOutsideClick = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                handleClose();
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const handleAdminModeToggle = () => {
        setIsAdminMode(!isAdminMode);
        setEmail("");
        setPassword("");
    };

    const createUserDocument = async (user: User) => {
        try {
            const userDocRef = doc(dbFire, "user", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    email: user.email,
                    displayName: user.displayName || "Anonymous",
                });
            }
        } catch (error) {
            console.error("Error creating user document:", error);
        }
    };


    const createAdminDocument = async (userData: {
        uid: string;
        email: string | null;
        image_profile: string;
        password: string;
        role: string;
        username: string;
    }) => {
        try {
            const adminDocRef = doc(dbFire, "user", userData.uid); // Assuming you store admin data separately
            const adminDoc = await getDoc(adminDocRef);
            if (!adminDoc.exists()) {
                await setDoc(adminDocRef, userData);
                console.log("Admin document created successfully:", userData);
            } else {
                console.log("Admin document already exists:", userData.uid);
            }
        } catch (error) {
            console.error("Error creating/updating admin document:", error);
        }
    };
    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const token = await user.getIdToken();
            Cookies.set("authToken", token, { expires: 1 });
            const userDocument = {
                uid: user.uid,
                email: user.email || "",
                image_profile: user.photoURL || "", // or default image
                password: "", // Optional: Don't store plaintext passwords
                role: "user", // Default role
                username: user.displayName || "Anonymous",
            };
            onLoginSubmit();
            setIsModalOpen(true); // Tampilkan modal
            await createAdminDocument(userDocument);
            handleClose();
            router.push(originPath || "/");
        } catch (error) {
            console.error("Login Error:", error);
            alert(`Error: ${(error as Error).message}`);
        }
    };


    const handleFacebookLogin = async () => {
        const provider = new FacebookAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const token = await user.getIdToken();
            Cookies.set("authToken", token, { expires: 1 });
            const userDocument = {
                uid: user.uid,
                email: user.email || "",
                image_profile: user.photoURL || "", // or default image
                password: "", // Optional: Don't store plaintext passwords
                role: "user", // Default role
                username: user.displayName || "Anonymous",
            };
            await createAdminDocument(userDocument);
            handleClose();
            if (onLoginSuccess) onLoginSuccess();  // Call onLoginSuccess if provided
            router.push("/");
        } catch (error) {
            console.error("Login Error:", error);
        }
    };




    const handleEmailLogin = async () => {
        try {
            console.log("Attempting to sign in...");
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Sign in successful:", userCredential);
            const user = userCredential.user;

            // Check if the user is an admin (this can be modified based on your authentication logic)
            const isAdmin = (email === "admin@gmail.com"); // Example admin check

            if (isAdmin) {
                const adminData = {
                    uid: user.uid,
                    email: user.email,
                    image_profile: "", // Default empty string for image_profile
                    password: password, // The password used for login (consider hashing in production)
                    role: "admin",      // Set role as admin
                    username: "admin",  // Set username as admin
                };
                await createAdminDocument(adminData); // Call the admin document creation function
            } else {
                const userData = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || "Anonymous", // For regular users
                };
                await createUserDocument(userData); // Call the existing user document creation function
            }

            const token = await user.getIdToken();
            Cookies.set("authToken", token, { expires: 1 });

            onClose();
            console.log("Navigating to main app...");
            router.push('/'); // Navigate to the main app
        } catch (error) {
            console.error("Email Login Error:", error);
            alert("Email or password is incorrect. Please try again.");
        }
    };
    const closeModal = () => {
        setIsModalOpen(false); // Sembunyikan modal
    };




    const handleClose = () => {
        setIsOpen(false);
        setTimeout(onClose, 300);
    };

    return (
        <>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex mt-20  items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
                    <div className="bg-white rounded-xl p-8 shadow-2xl transform transition-transform scale-100 max-w-lg w-full">
                        {/* Header */}
                        <div className="flex justify-between items-center pb-4 border-b">
                            <h3 className="text-xl font-bold text-gray-800">Berhasil!</h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition duration-200"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body */}
                        <div className="py-6 text-center">
                            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-green-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm4.28-10.72a.75.75 0 10-1.06-1.06L9 11.44l-2.22-2.22a.75.75 0 00-1.06 1.06l3 3a.75.75 0 001.06 0l5-5z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <p className="text-lg text-gray-600">
                                Dormitory berhasil di tambahkan.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={closeModal}
                                className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600 focus:outline-none transition duration-300"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div
                className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"
                    }`}
            >
                {isOpen && (
                    <div
                        ref={modalRef}
                        className="bg-white p-6 rounded-2xl shadow-2xl w-full md:max-w-lg relative transition-transform transform duration-300"
                    >
                        {/* Tombol Tutup */}
                        <button
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                            onClick={handleClose}
                            aria-label="Close"
                        >
                            <FontAwesomeIcon icon={faTimes} size="lg" />
                        </button>

                        {/* Konten Modal */}
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                                {isAdminMode ? "Admin Login" : "Login"}
                            </h2>

                            {isAdminMode ? (
                                <>
                                    <input
                                        type="email"
                                        placeholder="Admin Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Admin Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                                    />
                                    <button
                                        onClick={handleEmailLogin}
                                        className="w-full py-3 mb-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                                    >
                                        Sign in as Admin
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleGoogleLogin}
                                        className="flex items-center justify-center w-full py-3 mb-4 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all"
                                    >
                                        <img
                                            src="/google.jpg"
                                            style={{ width: "28px" }}
                                            className="mr-2"
                                            alt="Google"
                                        />
                                        <span className="text-black font-medium">Sign in with Google</span>
                                    </button>

                                    <button
                                        onClick={handleFacebookLogin}
                                        className="flex items-center justify-center w-full py-3 mb-4 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all"
                                    >
                                        <FontAwesomeIcon
                                            icon={faFacebookF}
                                            className="mr-2 text-blue-600"
                                            style={{ width: "28px" }}
                                        />
                                        <span className="text-black font-medium">Sign in with Facebook</span>
                                    </button>
                                </>
                            )}

                            <button
                                onClick={handleAdminModeToggle}
                                className="w-full py-3 mt-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                            >
                                {isAdminMode ? "Switch to User Login" : "Login as Admin"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </>
    );
};

export default Login;
