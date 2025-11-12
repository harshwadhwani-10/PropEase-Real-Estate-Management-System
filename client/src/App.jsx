import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import About from './pages/About';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import CreateListing from './pages/CreateListing';
import UpdateListing from './pages/UpdateListing';
import Listing from './pages/Listing';
import Search from './pages/Search';
import Map from './pages/Map';
import EMICalculator from './pages/EMICalculator';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerListings from './pages/owner/OwnerListings';
import OwnerCreateListing from './pages/owner/OwnerCreateListing';
import OwnerEditListing from './pages/owner/OwnerEditListing';
import OwnerProfile from './pages/owner/OwnerProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageListings from './pages/admin/ManageListings';
import AdminNotifications from './pages/admin/AdminNotifications';
import OwnerInquiries from './pages/owner/OwnerInquiries';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/sign-in' element={<SignIn />} />
          <Route path='/sign-up' element={<SignUp />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password' element={<ResetPassword />} />
          <Route path='/about' element={<About />} />
          <Route path='/search' element={<Search />} />
          <Route path='/map' element={<Map />} />
          <Route path='/emi-calculator' element={<EMICalculator />} />
          <Route path='/listing/:listingId' element={<Listing />} />

          <Route element={<PrivateRoute />}>
            <Route path='/profile' element={<Profile />} />
            <Route
              path='/update-listing/:listingId'
              element={<UpdateListing />}
            />
          </Route>

          {/* Owner Routes - No Layout (dashboard pages) */}
          <Route element={<PrivateRoute />}>
            <Route element={<RoleProtectedRoute allowedRoles={['owner', 'admin']} />}>
              <Route path='/owner/dashboard' element={<OwnerDashboard />} />
              <Route path='/owner/listings' element={<OwnerListings />} />
              <Route path='/owner/create-listing' element={<OwnerCreateListing />} />
              <Route path='/owner/edit-listing/:listingId' element={<OwnerEditListing />} />
              <Route path='/owner/inquiries' element={<OwnerInquiries />} />
              <Route path='/owner/profile' element={<OwnerProfile />} />
            </Route>
          </Route>

          {/* Admin Routes - No Layout (dashboard pages) */}
          <Route element={<PrivateRoute />}>
            <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
              <Route path='/admin/dashboard' element={<AdminDashboard />} />
              <Route path='/admin/users' element={<ManageUsers />} />
              <Route path='/admin/listings' element={<ManageListings />} />
              <Route path='/admin/notifications' element={<AdminNotifications />} />
            </Route>
          </Route>
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
