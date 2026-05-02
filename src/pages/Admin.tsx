import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  HelpCircle,
  Plug,
  Database,
  ChevronsUpDown,
  Terminal,
  Hexagon,
  UserCircle,
  Square,
  ChevronDown,
  RotateCw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Keyboard,
  Share2,
  MessageSquare,
  EyeOff,
  Activity,
  Bookmark,
  TrendingUp,
  Search,
  ShoppingCart,
  DollarSign,
  Landmark,
  Package,
  Clock,
  CheckCircle,
  Truck,
  ArrowLeft,
  GripVertical,
  LayoutDashboard,
  LayoutPanelLeft,
  LayoutTemplate,
  CreditCard,
  Mail,
  Tag,
  Monitor,
  BookOpen,
  Users,
  Settings as SettingsIcon,
  Plus,
  Percent
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { useAdminData } from '../hooks/useAdminData';
import { DashboardTab } from '../components/Admin/Tabs/DashboardTab';
import { ProductsTab } from '../components/Admin/Tabs/ProductsTab';
import { CategoriesTab } from '../components/Admin/Tabs/CategoriesTab';
import { OrdersTab } from '../components/Admin/Tabs/OrdersTab';
import { ProductEditTab } from '../components/Admin/Tabs/ProductEditTab';
import { JournalTab } from '../components/Admin/Tabs/JournalTab';
import { CustomersTab } from '../components/Admin/Tabs/CustomersTab';
import { SettingsTab } from '../components/Admin/Tabs/SettingsTab';
import { PromotionsTab } from '../components/Admin/Tabs/PromotionsTab';
import { CmsTab } from '../components/Admin/Tabs/CmsTab';
import { MessagesTab } from '../components/Admin/Tabs/MessagesTab';
import { ReviewsTab } from '../components/Admin/Tabs/ReviewsTab';
import { HeaderNotifications } from '../components/Admin/HeaderNotifications';
import { BulkImportModal } from '../components/Admin/Modals/BulkImportModal';
import { HelpTab } from '../components/Admin/Tabs/HelpTab';

const navGroups = [
  { title: "Dashboard", url: "dashboard", icon: LayoutDashboard },
  { title: "Siparişler", url: "orders", icon: ShoppingCart },
  { title: "Ürünler", url: "products", icon: Package },
  { title: "Kategoriler", url: "categories", icon: Tag },
  { title: "Koleksiyonlar", url: "collections", icon: Bookmark },
  { title: "Kuponlar", url: "promotions", icon: Percent },
  { title: "Yorumlar", url: "reviews", icon: MessageSquare },
  { title: "Müşteriler", url: "customers", icon: Users },
  { title: "Mesajlar", url: "messages", icon: Mail },
  { title: "Vitrin", url: "cms", icon: Monitor },
  { title: "Günlük", url: "journal", icon: BookOpen },
  { title: "Ayarlar", url: "settings", icon: SettingsIcon },
  { title: "Yardım", url: "help", icon: HelpCircle },
];

