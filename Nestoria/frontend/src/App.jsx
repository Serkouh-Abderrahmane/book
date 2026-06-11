import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from './hooks/useTheme.js';
import { useTweaks } from './hooks/useTweaks.js';
import Header from './components/Header.jsx';
import MobileNav from './components/MobileNav.jsx';
import Footer from './components/Footer.jsx';
import TweaksPanel from './components/TweaksPanel.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import GlobalErrorCapture from './components/GlobalErrorCapture.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import HostLayout from './components/HostLayout.jsx';

import HomeScreen        from './screens/HomeScreen.jsx';
import HotelsScreen      from './screens/HotelsScreen.jsx';
import DetailScreen      from './screens/DetailScreen.jsx';
import BookingScreen     from './screens/BookingScreen.jsx';
import LoginScreen       from './screens/LoginScreen.jsx';
import ProfileScreen     from './screens/ProfileScreen.jsx';
import ReservationScreen from './screens/ReservationScreen.jsx';
import HostDashboardScreen from './screens/HostDashboardScreen.jsx';
import HostRoomsScreen   from './screens/HostRoomsScreen.jsx';
import HostBookingsScreen from './screens/HostBookingsScreen.jsx';
import HostProfileScreen from './screens/HostProfileScreen.jsx';
import HostSettingsScreen from './screens/HostSettingsScreen.jsx';
import AddRoomsScreen    from './screens/AddRoomsScreen.jsx';
import AboutScreen       from './screens/AboutScreen.jsx';
import JournalScreen     from './screens/JournalScreen.jsx';
import JournalPostScreen from './screens/JournalPostScreen.jsx';
import HelpScreen        from './screens/HelpScreen.jsx';
import ContactScreen     from './screens/ContactScreen.jsx';
import LegalScreen       from './screens/LegalScreen.jsx';
import BecomeHostScreen  from './screens/BecomeHostScreen.jsx';
import ViewingsScreen    from './screens/ViewingsScreen.jsx';
import NotFoundScreen    from './screens/NotFoundScreen.jsx';

import AdminDashboardScreen from './screens/AdminDashboardScreen.jsx';
import AdminHotelsScreen    from './screens/AdminHotelsScreen.jsx';
import AdminRoomsScreen     from './screens/AdminRoomsScreen.jsx';
import AdminBookingsScreen  from './screens/AdminBookingsScreen.jsx';
import AdminViewingsScreen  from './screens/AdminViewingsScreen.jsx';
import AdminReviewsScreen   from './screens/AdminReviewsScreen.jsx';
import AdminCustomersScreen from './screens/AdminCustomersScreen.jsx';
import AdminSettingsScreen  from './screens/AdminSettingsScreen.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      setAnimate(true);
      prevPath.current = location.pathname;
    }
  }, [location.pathname]);

  return (
    <main className={`main ${animate ? 'page-transition' : ''}`}
      onAnimationEnd={() => setAnimate(false)}>
      <Routes location={location}>
        <Route path="/"                element={<HotelsScreen />} />
        <Route path="/hotels"          element={<HotelsScreen />} />
        <Route path="/home"            element={<HomeScreen />} />
        <Route path="/hotel/:slug"     element={<DetailScreen />} />
        <Route path="/booking"         element={<ProtectedRoute requireRole="customer"><BookingScreen /></ProtectedRoute>} />
        <Route path="/login"           element={<LoginScreen />} />
        <Route path="/profile"         element={<ProtectedRoute requireRole="customer"><ProfileScreen /></ProtectedRoute>} />
        <Route path="/reservations/:id" element={<ProtectedRoute requireRole="customer"><ReservationScreen /></ProtectedRoute>} />
        <Route path="/host/dashboard"  element={<ProtectedRoute requireRole="host"><HostLayout><HostDashboardScreen /></HostLayout></ProtectedRoute>} />
        <Route path="/host/rooms"      element={<ProtectedRoute requireRole="host"><HostLayout><HostRoomsScreen /></HostLayout></ProtectedRoute>} />
        <Route path="/host/bookings"   element={<ProtectedRoute requireRole="host"><HostLayout><HostBookingsScreen /></HostLayout></ProtectedRoute>} />
        <Route path="/host/create-room" element={<ProtectedRoute requireRole="host"><HostLayout><AddRoomsScreen /></HostLayout></ProtectedRoute>} />
        <Route path="/host/viewings"   element={<ProtectedRoute requireRole="host"><HostLayout><ViewingsScreen /></HostLayout></ProtectedRoute>} />
        <Route path="/host/profile"    element={<ProtectedRoute requireRole="host"><HostLayout><HostProfileScreen /></HostLayout></ProtectedRoute>} />
        <Route path="/host/settings"   element={<ProtectedRoute requireRole="host"><HostLayout><HostSettingsScreen /></HostLayout></ProtectedRoute>} />

        {/* Admin routes (wrapped in AdminLayout) */}
        <Route path="/admin"           element={<ProtectedRoute requireRole="admin"><AdminLayout><AdminDashboardScreen /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/hotels"    element={<ProtectedRoute requireRole="admin"><AdminLayout><AdminHotelsScreen /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/rooms"     element={<ProtectedRoute requireRole="admin"><AdminLayout><AdminRoomsScreen /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/bookings"  element={<ProtectedRoute requireRole="admin"><AdminLayout><AdminBookingsScreen /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/viewings"  element={<ProtectedRoute requireRole="admin"><AdminLayout><AdminViewingsScreen /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/reviews"   element={<ProtectedRoute requireRole="admin"><AdminLayout><AdminReviewsScreen /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/customers" element={<ProtectedRoute requireRole="admin"><AdminLayout><AdminCustomersScreen /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/settings"  element={<ProtectedRoute requireRole="admin"><AdminLayout><AdminSettingsScreen /></AdminLayout></ProtectedRoute>} />

        {/* Static editorial pages */}
        <Route path="/about"           element={<AboutScreen />} />
        <Route path="/journal"         element={<JournalScreen />} />
        <Route path="/journal/:slug"   element={<JournalPostScreen />} />
        <Route path="/help"            element={<HelpScreen />} />
        <Route path="/contact"         element={<ContactScreen />} />
        <Route path="/legal"           element={<LegalScreen />} />
        <Route path="/become-host"     element={<BecomeHostScreen />} />

        <Route path="*"                element={<NotFoundScreen />} />
      </Routes>
    </main>
  );
}

export default function App() {
  const [theme, setTheme]   = useTheme();
  const [tweaks, setTweak]  = useTweaks(theme);

  return (
    <BrowserRouter>
      <div className="app">
         <ScrollToTop />
         <Header theme={theme} setTheme={setTheme} />
         <MobileNav />
         <GlobalErrorCapture>
           <AnimatedRoutes />
         </GlobalErrorCapture>
         <Footer />
         <TweaksPanel tweaks={tweaks} setTweak={setTweak} />
       </div>
    </BrowserRouter>
  );
}
