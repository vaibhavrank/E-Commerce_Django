import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import i1 from '../../assets/images/shopby_img_1.jpg';
import i2 from '../../assets/images/shopby_img_2.jpg';
import i3 from '../../assets/images/shopby_img_3.jpg';
import i4 from '../../assets/images/shopby_img_4.jpg';
import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from "react-icons/md";
import { Link } from "react-router-dom";

const ShopByCategory = () => {
  const categoryData = [
    { id: 1, image: i1, categoryName: 'Bags' },
    { id: 2, image: i2, categoryName: 'Accessories' },
    { id: 3, image: i3, categoryName: 'Clothing' },
    { id: 4, image: i4, categoryName: 'Shoes' },
    { id: 5, image: i3, categoryName: 'Shoes' },
    { id: 6, image: i1, categoryName: 'Shoes' },
  ];

  return (
    <div className="py-20">
      <div className="mx-auto max-w-screen-xl px-0 sm:px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 px-4">
          <h2 className="font-semibold font-serif text-3xl sm:text-4xl">
            Shop by category
          </h2>
          <div className="shopby_nav hidden sm:flex gap-3">
            <button className="swiper-button-prev-custom border rounded-full p-2.5">
              <MdOutlineArrowBackIos />
            </button>
            <button className="swiper-button-next-custom border rounded-full p-2.5">
              <MdOutlineArrowForwardIos />
            </button>
          </div>
        </div>

        {/* Swiper */}
        <Swiper
          modules={[Navigation]}
          navigation={{
            nextEl: ".swiper-button-next-custom",
            prevEl: ".swiper-button-prev-custom",
          }}
          speed={700}
          breakpoints={{
            0: { slidesPerView: 1 ,spaceBetween:20},
            480: { slidesPerView: 2,spaceBetween:20 },
            768: { slidesPerView: 3 ,spaceBetween:20},
            1024: { slidesPerView: 4 ,spaceBetween:20},
            // 1280: { slidesPerView: 5 },
          }}
        >
          {categoryData.map((cat) => (
            <SwiperSlide key={cat.id}>
              <div className="w-[270px] mx-auto bg-white overflow-hidden shadow-md hover:shadow-lg transition">
                <Link to="#">
                  <div
                    className="relative bg-no-repeat bg-cover bg-center flex justify-center h-[270px]"
                    style={{ backgroundImage: `url(${cat.image})` }}
                  >
                    <div className="absolute bottom-10 text-center">
                      <button className="bg-white border border-black font-bold px-8 py-2 rounded-sm text-sm">
                        {cat.categoryName}
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ShopByCategory;
