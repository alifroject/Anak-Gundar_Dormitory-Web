// components/Navbar.tsx
import Link from 'next/link';

export default function Navbar() {
    return (
        <>  <img src="" alt="" />
            <nav className="bg-gray-800 w-full h-14 fixed top-0 left-0 flex justify-center items-center p-4 z-10">
                <ul className="flex space-x-4">
                    <li>
                        <Link href="/" className="text-white hover:text-gray-400">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link href="/about" className="text-white hover:text-gray-400">
                            About
                        </Link>
                    </li>
                    <li>
                        <Link href="/career" className="text-white hover:text-gray-400">
                            Career
                        </Link>
                    </li>
                </ul>
                <div className="ml-auto flex space-x-4">
                    <button className="text-white hover:bg-gray-700 border px-4 py-1 rounded">
                        Sign in
                    </button>
                    <button className="text-white hover:bg-gray-700 border px-4 py-1 rounded">
                        Log in
                    </button>
                </div>
            </nav>
            <div className="pt-14">
                {/* Your content here */}
            </div>
        </>
    );
}
