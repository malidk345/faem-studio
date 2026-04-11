import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, Tags, Settings as SettingsIcon,
  Search, X, Menu, ArrowRight
} from 'lucide-react';

import { useAdminData } from '../hooks/useAdminData';
import { DashboardTab } from '../components/Admin/Tabs/DashboardTab';
import { ProductsTab } from '../components/Admin/Tabs/ProductsTab';
import { CategoriesTab } from '../components/Admin/Tabs/CategoriesTab';
import { OrdersTab } from '../components/Admin/Tabs/OrdersTab';
import { ProductModal } from '../components/Admin/Modals/ProductModal';

type Tab = 'dashboard' | 'products' | 'categories' | 'orders' | 'customers' | 'settings';

export default function Admin() {
  const { 
    isAdmin, products, orders, categories, loading, 
    deleteProduct, publishProduct, addCategory, updateProduct, updateOrderStatus 
  } = useAdminData();
  
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddProductModalOpen, setAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  if (isAdmin === null || (loading && isAdmin === true && products.length === 0)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#FDFDFD]">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-12 h-12 border-2 border-black rounded-full border-t-transparent"
        />
        <p className="mt-4 text-[10px] uppercase font-black tracking-[0.5em] text-black">Studio Loading</p>
      </div>
    );
  }

  if (isAdmin === 'LOGIN') {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-8 bg-[#FDFDFD] text-black text-center p-6">
        <div className="relative">
            <div className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center transform -rotate-12 shadow-2xl">
                <span className="text-4xl text-white font-black">F</span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black border-4 border-[#FDFDFD] rounded-full" />
        </div>
        <div>
            <h2 className="text-3xl font-black tracking-tighter mb-2">Access Restricted</h2>
            <p className="text-black/40 text-sm max-w-xs mx-auto leading-relaxed">Please sign in with an authorized account to access the administrative terminal.</p>
        </div>
        <Link to="/signin" className="group bg-black text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl shadow-black/20 hover:bg-zinc-800 transition-all flex items-center gap-3">
          Identify Account <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 bg-[#FDFDFD] text-black text-center p-6">
        <h2 className="text-3xl font-black tracking-tighter">Unauthorized</h2>
        <p className="text-black/40 text-sm max-w-xs mx-auto">This area is reserved for production administrators.</p>
        <Link to="/" className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1">Return to Storefront</Link>
      </div>
    );
  }

  const handleTabSwitch = (tab: Tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex text-black selection:bg-black selection:text-white">
      
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 z-[60] md:hidden backdrop-blur-xl"
          />
        )}
      </AnimatePresence>

      {/* Modern Sidebar */}
      <aside className={`w-80 bg-white border-r border-black/5 flex flex-col fixed h-screen z-[70] transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-10 pb-12">
          <Link to="/" className="text-3xl font-black tracking-tighter block">FAEM</Link>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <p className="text-[9px] uppercase tracking-[0.3em] text-black/40 font-black">Admin Terminal v2.0</p>
          </div>
        </div>
        
        <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto hide-scrollbar">
          <NavButton active={activeTab === 'dashboard'} onClick={() => handleTabSwitch('dashboard')} icon={<LayoutDashboard size={20} />} label="Genel Bakış" />
          <NavButton active={activeTab === 'products'} onClick={() => handleTabSwitch('products')} icon={<Package size={20} />} label="Ürün Yönetimi" count={products.length} />
          <NavButton active={activeTab === 'categories'} onClick={() => handleTabSwitch('categories')} icon={<Tags size={20} />} label="Koleksiyonlar" />
          <div className="h-px bg-black/5 my-6 mx-4" />
          <NavButton active={activeTab === 'orders'} onClick={() => handleTabSwitch('orders')} icon={<ShoppingCart size={20} />} label="Siparişler" count={orders.filter(o => o.status === 'beklemede').length} />
          <NavButton active={activeTab === 'customers'} onClick={() => handleTabSwitch('customers')} icon={<Users size={20} />} label="Müşteriler" />
        </nav>
        
        <div className="p-8 mt-auto border-t border-black/5">
           <div className="p-4 bg-black/[0.02] rounded-[1.5rem] flex items-center gap-4 group cursor-pointer hover:bg-black/[0.04] transition-colors">
              <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-black shadow-lg shadow-black/20 group-hover:scale-105 transition-transform">AD</div>
              <div className="flex-1">
                  <p className="text-xs font-black leading-none">Administrator</p>
                  <p className="text-[9px] text-black/30 font-bold uppercase mt-1 tracking-widest">Master Access</p>
              </div>
              <SettingsIcon size={16} className="text-black/20 group-hover:rotate-45 transition-transform" />
           </div>
        </div>
      </aside>

      {/* Main Content Terminal */}
      <main className="flex-1 md:ml-80 min-h-screen">
        
        {/* Superior Header */}
        <header className="sticky top-0 z-50 bg-[#FDFDFD]/80 backdrop-blur-2xl border-b border-black/5 px-8 md:px-12 py-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
                onClick={() => setIsMobileMenuOpen(true)} 
                className="md:hidden w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center hover:scale-95 transition-transform active:scale-90"
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight capitalize">
                   {activeTab === 'dashboard' ? 'Sistem Özeti' : 
                    activeTab === 'products' ? 'Envanter Kontrolü' :
                    activeTab === 'categories' ? 'Kategori Mimarisi' :
                    activeTab === 'orders' ? 'Sipariş Akışı' :
                    activeTab === 'customers' ? 'Müşteri İlişkileri' : 'Sistem Ayarları'}
              </h1>
              <p className="text-[10px] uppercase font-bold text-black/30 tracking-widest mt-0.5">Studio Management Portal / {activeTab}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-4 px-6 py-3 bg-black/[0.03] rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Sistem Çevrimiçi</span>
              </div>
              <button className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-xl shadow-black/10 hover:scale-105 transition-transform active:scale-95">
                  <Search size={18} />
              </button>
          </div>
        </header>

        {/* Dynamic Tab Container */}
        <div className="p-8 md:p-12 pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'dashboard' && <DashboardTab orders={orders} products={products} />}
              {activeTab === 'products' && (
                <ProductsTab 
                  products={products} 
                  onAdd={() => { setEditingProduct(null); setAddProductModalOpen(true); }} 
                  onEdit={(p) => { setEditingProduct(p); setAddProductModalOpen(true); }}
                  onDelete={deleteProduct} 
                />
              )}
              {activeTab === 'categories' && (
                <CategoriesTab 
                  categories={categories} 
                  onAdd={addCategory} 
                />
              )}
              {activeTab === 'orders' && <OrdersTab orders={orders} onUpdateStatus={updateOrderStatus} />}
              
              {/* placeholder for other tabs */}
              {['customers', 'settings'].includes(activeTab) && (
                  <div className="flex flex-col items-center justify-center py-40 bg-black/[0.02] rounded-[3rem] border-2 border-dashed border-black/5">
                      <div className="w-20 h-20 bg-black/5 rounded-[2rem] flex items-center justify-center mb-6">
                          <Package size={32} className="text-black/10" />
                      </div>
                      <h3 className="text-xl font-black tracking-tight">Modül Hazırlanıyor</h3>
                      <p className="text-black/40 text-xs font-medium mt-1">Bu bölüm v2.1 güncellemesi ile aktif edilecektir.</p>
                  </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Super Modal */}
      <AnimatePresence>
        {isAddProductModalOpen && (
          <ProductModal 
            onClose={() => { setAddProductModalOpen(false); setEditingProduct(null); }} 
            categories={categories} 
            initialData={editingProduct}
            onPublish={(data) => {
               if (editingProduct) {
                  updateProduct(editingProduct.id, data);
               } else {
                  publishProduct(data);
               }
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, label, icon, onClick, count }: any) {
  return (
    <button 
      onClick={onClick}
      className={`relative group flex items-center justify-between w-full px-6 py-5 rounded-[1.5rem] transition-all duration-500 overflow-hidden ${
        active 
          ? 'bg-black text-white shadow-2xl shadow-black/20' 
          : 'text-black/40 hover:bg-black/5 hover:text-black'
      }`}
    >
      <div className="flex items-center gap-4 relative z-10">
        <span className={`${active ? 'scale-110' : 'opacity-70 group-hover:scale-110'} transition-transform duration-500`}>
          {icon}
        </span>
        <span className={`text-[11px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} transition-opacity`}>
          {label}
        </span>
      </div>
      
      {count !== undefined && (
        <span className={`relative z-10 text-[9px] font-black px-3 py-1 rounded-full ${active ? 'bg-white/10 text-white' : 'bg-black/5 text-black/30'} group-hover:scale-110 transition-transform`}>
          {count}
        </span>
      )}

      {/* Background Pulse for Active */}
      {active && (
        <motion.div 
            layoutId="nav-glow"
            className="absolute inset-0 bg-gradient-to-r from-black via-zinc-900 to-black pointer-events-none"
        />
      )}
    </button>
  );
}
