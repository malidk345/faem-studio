import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import SignIn from './pages/SignIn';
import Shop from './pages/Shop';
import Admin from './pages/Admin';
import Account from './pages/Account';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import MainLayout from './layouts/MainLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalPageLoader } from './components/GlobalPageLoader';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/fatihveemirinadminportali" element={<Admin />} />
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/shop" element={<MainLayout><Shop /></MainLayout>} />
      <Route path="/product/:id" element={<MainLayout><ProductDetail /></MainLayout>} />
      <Route path="/checkout" element={<MainLayout><Checkout /></MainLayout>} />
      <Route path="/signin" element={<MainLayout><SignIn /></MainLayout>} />
      <Route path="/account" element={<MainLayout><Account /></MainLayout>} />
      <Route path="*" element={<MainLayout><Home /></MainLayout>} />
    </Routes>
  );
}

export default function App() {
  const [appLoading, setAppLoading] = React.useState(true);

  React.useEffect(() => {
    // Elegant splash loader timing
    const timer = setTimeout(() => setAppLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <GlobalPageLoader isLoading={appLoading} />
            <Router>
               <AnimatePresence mode="wait">
                 {!appLoading && <AppRoutes />}
               </AnimatePresence>
            </Router>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

import { AnimatePresence } from 'motion/react';
