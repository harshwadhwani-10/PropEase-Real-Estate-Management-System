import { useLocation } from "react-router-dom";
import Header from "./Header";

export default function ConditionalHeader() {
  const location = useLocation();
  
  // Hide header on dashboard pages
  const hideHeader = 
    location.pathname.startsWith("/owner/") || 
    location.pathname.startsWith("/admin/");
  
  if (hideHeader) {
    return null;
  }
  
  return <Header />;
}
