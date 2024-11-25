"use client"

import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';


import PromoComponent from '@/app/region_section';

import { Swiper as SwiperCore } from 'swiper';



const images = [
  {
    src: '/gundar11.png',

  },
  {
    src: '/gundar22.jpg',

  },
  {
    src: '/gundar33.jpg',

  },
  {
    src: '/gundar44.jpg',

  },
];

const ActiveSlider = () => {
  const swiperRef = useRef<SwiperCore | null>(null);



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
      <div className="flex items-center justify-center min-h-full  flex-col md:min-h-[900px] w-full overflow-hidden 240px:overflow-hidden">
        <div className="relative mt-20 mb-5 bg-gradient-to-br from-blue-50 via-white to-blue-100 py-16 px-4 sm:px-6 lg:px-8 shadow-lg rounded-xl">
          <div className="max-w-4xl mx-auto text-center">
            {/* Tambahkan ikon di atas teks */}
            <div className="flex justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-16 h-16 text-blue-500"
              >
                <path d="M12 2a7 7 0 0 1 7 7v2.3c.6.2 1 .8 1 1.4v8c0 .8-.7 1.3-1.5 1.3H5.5c-.8 0-1.5-.5-1.5-1.3v-8c0-.6.4-1.2 1-1.4V9a7 7 0 0 1 7-7zM9 12a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9z" />
              </svg>
            </div>
            {/* Teks utama */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-800 leading-tight"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Lagi cari kos <span className="text-blue-600">deket Gundar?</span>
            </h1>
            {/* Subteks */}
            <p
              className="mt-6 text-lg sm:text-xl text-gray-600 font-medium"
              style={{ fontFamily: "'Roboto', sans-serif" }}
            >
              Temukan kos terbaik dengan fasilitas.
            </p>
            {/* Tombol CTA */}
            <div className="mt-8">
              <button
                onClick={() => {
                  const targetElement = document.getElementById("target-section");
                  if (targetElement) {
                    targetElement.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="inline-block bg-blue-600 text-white py-3 px-6 rounded-full text-lg font-semibold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-transform transform hover:-translate-y-1"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Cari Sekarang
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 inline ml-2"
                >
                  <path d="M14.29 8.7a1 1 0 0 0 0 1.4L16.17 12H4a1 1 0 1 0 0 2h12.17l-1.88 1.88a1 1 0 1 0 1.42 1.42l3.59-3.59a1 1 0 0 0 0-1.42l-3.59-3.59a1 1 0 0 0-1.42 0z" />
                </svg>
              </button>

            </div>
          </div>
        </div>



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
              <div className="flex flex-col gap-6 mb-10 group relative shadow-lg text-white rounded-xl px-6 py-8  h-[500px] w-full md:w-[350px] lg:w-[350px] overflow-hidden cursor-pointer" >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${image.src})` }}
                />
                <div className="absolute inset-0 bg-black opacity-10 group-hover:opacity-50" />


              </div>
            </SwiperSlide>

          ))}
        </Swiper>
        <div className="mt-6 flex justify-center items-center space-x-4">
          <button
            className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300"
            onClick={handlePrevSlide}
            aria-label="Previous Slide"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-lg" />
          </button>
          <button
            className="p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300"
            onClick={handleNextSlide}
            aria-label="Next Slide"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-lg" />
          </button>
        </div>

      </div>
      <div id='target-section'>

        <PromoComponent ></PromoComponent>

      </div>

    </>
  );
};

export default ActiveSlider


