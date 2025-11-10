import { Link } from "react-router-dom";
import { FaArrowRight, FaHome, FaSearch } from "react-icons/fa";

export default function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-[#2A4365] via-[#1e2f47] to-[#2A4365] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Find Your Next Home?
          </h2>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their dream property with PropEase.
            Start your search today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/search"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-2 text-lg"
            >
              <FaSearch className="text-xl" />
              <span>Browse Properties</span>
              <FaArrowRight className="text-xl" />
            </Link>
            <Link
              to="/sign-up"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white border-2 border-white/30 hover:border-white/50 px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 text-lg"
            >
              <FaHome className="text-xl" />
              <span>List Your Property</span>
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-12 pt-8 border-t border-white/20 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-orange-400 mb-2">Free</div>
              <div className="text-gray-300">Property Listings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-400 mb-2">24/7</div>
              <div className="text-gray-300">Customer Support</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-400 mb-2">100%</div>
              <div className="text-gray-300">Verified Properties</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

