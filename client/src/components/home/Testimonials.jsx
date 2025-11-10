import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { FaStar, FaQuoteLeft } from "react-icons/fa";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Home Buyer",
    avatar: "https://ui-avatars.com/api/?name=Rajesh+Kumar&background=2A4365&color=fff&size=128",
    rating: 5,
    comment:
      "Found my dream home in Bangalore within 2 weeks! The platform made it so easy to search and compare properties. The support team was incredibly helpful throughout the process.",
    location: "Bangalore",
  },
  {
    name: "Priya Sharma",
    role: "Property Owner",
    avatar: "https://ui-avatars.com/api/?name=Priya+Sharma&background=F6AD55&color=fff&size=128",
    rating: 5,
    comment:
      "Listing my property was seamless. Great support team and quick approval process. My property got inquiries within the first week. Highly recommended!",
    location: "Mumbai",
  },
  {
    name: "Amit Patel",
    role: "Renter",
    avatar: "https://ui-avatars.com/api/?name=Amit+Patel&background=2A4365&color=fff&size=128",
    rating: 5,
    comment:
      "The search filters are amazing! Found exactly what I was looking for in Pune. The detailed property descriptions and photos helped me make the right decision. Excellent service!",
    location: "Pune",
  },
  {
    name: "Sneha Reddy",
    role: "Investor",
    avatar: "https://ui-avatars.com/api/?name=Sneha+Reddy&background=F6AD55&color=fff&size=128",
    rating: 5,
    comment:
      "As a real estate investor, I appreciate the verified listings and comprehensive property details. PropEase has become my go-to platform for finding investment opportunities.",
    location: "Hyderabad",
  },
  {
    name: "Vikram Singh",
    role: "First-time Buyer",
    avatar: "https://ui-avatars.com/api/?name=Vikram+Singh&background=2A4365&color=fff&size=128",
    rating: 5,
    comment:
      "Being a first-time home buyer, I was nervous about the process. PropEase made it so simple with their EMI calculator and expert support. Found my perfect home in Delhi!",
    location: "Delhi",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-[#2A4365] to-[#1e2f47] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers
          </p>
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          breakpoints={{
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="testimonials-swiper pb-12"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 h-full border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full border-2 border-white/30 mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-lg">{testimonial.name}</h4>
                    <p className="text-gray-300 text-sm">{testimonial.role}</p>
                    <p className="text-gray-400 text-xs">{testimonial.location}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-sm" />
                  ))}
                </div>
                <div className="relative">
                  <FaQuoteLeft className="text-white/20 text-3xl mb-3" />
                  <p className="text-gray-100 leading-relaxed italic">
                    &quot;{testimonial.comment}&quot;
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

