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
      {/* Admin Route - Isolated from MainLayout */}
      <Route path="/fatihveemirinadminportali" element={<Admin />} />
      
      {/* Storefront Routes - Wrapped in MainLayout */}
      <Route path="*" element={
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/account" element={<Account />} />
            {/* Catch-all to Home if path not found */}
            <Route path="*" element={<Home />} />
          </Routes>
        </MainLayout>
      } />
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
