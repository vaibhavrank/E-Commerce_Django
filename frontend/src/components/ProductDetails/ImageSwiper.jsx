import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, FreeMode } from 'swiper/modules';
import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from 'react-icons/md';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

const ImageSwiper = ({ images, currentImageIndex, onSelectImage }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updateScreen = () => setIsDesktop(window.innerWidth >= 1024);
    updateScreen();
    window.addEventListener('resize', updateScreen);
    return () => window.removeEventListener('resize', updateScreen);
  }, []);

  if (!images || images.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">No Images Available</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 max-w-6xl mx-auto">
      {/* Thumbnails */}
      <div className="lg:w-24 w-full lg:flex lg:flex-col flex-row gap-2 overflow-x-auto lg:overflow-y-auto justify-center items-center">
        <Swiper
          onSwiper={setThumbsSwiper}
          direction={isDesktop ? 'vertical' : 'horizontal'}
          spaceBetween={8}
          slidesPerView="auto"
          freeMode
          watchSlidesProgress
          modules={[FreeMode, Thumbs]}
          className="thumbs-swiper w-full h-full"
        >
          {images.map((img, index) => (
            <SwiperSlide key={img.id || index} className="!w-20 !h-20 flex-shrink-0">
              <img
                src={img.url}
                alt={`Thumbnail ${index + 1}`}
                onClick={() => onSelectImage(index)}
                className={`w-20 h-20 object-cover rounded-md border-2 cursor-pointer ${
                  currentImageIndex === index ? 'border-black' : 'border-transparent'
                } hover:border-gray-400`}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Main Image Display */}
      <div className="relative flex-1">
        <Swiper
          loop
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          thumbs={{ swiper: thumbsSwiper }}
          modules={[Navigation, Thumbs]}
          onSlideChange={(swiper) => onSelectImage(swiper.realIndex)}
          initialSlide={currentImageIndex}
          className="main-swiper rounded-lg"
        >
          {images.map((img, index) => (
            <SwiperSlide key={img.id || index}>
              <img
                src={img.url}
                alt={`Main Image ${index + 1}`}
                className="w-full h-[600px] object-contain rounded-lg"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button
              className="swiper-button-prev-custom absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-70 text-white rounded-full p-2 z-10"
              aria-label="Previous"
            >
              <MdOutlineArrowBackIos />
            </button>
            <button
              className="swiper-button-next-custom absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-70 text-white rounded-full p-2 z-10"
              aria-label="Next"
            >
              <MdOutlineArrowForwardIos />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageSwiper;
