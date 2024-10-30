"use client"
import React, { useState } from 'react';

interface DropdownOption {
    value: string;
    label: string;
}

interface DropdownProps {
    options: DropdownOption[];
    onSelect: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ options, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const handleSelect = (option: DropdownOption) => {
        setSelectedOption(option.label);
        onSelect(option.value);
        setIsOpen(false);
    };

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-96 text-lg text-black text-left px-4 py-2 bg-white border rounded shadow focus:outline-none"
            >
                {selectedOption || 'Pilih Region'}
                <span className="float-right">&#9660;</span> {/* Icon dropdown */}
            </button>

            {isOpen && (
                <ul className=" w-32 mt-1 bg-white border rounded shadow-lg">
                    {options.map((option) => (
                        <li
                            key={option.value}
                            onClick={() => handleSelect(option)}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// Example of using the Dropdown component with dynamically provided options
const ExampleComponent: React.FC = () => {
    const options: DropdownOption[] = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
    ];

    const handleSelect = (value: string) => {
        console.log('Selected:', value);
    };

    return <Dropdown options={options} onSelect={handleSelect} />;
};

export default ExampleComponent;
