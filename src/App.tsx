import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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

function AppRoutes() {
  return (
    <Routes>
      {/* Admin Route - Strictly isolated */}
      <Route path="/fatihveemirinadminportali" element={<Admin />} />

      {/* Storefront Routes - Consistently wrapped through MainLayout or individual elements */}
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/shop" element={<MainLayout><Shop /></MainLayout>} />
      <Route path="/product/:id" element={<MainLayout><ProductDetail /></MainLayout>} />
      <Route path="/checkout" element={<MainLayout><Checkout /></MainLayout>} />
      <Route path="/signin" element={<MainLayout><SignIn /></MainLayout>} />
      <Route path="/account" element={<MainLayout><Account /></MainLayout>} />
      
      {/* Catch-all redirect to Home */}
      <Route path="*" element={<MainLayout><Home /></MainLayout>} />
    </Routes>
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
