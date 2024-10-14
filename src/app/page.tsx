"use client"

import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { RxArrowTopRight } from "react-icons/rx";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight,faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import Navbar from '@/app/navbar-app';
import Login from '@/components/layout/Login'; // Import komponen login
import { Swiper as SwiperCore } from 'swiper';

const images = [
  {
    src: 'https://storage.googleapis.com/a1aa/image/7atiFWwQCtqEI94eVx0zwaIch8im5QZ7tjHiU24VrQOWcjyJA.jpg',
    alt: 'Sewa kos terpercaya & populer di sini',
  },
  {
    src: 'https://storage.googleapis.com/a1aa/image/eQInGqmWvqzQHarty5upmwT7aYiSfEUKUqXLFuJ26NPt4GlTA.jpg',
    alt: 'Gak dapet jaminan kehilangan barang di kosan?',
  },
  {
    src: 'https://storage.googleapis.com/a1aa/image/lOpqDynvBP5iA9LIWcJn8WRAZDMB5DVFqyVvap8HffKq4GlTA.jpg',
    alt: 'Surat terbuka untuk kampus se-Indonesia',
  },
  {
    src: 'https://storage.googleapis.com/a1aa/image/lOpqDynvBP5iA9LIWcJn8WRAZDMB5DVFqyVvap8HffKq4GlTA.jpg',
    alt: 'Surat terbuka untuk kampus se-Indonesia',
  },
];

const ActiveSlider = () => {
  const swiperRef = useRef<SwiperCore | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  

  const handleLoginClick = () => {
    setIsLoginOpen(true); // Menampilkan popup login
  };

  const handleCloseLogin = () => {
    setIsLoginOpen(false); // Menutup popup login
  };

  const handlePrevSlide = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev(); // Call slidePrev on Swiper instance
    }
  };

  const handleNextSlide = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext(); // Call slideNext on Swiper instance
    }
  };

  return (
    <>
      <Navbar onLoginClick={handleLoginClick} />
      {isLoginOpen && <Login onClose={handleCloseLogin} />} {/* Menampilkan popup login */}
      
      <div className="flex items-center justify-center flex-col h-[900px]">
        <h1 className="text-4xl text-black font-bold mb-4">Lagi cari kos deket Gundar?</h1>
        <p className="text-lg text-black font-bold mb-10">Coba pilih gundar region mana dibawah ini.</p>

        <Swiper
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 15,
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 15,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 15,
            },
          }}
          loop={true}
          pagination={{
            clickable: true,
          }}
          modules={[Pagination]}
          className="max-w-[90%] lg:max-w-[80%]"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="flex flex-col gap-6 mb-20 group relative shadow-lg text-white rounded-xl px-6 py-8 h-auto w-full lg:h-[400px] lg:w-[350px] overflow-hidden cursor-pointer">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${image.src})` }}
                />
                <div className="absolute inset-0 bg-black opacity-10 group-hover:opacity-50" />
                <div className="relative flex flex-col gap-3">
                  <h1 className="text-xl lg:text-2xl">{image.alt}</h1>
                  <p className="lg:text-[18px]">Deskripsi untuk {image.alt}</p>
                </div>
                <RxArrowTopRight className="absolute bottom-5 left-5 w-[35px] h-[35px] text-white group-hover:text-blue-500 group-hover:rotate-45 duration-100" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="mt-6 flex justify-center items-center space-x-2">
          <button
            className="p-2 bg-gray-200 rounded-full shadow-sm hover:bg-gray-300"
            onClick={handlePrevSlide} // Trigger previous slide
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button
            className="p-2 bg-gray-200 rounded-full shadow-sm hover:bg-gray-300"
            onClick={handleNextSlide} // Trigger next slide
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
    </>
  );
};

export default ActiveSlider;
