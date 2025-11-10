import { useState, useEffect } from "react";
import { Search as SearchIcon, Menu, X, Home, User, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    if (searchTerm) {
      urlParams.set("searchTerm", searchTerm);
    }
    navigate(`/search?${urlParams.toString()}`);
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-lg border-b border-gray-200"
          : "bg-white/95 backdrop-blur-sm shadow-md"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-r from-[#2A4365] to-[#F6AD55] p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#2A4365] to-[#F6AD55] bg-clip-text text-transparent">
              PropEase
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-[#2A4365] font-medium transition-colors relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2A4365] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/search"
              className="text-gray-700 hover:text-[#2A4365] font-medium transition-colors relative group"
            >
              Search
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2A4365] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-[#2A4365] font-medium transition-colors relative group"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2A4365] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/map"
              className="text-gray-700 hover:text-[#2A4365] font-medium transition-colors relative group"
            >
              Map
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2A4365] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/emi-calculator"
              className="text-gray-700 hover:text-[#2A4365] font-medium transition-colors relative group"
            >
              EMI Calculator
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2A4365] group-hover:w-full transition-all duration-300"></span>
            </Link>
            {(currentUser?.role === "owner" || currentUser?.role === "admin") && (
              <Link
                to={currentUser.role === "admin" ? "/admin/dashboard" : "/owner/dashboard"}
                className="text-gray-700 hover:text-[#2A4365] font-medium transition-colors relative group"
              >
                {currentUser.role === "admin" ? "Admin Panel" : "Owner Panel"}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2A4365] group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
          </nav>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSubmit}
            className="hidden md:flex items-center bg-gray-100 rounded-xl px-4 py-2 flex-1 max-w-md mx-8 focus-within:ring-2 focus-within:ring-[#2A4365] focus-within:bg-white transition-all"
          >
            <SearchIcon className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search properties..."
              className="bg-transparent focus:outline-none w-full text-gray-700 placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>

          {/* User Menu - Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            {currentUser ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img
                  className="rounded-full h-10 w-10 object-cover border-2 border-gray-200 hover:border-[#2A4365] transition-colors"
                  src={currentUser.avatar}
                  alt="profile"
                />
              </Link>
            ) : (
              <Link
                to="/sign-in"
                className="flex items-center gap-2 text-gray-700 hover:text-[#2A4365] font-medium transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-[#2A4365] transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-[#2A4365]">
                <SearchIcon className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  className="bg-transparent focus:outline-none w-full text-gray-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
            <nav className="flex flex-col gap-4">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-[#2A4365] font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/search"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-[#2A4365] font-medium transition-colors"
              >
                Search
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-[#2A4365] font-medium transition-colors"
              >
                About
              </Link>
              <Link
                to="/map"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-[#2A4365] font-medium transition-colors"
              >
                Map
              </Link>
              <Link
                to="/emi-calculator"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-[#2A4365] font-medium transition-colors"
              >
                EMI Calculator
              </Link>
              {(currentUser?.role === "owner" || currentUser?.role === "admin") && (
                <Link
                  to={currentUser.role === "admin" ? "/admin/dashboard" : "/owner/dashboard"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-[#2A4365] font-medium transition-colors"
                >
                  {currentUser.role === "admin" ? "Admin Panel" : "Owner Panel"}
                </Link>
              )}
              {currentUser ? (
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-700 hover:text-[#2A4365] font-medium transition-colors"
                >
                  <img
                    className="rounded-full h-8 w-8 object-cover"
                    src={currentUser.avatar}
                    alt="profile"
                  />
                  <span>Profile</span>
                </Link>
              ) : (
                <Link
                  to="/sign-in"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-700 hover:text-[#2A4365] font-medium transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