export default function Admin() {
  const {
    isAdmin, products, orders, categories, collections, messages, customers, settings, loading,
    deleteProduct, publishProduct, addCategory, deleteCategory, addCollection, deleteCollection,
    updateProduct, updateOrderStatus,
    toggleMessageRead, deleteMessage, updateSettings, refreshData, clearAllProducts
  } = useAdminData();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  React.useEffect(() => {
    setIsEditing(false);
  }, [activeTab]);

  React.useEffect(() => {
    document.body.classList.add('admin-theme');
    return () => document.body.classList.remove('admin-theme');
  }, []);

  if (isAdmin === null || (loading && isAdmin === true && products.length === 0)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white admin-theme">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-10 h-10 border-2 border-emerald-600 rounded-full border-t-transparent animate-spin"
        />
        <p className="mt-4 text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-600 font-mono">Sistem Yükleniyor...</p>
      </div>
    );
  }

  if (isAdmin === 'LOGIN') {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-8 bg-white text-black text-center p-6 admin-theme">
        <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl">
          <ShoppingCart className="text-3xl text-white" />
        </div>
        <h2 className="text-3xl font-black tracking-tighter">Yönetici Girişi Gerekli</h2>
        <Link to="/signin?redirect=/fatihveemirinadminportali" className="bg-emerald-600 text-white px-10 py-4 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200">
          Giriş Yap
        </Link>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-8 bg-white text-black text-center p-6 admin-theme">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center shadow-2xl border border-red-100">
          <span className="text-3xl font-black">!</span>
        </div>
        <h2 className="text-3xl font-black tracking-tighter">Yetkisiz Erişim</h2>
        <p className="text-sm font-medium text-black/50 max-w-sm">
          Bu paneli görüntülemek için yönetici yetkilerine sahip olmanız gerekmektedir.
        </p>
        <Link to="/" className="bg-black text-white px-10 py-4 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all">
          Mağazaya Dön
        </Link>
      </div>
    );
  }

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-[#1c1c1c] font-sans admin-theme selection:bg-emerald-50 selection:text-emerald-900">
      {/* Sticky Header Container */}
      <div className="sticky top-0 z-50 bg-white flex flex-col">
        {/* Top Navigation */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded text-emerald-600 bg-emerald-50">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div className="flex flex-col relative">
              <button 
                onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                className="flex items-center gap-1 text-[14px] font-medium leading-tight hover:text-emerald-600 transition-colors cursor-pointer outline-none"
              >
                Faem Admin Panel
                <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
              
              {/* Dropdown */}
              <AnimatePresence>
                {isAdminMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 mt-1.5 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 flex flex-col overflow-hidden"
                  >
                    <Link to="/" className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4 text-gray-400" />
                      Mağazaya Dön
                    </Link>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-gray-400" />
                      Sistem Kayıtları
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <Database className="w-4 h-4 text-gray-400" />
                      Veritabanı
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-1 text-[12px] text-emerald-600 font-medium leading-tight mt-0.5">
                <Activity className="w-3 h-3" />
                Sistem Aktif
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">
              <Plug className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">
              <Search className="w-3.5 h-3.5" />
            </button>
            <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200 cursor-pointer ring-2 ring-transparent hover:ring-gray-300 transition-all">
              <img src="https://picsum.photos/seed/admin/32/32" alt="Admin" className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              {isMenuOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
            </button>
          </div>
        </header>

        {/* Sub Navigation */}
        <div className="hidden md:flex items-center justify-between px-4 py-2 border-b border-gray-200 overflow-x-auto hide-scrollbar bg-white">
          <div className="flex items-center gap-1">
            {navGroups.map((item) => (
              <button
                key={item.url}
                onClick={() => handleTabChange(item.url)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all whitespace-nowrap ${
                  activeTab === item.url 
                  ? 'bg-emerald-50 text-emerald-600' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2.5 ml-4">
            <span className="text-[12px] font-medium text-gray-400 mr-1">Destek</span>
            <button className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 relative hover:bg-gray-50">
              <UserCircle className="w-3.5 h-3.5" />
              <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-white"></div>
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50">
              <Terminal className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 relative hover:bg-emerald-100">
              <Hexagon className="w-4 h-4" />
              <div className="absolute w-1 h-1 bg-emerald-600 rounded-full"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Compact Full Screen Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 top-[45px] bg-white z-50 md:hidden flex flex-col"
          >
            <div className="flex-1 overflow-y-auto">
              <nav className="divide-y divide-gray-50">
                {navGroups.map((item, index) => (
                  <motion.button
                    key={item.url}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => {
                      handleTabChange(item.url);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-6 py-4 transition-all active:bg-gray-50 ${
                      activeTab === item.url 
                        ? 'bg-emerald-50/50 text-emerald-600' 
                        : 'text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className={`w-4 h-4 ${activeTab === item.url ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <span className={`text-[13px] font-bold tracking-tight ${activeTab === item.url ? 'text-emerald-700' : ''}`}>
                        {item.title}
                      </span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 ${activeTab === item.url ? 'text-emerald-600' : 'text-gray-300'}`} />
                  </motion.button>
                ))}
              </nav>
            </div>

            <div className="p-6 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Faem Studio Admin</span>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="text-[10px] font-black uppercase tracking-widest text-emerald-600"
              >
                Kapat
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="px-4 py-6 md:px-8 max-w-5xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (isEditing ? '_editing' : '_listing')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {activeTab === 'dashboard' && <DashboardTab orders={orders} products={products} />}

            {activeTab === 'products' && (
              isEditing ? (
                <ProductEditTab
                  product={editingProduct}
                  categories={categories}
                  collections={collections}
                  onSave={(data) => {
                    if (editingProduct) updateProduct(editingProduct.id, data);
                    else publishProduct(data);
                    setIsEditing(false);
                    setEditingProduct(null);
                  }}
                  onAddCategory={addCategory}
                  onAddCollection={addCollection}
                  onCancel={() => { setIsEditing(false); setEditingProduct(null); }}
                  onDelete={deleteProduct}
                />
              ) : (
                <ProductsTab
                  products={products}
                  onAdd={() => { setEditingProduct(null); setIsEditing(true); }}
                  onBulkImport={() => setIsBulkImportOpen(true)}
                  onEdit={(p) => { setEditingProduct(p); setIsEditing(true); }}
                  onDelete={deleteProduct}
                  onArchive={(id, is_archived) => updateProduct(id, { is_archived })}
                  onClearAll={clearAllProducts}
                />
              )
            )}

            {activeTab === 'categories' && <CategoriesTab categories={categories} onAdd={addCategory} onDelete={deleteCategory} />}
            {activeTab === 'collections' && <CategoriesTab categories={collections} onAdd={addCollection} onDelete={deleteCollection} isCollection />}
            {activeTab === 'orders' && <OrdersTab orders={orders} onUpdateStatus={updateOrderStatus} />}
            {activeTab === 'customers' && <CustomersTab customers={customers} orders={orders} />}
            {activeTab === 'promotions' && <PromotionsTab />}
            {activeTab === 'reviews' && <ReviewsTab />}
            {activeTab === 'journal' && <JournalTab />}
            {activeTab === 'cms' && <CmsTab collections={collections} />}
            {activeTab === 'settings' && <SettingsTab settings={settings} onUpdateSettings={updateSettings} />}
            {activeTab === 'messages' && <MessagesTab messages={messages} onToggleRead={toggleMessageRead} onDelete={deleteMessage} />}
            {activeTab === 'help' && <HelpTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        refreshData={refreshData}
        onSuccess={() => {
          setIsBulkImportOpen(false);
        }}
      />
    </div>
  );
}
