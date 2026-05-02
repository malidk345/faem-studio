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
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const {
    isAdmin, products, orders, categories, collections, messages, customers, settings, loading,
    deleteProduct, publishProduct, addCategory, deleteCategory, addCollection, deleteCollection,
    updateProduct, updateOrderStatus,
    toggleMessageRead, deleteMessage, updateSettings, refreshData, clearAllProducts,
    hasError
  } = useAdminData();
  const { logout } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
                  <>
                    {/* Backdrop for closing */}
                    <div 
                      className="fixed inset-0 z-[40]" 
                      onClick={() => setIsAdminMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ 
                        type: "spring", 
                        damping: 25, 
                        stiffness: 400,
                        mass: 0.5
                      }}
                      style={{ willChange: "transform, opacity" }}
                      className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-2xl border border-gray-200/50 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-[50] py-1.5 flex flex-col overflow-hidden origin-top-left"
                    >
                      <div className="px-3 py-2 mb-1 border-b border-gray-100/50 bg-gray-50/50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hızlı Erişim</span>
                      </div>
                      
                      <Link 
                        to="/" 
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-white transition-colors">
                            <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                          </div>
                          <span className="font-semibold">Mağazaya Dön</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </Link>

                      <div className="h-px bg-gray-100/50 my-1"></div>

                      <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between group transition-all">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Terminal className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="font-semibold text-gray-600">Sistem Kayıtları</span>
                        </div>
                        <div className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-400 group-hover:bg-white transition-colors">ALT+L</div>
                      </button>

                      <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between group transition-all">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Database className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="font-semibold text-gray-600">Veritabanı</span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] mr-1"></div>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-1 text-[12px] text-emerald-600 font-medium leading-tight mt-0.5">
                <Activity className="w-3 h-3" />
                Sistem Aktif
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Dashboard'da ara..."
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-[12px] w-48 placeholder:text-gray-400"
              />
              {globalSearchTerm && (
                <button onClick={() => setGlobalSearchTerm('')}>
                  <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="sm:hidden w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            <button
              title={hasError ? "Veritabanı Bağlantı Hatası" : "Veritabanı Bağlı"}
              className={`w-7 h-7 flex items-center justify-center rounded-full border transition-all ${hasError
                  ? 'border-red-200 bg-red-50 text-red-600'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-600'
                }`}
            >
              <Plug className="w-3.5 h-3.5" />
            </button>

            <div className="relative">
              <div
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-7 h-7 rounded-full overflow-hidden bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white cursor-pointer ring-2 ring-transparent hover:ring-emerald-200 transition-all shadow-sm"
              >
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'A'}
              </div>

              {/* User Dropdown Popup */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-[70] py-1.5 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/30">
                      <p className="text-xs font-black text-gray-900 truncate">{user?.name}</p>
                      <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">{user?.email}</p>
                    </div>
                    <div className="p-1.5">
                      <button
                        onClick={() => { handleTabChange('settings'); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <SettingsIcon className="w-3.5 h-3.5 text-gray-400" />
                        Profil Ayarları
                      </button>
                      <button
                        onClick={() => logout()}
                        className="w-full text-left px-3 py-2 text-[12px] font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Oturumu Kapat
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              {isMenuOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Search Bar */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="sm:hidden border-b border-gray-100 overflow-hidden bg-gray-50/50"
            >
              <div className="p-3">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Dashboard'da ara..."
                    value={globalSearchTerm}
                    onChange={(e) => setGlobalSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none text-[13px] w-full font-medium"
                  />
                  {globalSearchTerm && (
                    <button onClick={() => setGlobalSearchTerm('')}>
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sub Navigation */}
        <div className="hidden md:flex items-center justify-between px-4 py-2 border-b border-gray-200 overflow-x-auto hide-scrollbar bg-white">
          <div className="flex items-center gap-1">
            {navGroups.map((item) => (
              <button
                key={item.url}
                onClick={() => handleTabChange(item.url)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all whitespace-nowrap ${activeTab === item.url
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

      {/* Global Search Results Overlay */}
      <AnimatePresence>
        {globalSearchTerm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 top-[45px] bg-white/80 backdrop-blur-md z-[60] flex justify-center p-4"
          >
            <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Arama Sonuçları: "{globalSearchTerm}"</span>
                <button onClick={() => setGlobalSearchTerm('')} className="p-1 hover:bg-gray-200 rounded-lg transition-all">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {/* Search Categories */}
                {[
                  { title: "Ürünler", data: products.filter(p => p.name.toLowerCase().includes(globalSearchTerm.toLowerCase())), icon: Package, tab: 'products' },
                  { title: "Siparişler", data: orders.filter(o => o.user.toLowerCase().includes(globalSearchTerm.toLowerCase()) || o.shortId.toLowerCase().includes(globalSearchTerm.toLowerCase())), icon: ShoppingCart, tab: 'orders' },
                  { title: "Müşteriler", data: customers.filter(c => c.name?.toLowerCase().includes(globalSearchTerm.toLowerCase()) || c.email?.toLowerCase().includes(globalSearchTerm.toLowerCase())), icon: Users, tab: 'customers' }
                ].map((group) => group.data.length > 0 && (
                  <div key={group.title} className="mb-4">
                    <div className="px-3 py-1 flex items-center gap-2 mb-1">
                      <group.icon className="w-3 h-3 text-emerald-600" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{group.title}</span>
                    </div>
                    {group.data.slice(0, 5).map((item: any) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          handleTabChange(group.tab);
                          setGlobalSearchTerm('');
                        }}
                        className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                            {item.name?.charAt(0) || item.user?.charAt(0) || '#'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{item.name || item.user}</p>
                            <p className="text-[10px] text-gray-400">
                              {item.category || item.shortId || item.email}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                  </div>
                ))}

                {products.filter(p => p.name.toLowerCase().includes(globalSearchTerm.toLowerCase())).length === 0 &&
                  orders.filter(o => o.user.toLowerCase().includes(globalSearchTerm.toLowerCase()) || o.shortId.toLowerCase().includes(globalSearchTerm.toLowerCase())).length === 0 &&
                  customers.filter(c => c.name?.toLowerCase().includes(globalSearchTerm.toLowerCase()) || c.email?.toLowerCase().includes(globalSearchTerm.toLowerCase())).length === 0 && (
                    <div className="p-12 text-center">
                      <Search className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                      <p className="text-sm font-medium text-gray-500">Sonuç bulunamadı.</p>
                    </div>
                  )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Dropdown Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 top-[45px] bg-black/10 backdrop-blur-[2px] z-[80] md:hidden"
            />

            {/* Dropdown Content */}
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="fixed top-[45px] left-0 right-0 bottom-0 bg-white z-[90] md:hidden flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                <div className="grid grid-cols-2 gap-2">
                  {navGroups.map((item, index) => (
                    <motion.button
                      key={item.url}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => {
                        handleTabChange(item.url);
                        setIsMenuOpen(false);
                      }}
                      className={`flex flex-col items-start gap-2 p-3 rounded-xl border transition-all active:scale-[0.97] ${activeTab === item.url
                          ? 'bg-white border-emerald-600 text-emerald-600 shadow-sm'
                          : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === item.url ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-400'
                        }`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold tracking-tight uppercase">{item.title}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {user?.name?.[0]}
                  </div>
                  <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">{user?.name}</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-[10px] font-black text-emerald-600 uppercase tracking-widest"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-6 sm:pt-10 px-3 sm:px-6 md:px-8 max-w-[1400px] mx-auto w-full">
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
