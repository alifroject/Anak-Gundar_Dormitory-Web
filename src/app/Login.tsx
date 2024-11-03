"use client";
import {
    signInWithPopup,
    FacebookAuthProvider,
    GoogleAuthProvider,
} from "firebase/auth";
import { auth, dbFire } from "@/app/firebase/config"; // Import db for Firestore
import { doc, setDoc, getDoc } from "firebase/firestore"; // Import Firestore functions
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF } from "@fortawesome/free-brands-svg-icons";
import Cookies from "js-cookie";

interface LoginProps {
    onClose: () => void;
    onLoginSuccess: () => void; // Add this line to accept the prop
    originPath: string; // Menentukan rute asal
}

const Login: React.FC<LoginProps> = ({ onClose, onLoginSuccess , originPath }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);



    const router = useRouter();

    interface User {
        uid: string;
        email: string | null;
        displayName?: string | null;
    }

    // Function to create or update user in Firestore
    // Function to create or update user in Firestore only if not exists
    const createUserDocument = async (user: User) => {
        try {
            const userDocRef = doc(dbFire, "user", user.uid);
            const userDoc = await getDoc(userDocRef);

            // Hanya buat dokumen jika pengguna belum ada di Firestore
            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    email: user.email,
                    displayName: user.displayName || "Anonymous",
                });
            } else {
                console.log("User document already exists, skipping creation.");
            }
        } catch (error) {
            console.error("Error creating user document:", error);
        }
    };


    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const token = await user.getIdToken();
            Cookies.set("authToken", token, { expires: 1 });
            await createUserDocument(user); // Create Firestore document
            handleClose();
    
            // Navigasi berdasarkan originPath
            if (originPath) {
                router.push(originPath);
            } else {
                router.push("/");
            }
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
            await createUserDocument(user); // Create Firestore document
            handleClose();
    
            // Navigasi berdasarkan originPath
            if (originPath) {
                router.push(originPath);
            } else {
                router.push("/");
            }
        } catch (error) {
            console.error("Login Error:", error);
        }
    };
    
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

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(onClose, 300);
    };



    return (
        <>
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"
                    }`}
            >
                {isOpen && (
                    <div
                        ref={modalRef}
                        className={`bg-white p-6 rounded-lg shadow-lg h-screen w-full md:max-w-md relative transition-transform transform duration-300 ${isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                            }`}
                    >
                        <button
                            className="absolute top-4 right-4 text-gray-500"
                            onClick={handleClose}
                            aria-label="Close"
                        >
                            <FontAwesomeIcon icon={faTimes} size="lg" />
                        </button>



                        <div>
                            <button
                                onClick={handleGoogleLogin}
                                className="flex items-center justify-center w-full py-2 mb-4 border rounded-lg"
                            >
                                <img src="/google.jpg" style={{ width: "28px" }} className="mr-2" alt="Google" />
                                <span className="text-black">Sign in with Google</span>
                            </button>
                            <button
                                onClick={handleFacebookLogin}
                                className="flex items-center justify-center w-full py-2 mb-4 border rounded-lg"
                            >
                                <FontAwesomeIcon
                                    icon={faFacebookF}
                                    className="mr-2 text-blue-600"
                                    style={{ width: "28px" }}
                                />
                                <span className="text-black">Sign in with Facebook</span>
                            </button>
                            {/* Remaining UI */}
                        </div>
                        {/* Admin login UI */}
                    </div>
                )}
            </div>
        </>
    );
};

export default Login;
