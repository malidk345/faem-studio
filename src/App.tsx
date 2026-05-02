import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import SignIn from './pages/SignIn';
import Shop from './pages/Shop';
import Admin from './pages/Admin';
import Account from './pages/Account';
import Wishlist from './pages/Wishlist';
import OrderSuccess from './pages/OrderSuccess';
import OrderError from './pages/OrderError';
import NotFound from './pages/NotFound';
import Legal from './pages/Legal';
import Cart from './pages/Cart';
import Contact from './pages/Contact';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import MainLayout from './layouts/MainLayout';
import { GlobalPageLoader } from './components/GlobalPageLoader';
import { Toaster } from 'sonner';
import { AnimatePresence, motion } from 'motion/react';

function AppRoutes() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.3
  };

  return (
    <>
      <GlobalPageLoader isLoading={loading} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/fatihveemirinadminportali" element={
            <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}>
              <Admin />
            </motion.div>
          } />
          <Route path="/" element={<MainLayout><motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}><Home /></motion.div></MainLayout>} />
          <Route path="/shop" element={<MainLayout><motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}><Shop /></motion.div></MainLayout>} />
          <Route path="/product/:id" element={<MainLayout><motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}><ProductDetail /></motion.div></MainLayout>} />
          <Route path="/cart" element={<MainLayout><motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}><Cart /></motion.div></MainLayout>} />
          <Route path="/checkout" element={<MainLayout><motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}><Checkout /></motion.div></MainLayout>} />
          <Route path="/signin" element={<MainLayout><motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}><SignIn /></motion.div></MainLayout>} />
          <Route path="/account" element={<MainLayout><motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}><Account /></motion.div></MainLayout>} />
          <Route path="/wishlist" element={<MainLayout><motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}><Wishlist /></motion.div></MainLayout>} />
          <Route path="/order/success/:id" element={<MainLayout><motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}><OrderSuccess /></motion.div></MainLayout>} />
          <Route path="/order/error" element={<MainLayout><motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}><OrderError /></motion.div></MainLayout>} />
          <Route path="/legal/distance-sales" element={<MainLayout><motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}><Legal /></motion.div></MainLayout>} />
          <Route path="/legal/returns" element={<MainLayout><motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}><Legal /></motion.div></MainLayout>} />
          <Route path="/legal/privacy" element={<MainLayout><motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}><Legal /></motion.div></MainLayout>} />
          <Route path="/legal/about" element={<MainLayout><motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}><Legal /></motion.div></MainLayout>} />
          <Route path="/contact" element={<MainLayout><motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}><Contact /></motion.div></MainLayout>} />
          <Route path="*" element={<MainLayout><motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={pageTransition}><NotFound /></motion.div></MainLayout>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Toaster position="top-center" richColors />
            <AppRoutes />
          </Router>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
