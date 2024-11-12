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
            router.push(originPath || "/");
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



    const handleClose = () => {
        setIsOpen(false);
        setTimeout(onClose, 300);
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}>
                {isOpen && (
                    <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-lg h-screen w-full md:max-w-md relative transition-transform transform duration-300">
                        <button className="absolute top-4 right-4 text-gray-500" onClick={handleClose} aria-label="Close">
                            <FontAwesomeIcon icon={faTimes} size="lg" />
                        </button>

                        <div>
                            {isAdminMode ? (
                                <>
                                    <input
                                        type="email"
                                        placeholder="Admin Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full p-2 mb-4 border rounded-lg"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Admin Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-2 mb-4 border rounded-lg"
                                    />
                                    <button
                                        onClick={handleEmailLogin}
                                        className="w-full py-2 mb-4 bg-blue-500 text-white rounded-lg"
                                    >
                                        Sign in as Admin
                                    </button>


                                </>
                            ) : (
                                <>
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
                                        <FontAwesomeIcon icon={faFacebookF} className="mr-2 text-blue-600" style={{ width: "28px" }} />
                                        <span className="text-black">Sign in with Facebook</span>
                                    </button>
                                </>
                            )}

                            <button
                                onClick={handleAdminModeToggle}
                                className="w-full py-2 mt-4 bg-gray-300 text-black rounded-lg"
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
