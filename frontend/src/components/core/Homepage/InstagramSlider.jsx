import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Grid } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/grid";

import i1 from '../../../assets/images/insta_img_1.jpg';
import i2 from '../../../assets/images/insta_img_2.jpg';
import i3 from '../../../assets/images/insta_img_3.jpg';
import i4 from '../../../assets/images/insta_img_4.jpg';

import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from "react-icons/md";
import { Link } from "react-router-dom";

const InstagramSlider = () => {
  const categoryData = [
    { id: 1, image: i1 },
    { id: 2, image: i2 },
    { id: 3, image: i3 },
    { id: 4, image: i4 },
    { id: 5, image: i3 },
    { id: 6, image: i1 },
  ];

  return (
    <div className="bg-transparent    py-10">
      <div className="mx-auto md:max-w-screen-xl px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="font-semibold font-serif text-wrap md:text-4xl">
            Follow Us on Instagram
          </h2>
          
        </div>

        {/* Swiper */}
        <Swiper
            modules={[Navigation, Grid]}
            navigation={{
                nextEl: ".swiper-button-next-custom",
                prevEl: ".swiper-button-prev-custom",
            }}
            speed={600}
            spaceBetween={16}
            breakpoints={{
                0: {
                slidesPerView: 2,
                grid: {
                    rows: 2,
                    fill: 'row',
                    },
                },
                640: {
                    slidesPerView: 3,
                    grid: { rows: 1 },
                },
                768: {
                    slidesPerView: 4,
                    grid: { rows: 1 },
                },
                1024: {
                    slidesPerView: 5,
                    grid: { rows: 1 },
                },
            }}
            >
            {categoryData.map((cat) => (
                <SwiperSlide key={cat.id}>
                    <Link to="#">
                        <div
                        className="aspect-square bg-cover bg-center rounded overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                        style={{ backgroundImage: `url(${cat.image})` }}
                        ></div>
                    </Link>
                </SwiperSlide>
            ))}
            </Swiper>

            {/* Navigation buttons at bottom */}
            <div className="flex justify-center gap-4 mt-6">
                <button className="swiper-button-prev-custom border rounded-full p-2.5 hover:bg-gray-100 transition">
                    <MdOutlineArrowBackIos />
                </button>
                <button className="swiper-button-next-custom border rounded-full p-2.5 hover:bg-gray-100 transition">
                    <MdOutlineArrowForwardIos />
                </button>
            </div>

      </div>
     
        
    </div>
  );
};

export default InstagramSlider;
