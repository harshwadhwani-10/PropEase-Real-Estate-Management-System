import {
  FaShieldAlt,
  FaLock,
  FaHeadset,
  FaCalculator,
  FaCheckCircle,
} from "react-icons/fa";

export default function WhyChooseUs() {
  const features = [
    {
      icon: <FaShieldAlt className="text-4xl" />,
      title: "Verified Listings",
      description:
        "All properties are thoroughly verified by our admin team to ensure authenticity and accuracy.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <FaLock className="text-4xl" />,
      title: "Secure Transactions",
      description:
        "Your data and transactions are protected with industry-standard security measures.",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <FaHeadset className="text-4xl" />,
      title: "Personalized Support",
      description:
        "Get expert assistance from our dedicated support team throughout your property journey.",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: <FaCalculator className="text-4xl" />,
      title: "Easy EMI Calculator",
      description:
        "Plan your finances with our built-in EMI calculator for home loan installments.",
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why Choose PropEase?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We make finding your perfect home simple, secure, and stress-free
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-2xl p-6 md:p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
            >
              <div
                className={`${feature.color} w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#2A4365] mb-2">
                500+
              </div>
              <div className="text-gray-600">Properties Listed</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#2A4365] mb-2">
                1000+
              </div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#2A4365] mb-2">
                50+
              </div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-[#2A4365] mb-2">
                4.8/5
              </div>
              <div className="text-gray-600">Customer Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

