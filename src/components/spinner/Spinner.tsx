"use client";
import { BeatLoader } from "react-spinners";

// Define the component type (Functional Component)
const Spinner: React.FC = () => {
    return (
        <div className="flex justify-center items-center h-screen">
            <BeatLoader
                color="#000000"
                speedMultiplier={1}
            />
        </div>
    );
}

export default Spinner;
