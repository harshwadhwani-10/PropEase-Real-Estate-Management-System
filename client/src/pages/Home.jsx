import { useEffect, useState } from "react";
import HeroSection from "../components/home/HeroSection";
import SearchBar from "../components/home/SearchBar";
import FeaturedListings from "../components/home/FeaturedListings";
import WhyChooseUs from "../components/home/WhyChooseUs";
import ExploreByCity from "../components/home/ExploreByCity";
import Testimonials from "../components/home/Testimonials";
import CTASection from "../components/home/CTASection";
import api from "../utils/api";

export default function Home() {
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedListings = async () => {
      try {
        // Fetch listings with offers first, then fallback to any approved listings
        const res = await api.get("/api/listing/get?offer=true&limit=8");
        const data = res.data;

        if (data && data.length > 0) {
          setFeaturedListings(data);
        } else {
          // Fallback to any approved listings
          const fallbackRes = await api.get("/api/listing/get?limit=8");
          setFeaturedListings(fallbackRes.data || []);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching featured listings:", error);
        setLoading(false);
      }
    };

    fetchFeaturedListings();
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <HeroSection />

      {/* Search Bar - Positioned below hero with overlap */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative -mt-12 md:-mt-20 mb-20 md:mb-28 z-20">
        <SearchBar />
      </div>

      {/* Featured Listings */}
      {!loading && featuredListings.length > 0 && (
        <FeaturedListings listings={featuredListings} />
      )}

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Explore by City */}
      <ExploreByCity />

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
