import { useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

export default function Layout({ children }) {
  const location = useLocation();

  // Hide header and footer on dashboard pages
  const hideHeaderFooter =
    location.pathname.startsWith("/owner/") ||
    location.pathname.startsWith("/admin/");

  // Hide footer on map page
  const hideFooter = location.pathname === "/map";

  if (hideHeaderFooter) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
