import { Link } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";

const cities = [
  {
    name: "Mumbai",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=2089&q=80",
    listings: "230+",
  },
  {
    name: "Delhi",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    listings: "180+",
  },
  {
    name: "Bangalore",
    image: "https://images.unsplash.com/photo-1529258283598-8d8fe85b8f5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    listings: "150+",
  },
  {
    name: "Hyderabad",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    listings: "120+",
  },
  {
    name: "Pune",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    listings: "100+",
  },
  {
    name: "Chennai",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=2089&q=80",
    listings: "90+",
  },
];

export default function ExploreByCity() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Explore by City
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover properties in India's most popular cities
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {cities.map((city, index) => (
            <Link
              key={index}
              to={`/search?searchTerm=${city.name}`}
              className="group relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat group-hover:scale-110 transition-transform duration-500"
                style={{ backgroundImage: `url(${city.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/90 transition-colors duration-300"></div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-end p-6 text-white">
                <FaMapMarkerAlt className="text-3xl mb-2 opacity-80" />
                <h3 className="text-2xl md:text-3xl font-bold mb-2">{city.name}</h3>
                <p className="text-lg opacity-90">{city.listings} Listings</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

