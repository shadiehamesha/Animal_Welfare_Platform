import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/homepage.jsx';
import About from './pages/about.jsx';
import ContactUs from './pages/contactus.jsx';
import PrivacyPolicy from './pages/privacypolicy.jsx';
import Login from './pages/login.jsx';
import SignUp from './pages/signup.jsx';
import StrayReport from './pages/strayreport.jsx';
import Hospitals from './pages/hospitals.jsx';
import Shelters from './pages/shelters.jsx';
import StrayMap from './pages/straymap.jsx';
import Events from './pages/events.jsx';
import Medicine from './pages/medicine.jsx';
import Alerts from './pages/alerts.jsx';
import Community from './pages/community.jsx';
import CommunityPostDetail from './pages/CommunityPostDetail.jsx';
import Pharmacy from './pages/pharmacy.jsx';
import Pets from './pages/pets.jsx';
import Blog from './pages/blog.jsx';
import Careers from './pages/careers.jsx';
import Search from './pages/searchresults.jsx';
import ForgotPassword from './pages/auth/forgotpassword.jsx';
import ResetPassword from './pages/auth/resetpassword.jsx';

import ProtectedRoute from './utils/ProtectedRoute.jsx';
import UserDashboard from './pages/dashboards/UserDashboard.jsx';
import AdminDashboard from './pages/dashboards/AdminDashboard.jsx';
import OrganizationDashboard from './pages/dashboards/OrganizationDashboard.jsx';
import PharmacyDashboard from './pages/dashboards/PharmacyDashboard.jsx';
import HospitalDashboard from './pages/dashboards/HospitalDashboard.jsx';
import UserManagement from './pages/dashboards/UserManagement.jsx';
import AdminContactManagement from './pages/dashboards/AdminContactManagement.jsx';
import AdminHospitalManagement from './pages/dashboards/AdminHospitalManagement.jsx';
import AdminOrganizationManagement from './pages/dashboards/AdminOrganizationManagement.jsx';
import AdminCommunityModeration from './pages/dashboards/AdminCommunityModeration.jsx';
import AdminEventManagement from './pages/dashboards/AdminEventManagement.jsx';
import AdminStrayManagement from './pages/dashboards/AdminStrayManagement.jsx';
import AdminPharmacyManagement from './pages/dashboards/AdminPharmacyManagement.jsx';

function App() {
  return (
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/privacy" element={<PrivacyPolicy />}/>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/report" element={<StrayReport />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/shelters" element={<Shelters />} />
        <Route path="/map" element={<StrayMap />} />
        <Route path="/events" element={<Events />} />
        <Route path="/medicines" element={<Medicine />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/post/:id" element={<CommunityPostDetail />} />
        <Route path="/pharmacies" element={<Pharmacy />} />
        <Route path="/pets" element={<Pets />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/search" element={<Search />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard/user" element={<UserDashboard />} />
          <Route path="/dashboard/organization" element={<OrganizationDashboard />} />
          <Route path="/dashboard/pharmacy" element={<PharmacyDashboard />} />
          <Route path="/dashboard/hospital" element={<HospitalDashboard />} />
        </Route>

        {/* Admin Only Route */}
        <Route element={<ProtectedRoute allowedRoles={['system admin']} />}>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/users" element={<UserManagement />} />
          <Route path="/dashboard/admin/contacts" element={<AdminContactManagement />} />
          <Route path="/dashboard/admin/hospitals" element={<AdminHospitalManagement />} />
          <Route path="/dashboard/admin/pharmacies" element={<AdminPharmacyManagement />} />
          <Route path="/dashboard/admin/organizations" element={<AdminOrganizationManagement />} />
          <Route path="/dashboard/admin/moderation" element={<AdminCommunityModeration />} />
          <Route path="/dashboard/admin/events" element={<AdminEventManagement />} />
          <Route path="/dashboard/admin/strays" element={<AdminStrayManagement />} />
        </Route>
      </Routes>
  );
}

export default App;