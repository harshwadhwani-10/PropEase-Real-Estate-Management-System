import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { FaMapMarkerAlt, FaBed, FaBath } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

export default function FeaturedListings({ listings }) {
  if (!listings || listings.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Featured Properties
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover handpicked properties that match your lifestyle and budget
          </p>
        </div>

        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
            1280: {
              slidesPerView: 4,
            },
          }}
          className="featured-swiper"
        >
          {listings.map((listing) => (
            <SwiperSlide key={listing._id}>
              <Link to={`/listing/${listing._id}`}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={listing.imageUrls[0] || "https://via.placeholder.com/400"}
                      alt={listing.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Price Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="text-white">
                        <div className="text-2xl font-bold">
                          ₹
                          {listing.offer
                            ? listing.discountPrice.toLocaleString("en-IN")
                            : listing.regularPrice.toLocaleString("en-IN")}
                          {listing.type === "rent" && (
                            <span className="text-sm font-normal">/month</span>
                          )}
                        </div>
                        {listing.offer && (
                          <div className="text-sm text-orange-300 line-through">
                            ₹{listing.regularPrice.toLocaleString("en-IN")}
                          </div>
                        )}
                      </div>
                    </div>
                    {listing.offer && (
                      <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Special Offer
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                      {listing.name}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-3">
                      <FaMapMarkerAlt className="text-orange-500 mr-2" />
                      <span className="text-sm line-clamp-1">{listing.address}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <FaBed className="text-[#2A4365]" />
                        <span className="text-sm">{listing.bedrooms} Beds</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaBath className="text-[#2A4365]" />
                        <span className="text-sm">{listing.bathrooms} Baths</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="text-center mt-10">
          <Link
            to="/search"
            className="inline-block bg-[#2A4365] hover:bg-[#1e2f47] text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200 shadow-lg"
          >
            View All Properties
          </Link>
        </div>
      </div>
    </section>
  );
}

