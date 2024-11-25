"use client";

import React, { useEffect, useState } from "react";
import { BsCheckCircle } from "react-icons/bs";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { dbFire } from "@/app/firebase/config";

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
  transaction_id?: string;
  transaction_time?: string;
  bca_va_number?: string;
  status_message?: string;
  fraud_status?: string;
  nama: string;
}

export default function Career() {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isSaved, setIsSaved] = useState(false); // Flag lokal untuk kontrol penyimpanan
  const [saveError, ] = useState<string | null>(null);

  // Mengambil data transaksi dari localStorage
  const retrievePaymentData = () => {
    const storedPaymentData = localStorage.getItem("paymentResult");
    if (storedPaymentData) {
      setPaymentData(JSON.parse(storedPaymentData));
    } else {
      console.log("No payment data found in localStorage.");
    }
  };

  
  const saveTransactionToFirestore = async (data: PaymentData) => {
    try {
      
      const transaksiRef = collection(dbFire, "bukti_transaksi");
      const q = query(transaksiRef, where("order_id", "==", data.order_id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log(`Transaction with Order ID ${data.order_id} already exists.`);
        return; 
      }

      
      await addDoc(transaksiRef, data);
      console.log("Transaction saved successfully!");
      setIsSaved(true); 
    } catch (error) {
      console.error("Error saving transaction:", error);
      
    }
  };

  
  useEffect(() => {
    retrievePaymentData(); 
  }, []); 

  useEffect(() => {
    
    if (paymentData && !isSaved) {
      saveTransactionToFirestore(paymentData);
    }
  }, [paymentData, isSaved]); 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="p-8 max-w-lg w-full bg-white rounded-xl shadow-lg m-10 mt-28">
        {saveError && (
          <div className="text-red-600 font-medium mb-4">{saveError}</div>
        )}

        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-blue-700 mb-8">
            Transaction Summary
          </h1>

          {paymentData ? (
            <>
              <div className="mb-6 flex justify-center">
                <BsCheckCircle className="text-green-500" size={60} />
              </div>

              <div className="space-y-4 text-gray-700">
                {/* Order Details */}
                <p>
                  <span className="font-semibold text-gray-800">Order ID:</span>{" "}
                  {paymentData.order_id}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Status:</span>{" "}
                  {paymentData.transaction_status}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Amount:</span>{" "}
                  Rp {paymentData.gross_amount}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">
                    Payment Type:
                  </span>{" "}
                  {paymentData.payment_type}
                </p>

                {/* Personal Information */}
                <p>
                  <span className="font-semibold text-gray-800">House Name:</span>{" "}
                  {paymentData.nama}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Name:</span>{" "}
                  {paymentData.first_name}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Email:</span>{" "}
                  {paymentData.email}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Phone:</span>{" "}
                  {paymentData.phoneNumber}
                </p>

                {/* Address Information */}
                <p>
                  <span className="font-semibold text-gray-800">Campus:</span>{" "}
                  {paymentData.kampus}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">City of Origin:</span>{" "}
                  {paymentData.kotaAsal}
                </p>

                {/* Transaction Info */}
                <p>
                  <span className="font-semibold text-gray-800">Transaction ID:</span>{" "}
                  {paymentData.transaction_id || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Transaction Time:</span>{" "}
                  {paymentData.transaction_time || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">BCA VA Number:</span>{" "}
                  {paymentData.bca_va_number || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Fraud Status:</span>{" "}
                  {paymentData.fraud_status || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Status Message:</span>{" "}
                  {paymentData.status_message || "N/A"}
                </p>
                {/* Virtual Account Numbers (VA Numbers) */}
                {paymentData.va_numbers.length > 0 && (
                  <div>
                    <span className="font-semibold text-gray-800">VA Numbers:</span>
                    <ul className="list-disc pl-5">
                      {paymentData.va_numbers.map((va, index) => (
                        <li key={index}>
                          <strong>{va.bank}:</strong> {va.va_number}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-600">No payment information available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
