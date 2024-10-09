import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

function App() {
  return (
    <div className="bg-white min-h-screen flex flex-col items-center">
      <header className="text-center mt-10">
        <h1 className="text-4xl text-black font-bold">Lagi cari kos deket Gundar?</h1>
        <p className="text-lg text-black font-bold mt-2">Coba pilih gundar region mana dibawah ini.</p>
      </header>
      <div className="mt-6 flex items-center">
        <div className="relative">
          <select
            className="pl-3 pr-4 py-2 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Pilih lokasi/area/alamat</option>
            <option value="Jakarta">Jakarta</option>
            <option value="Bandung">Bandung</option>
            <option value="Surabaya">Surabaya</option>
            <option value="Yogyakarta">Yogyakarta</option>
            <option value="Bali">Bali</option>
          </select>
        </div>
        <button className="ml-4 bg-green-500 text-white px-6 py-2 rounded-full shadow-sm hover:bg-green-600">
          Cari
        </button>
      </div>
      <div className="mt-10 flex justify-center items-center space-x-4">
        <div className="w-64 h-64 bg-white shadow-lg rounded-lg overflow-hidden">
          <img
            alt="Sewa kos terpercaya & populer di sini"
            className="w-full h-full object-cover"
            height="256"
            src="https://storage.googleapis.com/a1aa/image/7atiFWwQCtqEI94eVx0zwaIch8im5QZ7tjHiU24VrQOWcjyJA.jpg"
            width="256"
          />
        </div>
        <div className="w-64 h-64 bg-white shadow-lg rounded-lg overflow-hidden">
          <img
            alt="Gak dapet jaminan kehilangan barang di kosan?"
            className="w-full h-full object-cover"
            height="256"
            src="https://storage.googleapis.com/a1aa/image/eQInGqmWvqzQHarty5upmwT7aYiSfEUKUqXLFuJ26NPt4GlTA.jpg"
            width="256"
          />
        </div>
        <div className="w-64 h-64 bg-white shadow-lg rounded-lg overflow-hidden">
          <img
            alt="Surat terbuka untuk kampus se-Indonesia"
            className="w-full h-full object-cover"
            height="256"
            src="https://storage.googleapis.com/a1aa/image/lOpqDynvBP5iA9LIWcJn8WRAZDMB5DVFqyVvap8HffKq4GlTA.jpg"
            width="256"
          />
        </div>
      </div>
      <div className="mt-6 flex justify-center items-center space-x-2">
        <button className="p-2 bg-gray-200 rounded-full shadow-sm hover:bg-gray-300">
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <button className="p-2 bg-gray-200 rounded-full shadow-sm hover:bg-gray-300">
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
}

export default App;
