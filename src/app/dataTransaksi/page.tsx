"use client";
import React, { useEffect, useState } from 'react';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { dbFire } from "@/app/firebase/config";

// Define the type for the payment data retrieved from localStorage
interface PaymentData {
    order_id: string;
    status_code: string;
    transaction_status: string;
    payment_type: string;
    gross_amount: string;
    first_name: string;
    email: string;
    phoneNumber: string;
    kampus: string;
    kotaAsal: string;
    pdf_url: string;
    va_numbers: { bank: string; va_number: string }[];
}

export default function Career() {
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
    const [isSaving, setIsSaving] = useState(false); // Track the saving process
    const [saveError, setSaveError] = useState<string | null>(null); // Error state for save process

    // Function to retrieve payment data from localStorage
    const retrievePaymentData = () => {
        const storedPaymentData = localStorage.getItem('paymentResult');
        if (storedPaymentData) {
            console.log("Payment data from localStorage:", storedPaymentData);
            setPaymentData(JSON.parse(storedPaymentData));
        } else {
            console.log("No payment data found in localStorage.");
        }
    };

    useEffect(() => {
        // Retrieve payment data initially
        retrievePaymentData();

        // Re-fetch payment data when navigating back to this page
        window.addEventListener('focus', retrievePaymentData);

        return () => {
            window.removeEventListener('focus', retrievePaymentData);
        };
    }, []);

    // Function to handle saving the transaction data to Firestore
    const saveTransactionToFirestore = async () => {
        if (!paymentData) {
            setSaveError("No payment data available.");
            return;
        }

        const { order_id, status_code, transaction_status, payment_type, gross_amount, first_name, email, phoneNumber, kampus, kotaAsal, pdf_url, va_numbers } = paymentData;

        console.log("Payment data to be saved:", paymentData); // Check if payment data is correct

        // Fetch the UID from the user collection based on email
        const getUidFromUserCollection = async (email: string) => {
            const userRef = doc(dbFire, 'user', email);
            try {
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    console.log("User found:", userDoc.data());
                    return userDoc.data()?.uid || ''; // Make sure uid is returned correctly
                } else {
                    setSaveError("User not found.");
                    return '';
                }
            } catch (e) {
                console.error("Error getting document: ", e);
                setSaveError("Error retrieving user information.");
                return '';
            }
        };

        const saveTransaction = async (uid: string) => {
            if (!uid) {
                setSaveError("User ID not found.");
                setIsSaving(false);
                return;
            }

            try {
                const docRef = await addDoc(collection(dbFire, 'bukti_transaksi'), {
                    order_id,
                    status_code,
                    transaction_status,
                    payment_type,
                    gross_amount,
                    first_name,
                    email,
                    phoneNumber,
                    kampus,
                    kotaAsal,
                    pdf_url,
                    va_numbers,
                    uid, // Assuming the user ID is necessary for tracking
                });
                console.log("Transaction saved with ID:", docRef.id);
                setIsSaving(false);
            } catch (e) {
                console.error("Error saving transaction: ", e);
                setSaveError("Error saving payment data.");
                setIsSaving(false);
            }
        };

        // Call getUid and save the transaction if user ID exists
        setIsSaving(true); // Prevent double-clicks
        getUidFromUserCollection(email).then((uid) => {
            if (uid) {
                saveTransaction(uid);
            } else {
                setIsSaving(false); // Stop saving process if no UID found
            }
        });
    };

    return (
        <div>
            {saveError && <div style={{ color: 'red' }}>{saveError}</div>}
            <h1>Payment Information</h1>
            {paymentData && (
                <div>
                    <p>Order ID: {paymentData.order_id}</p>
                    <p>Status: {paymentData.transaction_status}</p>
                    <p>Amount: {paymentData.gross_amount}</p>
                    <p>Payment Type: {paymentData.payment_type}</p>
                </div>
            )}
            <button onClick={saveTransactionToFirestore} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Transaction'}
            </button>
        </div>
    );
}
