// src/components/ConfirmationModal.tsx

import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Confirm Logout</h2>
                <p className="text-gray-600 text-center mb-6">Are you sure you want to log out?</p>
                <div className="flex justify-between">
                    <button
                        onClick={onClose}
                        className="flex-1 mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition duration-150"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-150"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
