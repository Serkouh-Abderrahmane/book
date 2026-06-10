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
import DebugPanel from './components/DebugPanel.jsx';

import HomeScreen        from './screens/HomeScreen.jsx';
import HotelsScreen      from './screens/HotelsScreen.jsx';
import DetailScreen      from './screens/DetailScreen.jsx';
import BookingScreen     from './screens/BookingScreen.jsx';
import LoginScreen       from './screens/LoginScreen.jsx';
import ProfileScreen     from './screens/ProfileScreen.jsx';
import ReservationScreen from './screens/ReservationScreen.jsx';
import HostScreen        from './screens/HostScreen.jsx';
import AddRoomsScreen    from './screens/AddRoomsScreen.jsx';
import AboutScreen       from './screens/AboutScreen.jsx';
import JournalScreen     from './screens/JournalScreen.jsx';
import JournalPostScreen from './screens/JournalPostScreen.jsx';
import HelpScreen        from './screens/HelpScreen.jsx';
import ContactScreen     from './screens/ContactScreen.jsx';
import LegalScreen       from './screens/LegalScreen.jsx';
import BecomeHostScreen  from './screens/BecomeHostScreen.jsx';
import NotFoundScreen    from './screens/NotFoundScreen.jsx';

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
        <Route path="/host/dashboard"  element={<ProtectedRoute requireRole="host"><HostScreen /></ProtectedRoute>} />
        <Route path="/host/profile"    element={<ProtectedRoute requireRole="host"><HostScreen tab="profile" /></ProtectedRoute>} />
        <Route path="/host/add-rooms"  element={<ProtectedRoute requireRole="host"><AddRoomsScreen /></ProtectedRoute>} />

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
        <DebugPanel />
      </div>
    </BrowserRouter>
  );
}
