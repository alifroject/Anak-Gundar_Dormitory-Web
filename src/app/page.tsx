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
        <h1 className="text-3xl sm:text-4xl md:text-5xl mt-1 font-semibold text-gray-800 mt-40 text-center mb-4">
          Lagi cari kos deket Gundar?
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium text-center mb-10">
          Coba pilih gundar region mana dibawah ini.
        </p>

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
      <PromoComponent></PromoComponent>

    </>
  );
};

export default ActiveSlider


