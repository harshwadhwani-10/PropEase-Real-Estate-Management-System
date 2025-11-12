import { FaHome, FaList, FaPlus, FaUser, FaEnvelope } from "react-icons/fa";
import UpdateListing from "../UpdateListing";
import DashboardLayout from "../../components/DashboardLayout";

const menuItems = [
  { path: "/owner/dashboard", label: "Dashboard", icon: FaHome },
  { path: "/owner/listings", label: "My Listings", icon: FaList },
  { path: "/owner/create-listing", label: "Create Listing", icon: FaPlus },
  { path: "/owner/inquiries", label: "Inquiries", icon: FaEnvelope },
  { path: "/owner/profile", label: "Profile", icon: FaUser },
];

export default function OwnerEditListing() {
  return (
    <DashboardLayout menuItems={menuItems} title="Owner Panel">
      <div className="p-6">
        <UpdateListing />
      </div>
    </DashboardLayout>
  );
}

