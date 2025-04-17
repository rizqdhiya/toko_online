
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules'; // import module
import 'swiper/css';
import 'swiper/css/pagination';

export default function BannerSlider() {
  return (
    <div className="w-full max-w-5xl mx-auto mt-7">
      <Swiper
        modules={[Autoplay, Pagination]} // register modules
        spaceBetween={15}
        loop={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className="rounded-xl"
      >
        <SwiperSlide>
          <img
            src="/banner1.jpg"
            alt="Promo 1"
            className="w-full h-[450px] object-cover rounded-xl"
          />
        </SwiperSlide>
        <SwiperSlide>
          <img
            src="/banner3.jpg"
            alt="Promo 2"
            className="w-full h-[450px] object-cover rounded-xl"
          />
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
