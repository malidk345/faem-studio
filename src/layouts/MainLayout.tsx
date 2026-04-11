import React from 'react';
import Header from '../components/Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative overflow-x-hidden font-sans" style={{ backgroundColor: '#FFFFFF' }}>
      <Header />
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
