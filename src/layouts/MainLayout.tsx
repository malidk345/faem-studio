import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative overflow-x-hidden font-sans flex flex-col" style={{ backgroundColor: '#FFFFFF' }}>
      <Header />
      <main className="relative z-10 flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
