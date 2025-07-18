import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade'; // Import fade effect CSS


export default function BannerSlider() {
  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]} // Tambahkan EffectFade
        effect="fade" // Aktifkan fade effect
        spaceBetween={30}
        loop={true}
        autoplay={{ 
          delay: 4000, 
          disableOnInteraction: false 
        }}
        pagination={{ clickable: true }}
        className="rounded-2xl shadow-xl overflow-hidden" // Styling utama di sini
      >
        <SwiperSlide>
          <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px]">
            <img
              src="/banner1.jpg"
              alt="Promo 1"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="absolute inset-0 flex flex-col justify-center items-start p-8 md:p-16 text-white">
              <h2 className="text-3xl md:text-5xl font-extrabold drop-shadow-lg">Koleksi Terbaru</h2>
              <p className="mt-2 md:mt-4 max-w-md text-lg drop-shadow-md">Temukan gaya terbaikmu dengan koleksi fashion terkini kami.</p>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px]">
            <img
              src="/banner3.jpg"
              alt="Promo 2"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="absolute inset-0 flex flex-col justify-center items-start p-8 md:p-16 text-white">
              <h2 className="text-3xl md:text-5xl font-extrabold drop-shadow-lg">Diskon Spesial</h2>
              <p className="mt-2 md:mt-4 max-w-md text-lg drop-shadow-md">Jangan lewatkan penawaran terbatas untuk produk pilihan.</p>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
