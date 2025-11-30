import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/free-mode";

export default function ImageGallery({ images, name }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-2xl flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image Carousel */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
        <Swiper
          modules={[Navigation, Thumbs]}
          navigation
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          className="main-swiper"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-64 sm:h-96 lg:h-[500px]">
                <img
                  src={image}
                  alt={`${name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <Swiper
          onSwiper={setThumbsSwiper}
          modules={[Thumbs, FreeMode]}
          spaceBetween={10}
          slidesPerView={4}
          freeMode
          watchSlidesProgress
          breakpoints={{
            640: {
              slidesPerView: 5,
            },
            1024: {
              slidesPerView: 6,
            },
          }}
          className="thumbnail-swiper"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="cursor-pointer">
                <img
                  src={image}
                  alt={`${name} thumbnail ${index + 1}`}
                  className="w-full h-20 sm:h-24 rounded-lg object-cover border-2 border-gray-300 hover:border-[#2A4365] transition-colors"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
