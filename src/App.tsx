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

function AppRoutes() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Only show loader if we feel a delay is coming - for now, we'll keep it disabled for instant routes 
    // and only use it for initial mount or specific slow actions if needed.
    // REMOVED FORCED TIMER PER USER REQUEST
  }, [location.pathname]);

  return (
    <>
      <GlobalPageLoader isLoading={loading} />
      <Routes>
        <Route path="/fatihveemirinadminportali" element={<Admin />} />
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/shop" element={<MainLayout><Shop /></MainLayout>} />
        <Route path="/product/:id" element={<MainLayout><ProductDetail /></MainLayout>} />
        <Route path="/cart" element={<MainLayout><Cart /></MainLayout>} />
        <Route path="/checkout" element={<MainLayout><Checkout /></MainLayout>} />
        <Route path="/signin" element={<MainLayout><SignIn /></MainLayout>} />
        <Route path="/account" element={<MainLayout><Account /></MainLayout>} />
        <Route path="/wishlist" element={<MainLayout><Wishlist /></MainLayout>} />
        <Route path="/order/success/:id" element={<MainLayout><OrderSuccess /></MainLayout>} />
        <Route path="/order/error" element={<MainLayout><OrderError /></MainLayout>} />
        <Route path="/legal/distance-sales" element={<MainLayout><Legal /></MainLayout>} />
        <Route path="/legal/returns" element={<MainLayout><Legal /></MainLayout>} />
        <Route path="/legal/privacy" element={<MainLayout><Legal /></MainLayout>} />
        <Route path="/legal/about" element={<MainLayout><Legal /></MainLayout>} />
        <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppRoutes />
          </Router>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
