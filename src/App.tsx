import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import SignIn from './pages/SignIn';
import Shop from './pages/Shop';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/signin" element={<SignIn />} />
            </Routes>
          </MainLayout>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
