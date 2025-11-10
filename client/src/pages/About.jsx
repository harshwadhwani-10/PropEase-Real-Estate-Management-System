import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Target,
  Eye,
  Heart,
  Zap,
  Shield,
  Users,
  Home,
  Search,
  ArrowRight,
  Linkedin,
  Mail,
} from "lucide-react";
import SectionHeader from "../components/common/SectionHeader";

const teamMembers = [
  {
    name: "Rajesh Kumar",
    role: "CEO & Founder",
    image: "https://ui-avatars.com/api/?name=Rajesh+Kumar&background=2A4365&color=fff&size=200",
    linkedin: "#",
  },
  {
    name: "Priya Sharma",
    role: "Head of Operations",
    image: "https://ui-avatars.com/api/?name=Priya+Sharma&background=F6AD55&color=fff&size=200",
    linkedin: "#",
  },
  {
    name: "Amit Patel",
    role: "Chief Technology Officer",
    image: "https://ui-avatars.com/api/?name=Amit+Patel&background=2A4365&color=fff&size=200",
    linkedin: "#",
  },
  {
    name: "Sneha Reddy",
    role: "Head of Sales",
    image: "https://ui-avatars.com/api/?name=Sneha+Reddy&background=F6AD55&color=fff&size=200",
    linkedin: "#",
  },
];

const values = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Integrity",
    description:
      "We operate with honesty and transparency in all our dealings, building trust with our clients.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Innovation",
    description:
      "We leverage cutting-edge technology to simplify and enhance the real estate experience.",
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: "Customer Trust",
    description:
      "Our clients' satisfaction is our top priority. We go above and beyond to exceed expectations.",
    color: "bg-red-100 text-red-600",
  },
  {
    icon: <Home className="w-8 h-8" />,
    title: "Simplicity",
    description:
      "We make real estate simple and accessible, removing complexity from property transactions.",
    color: "bg-green-100 text-green-600",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2A4365] via-[#1e2f47] to-[#2A4365] text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              About PropEase
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8">
              Making Real Estate Simple, Smart, and Secure.
            </p>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Helping people find their dream homes, one click at a time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-10 h-10 text-[#2A4365]" />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                At PropEase, we believe that finding your perfect home should be a smooth,
                enjoyable experience. Our mission is to revolutionize the real estate industry by
                providing a platform that is intuitive, transparent, and trustworthy.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We strive to connect property seekers with their dream homes while empowering
                property owners to showcase their listings effectively. Through verified listings,
                comprehensive search filters, and personalized support, we make real estate
                accessible to everyone.
              </p>
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl border-l-4 border-orange-500 mt-6">
                <p className="text-xl font-semibold text-gray-900 italic">
                  "Helping people find their dream homes, one click at a time."
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80"
                  alt="Mission"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:order-2"
            >
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-10 h-10 text-[#2A4365]" />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Vision</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We envision a future where real estate transactions are seamless, transparent, and
                accessible to everyone. Our goal is to become India's most trusted real estate
                platform, known for innovation, integrity, and exceptional customer service.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Through continuous innovation and a deep understanding of our customers' needs, we
                aim to set new standards in the real estate industry and make property buying,
                selling, and renting a delightful experience for all.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:order-1"
            >
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80"
                  alt="Vision"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <SectionHeader
            title="Our Values"
            subtitle="The principles that guide everything we do"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 group"
              >
                <div
                  className={`w-16 h-16 ${value.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <SectionHeader
            title="Our Team"
            subtitle="Meet the talented individuals behind PropEase"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow text-center group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-gray-600 mb-4">{member.role}</p>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full hover:bg-[#2A4365] hover:text-white transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-[#2A4365] via-[#1e2f47] to-[#2A4365] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Start Your Real Estate Journey?
            </h2>
            <p className="text-lg md:text-xl text-gray-200 mb-8">
              Join thousands of satisfied customers who found their dream property with PropEase.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/search"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Explore Properties
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/sign-up"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white border-2 border-white/30 hover:border-white/50 px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                List Your Property
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
