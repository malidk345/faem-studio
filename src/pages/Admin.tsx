import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, Tags, Settings as SettingsIcon,
  Plus, Search, Filter, MoreVertical, X, UploadCloud, Edit, Trash2, ArrowUpRight, Menu
} from 'lucide-react';
import { PRODUCTS } from '../data/products';

type Tab = 'dashboard' | 'products' | 'categories' | 'orders' | 'customers' | 'settings';

export default function Admin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); 
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  
  const [products, setProducts] = useState<any[]>(PRODUCTS);
  const [orders, setOrders] = useState<any[]>([
    { id: 'ORD-1204', user: 'Ahmet Y.', total: '8.450 ₺', status: 'beklemede', date: '2 dk önce', items: 1 }
  ]);
  const [categories, setCategories] = useState(['Elbiseler', 'Dış Giyim', 'Ceketler', 'Etekler', 'Aksesuarlar']);
  const [isAddProductModalOpen, setAddProductModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const verify = async () => {
      // PROD MODE: check supabase
      if (import.meta.env.VITE_SUPABASE_URL) {
        if (!user) {
          setIsAdmin(false);
          return;
        }
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile && profile.role === 'admin') {
          setIsAdmin(true);
          fetchData();
        } else {
          setIsAdmin(false);
        }
      } else {
        // LOCAL DEV MOCK:
        setIsAdmin(true);
      }
    };
    verify();
  }, [user]);

  const fetchData = async () => {
    const { data: pData } = await supabase.from('products').select('*');
    if (pData && pData.length > 0) setProducts(pData);

    const { data: oData } = await supabase.from('orders').select('*, profiles(name)');
    if (oData && oData.length > 0) {
      setOrders(oData.map(o => ({
         id: o.id.slice(0,8),
         user: o.shipping_address?.first_name || 'Müşteri',
         total: o.total,
         status: o.status,
         date: new Date(o.created_at).toLocaleDateString(),
         items: o.items?.length || 1
      })));
    }
  };

  const handleProductPublish = async (newProduct: any) => {
    if (import.meta.env.VITE_SUPABASE_URL) {
      await supabase.from('products').insert([newProduct]);
      fetchData();
    }
    setAddProductModalOpen(false);
  }

  if (isAdmin === null) return <div className="h-screen flex items-center justify-center font-bold">Admin Doğrulanıyor...</div>;
  if (isAdmin === false) return <div className="h-screen flex flex-col items-center justify-center gap-4"><p className="font-bold">Yetkisiz Erişim</p><Link to="/" className="underline">Ana Sayfaya Dön</Link></div>;

  const handleTabSwitch = (tab: Tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex text-black">
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sol Menü / Sidebar */}
      <aside className={`w-64 border-r border-black/5 bg-white flex flex-col fixed h-screen z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex justify-between items-center p-6 md:p-8 pb-4">
          <div>
            <Link to="/" className="text-2xl font-black tracking-tighter">FAEM</Link>
            <p className="text-[10px] uppercase tracking-widest text-black/40 mt-1 font-bold">Yönetİm Merkezİ</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-black/50 hover:bg-black/5 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto hide-scrollbar">
          <NavButton active={activeTab === 'dashboard'} onClick={() => handleTabSwitch('dashboard')} icon={<LayoutDashboard size={18} />} label="Genel Bakış" />
          <NavButton active={activeTab === 'products'} onClick={() => handleTabSwitch('products')} icon={<Package size={18} />} label="Ürünler" badge={products.length} />
          <NavButton active={activeTab === 'categories'} onClick={() => handleTabSwitch('categories')} icon={<Tags size={18} />} label="Koleksiyonlar" />
          <NavButton active={activeTab === 'orders'} onClick={() => handleTabSwitch('orders')} icon={<ShoppingCart size={18} />} label="Siparişler" badge={orders.filter(o => o.status === 'beklemede').length} />
          <NavButton active={activeTab === 'customers'} onClick={() => handleTabSwitch('customers')} icon={<Users size={18} />} label="Müşteriler" />
        </nav>
        
        <div className="p-4 border-t border-black/5">
          <NavButton active={activeTab === 'settings'} onClick={() => handleTabSwitch('settings')} icon={<SettingsIcon size={18} />} label="Ayarlar" />
        </div>
      </aside>

      {/* Ana İçerik */}
      <main className="flex-1 w-full md:ml-64 p-4 sm:p-8 md:p-12 mb-20 overflow-x-hidden">
        
        {/* Üst Bilgi */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-8 md:mb-12">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 bg-black/5 rounded-full text-black">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tighter capitalize">
                {activeTab === 'dashboard' && 'Genel Bakış'}
                {activeTab === 'products' && 'Ürün Yönetimi'}
                {activeTab === 'categories' && 'Koleksiyonlar'}
                {activeTab === 'orders' && 'Sipariş Takibi'}
                {activeTab === 'customers' && 'Müşteri Portföyü'}
                {activeTab === 'settings' && 'Sistem Ayarları'}
              </h1>
              <p className="text-black/50 text-xs sm:text-sm font-medium mt-1">Mağazanı yönet ve performansını raporla.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 self-start sm:self-auto ml-12 sm:ml-0">
            <button className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black hover:bg-black/10 transition-colors">
              <Search size={18} />
            </button>
            <div className="h-10 px-4 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs sm:text-sm">
              Admin
            </div>
          </div>
        </div>

        {/* Sekme Geçişi */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <DashboardTab orders={orders} products={products} />}
            {activeTab === 'products' && <ProductsTab products={products} onAdd={() => setAddProductModalOpen(true)} />}
            {activeTab === 'categories' && <CategoriesTab categories={categories} />}
            {activeTab === 'orders' && <OrdersTab orders={orders} />}
            {activeTab === 'customers' && <CustomersTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* Ürün Ekleme Penceresi */}
      <AnimatePresence>
        {isAddProductModalOpen && (
          <ProductModal onClose={() => setAddProductModalOpen(false)} categories={categories} onPublish={handleProductPublish} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── TAB COMPONENTS ────────────────────────────────────────────────────────────

function DashboardTab({ orders, products }: any) {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* KPI KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <KpiCard title="Toplam Ciro" value="68.450 ₺" trend="+14.5%" trendUp />
        <KpiCard title="Aktif Sipariş" value="12" trend="+2.4%" trendUp />
        <KpiCard title="Ziyaretçi" value="8.405" trend="-1.2%" trendUp={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* SON SİPARİŞLER */}
        <div className="lg:col-span-2 bg-white border border-black/5 rounded-[1.5rem] md:rounded-3xl p-6 md:p-8 overflow-hidden w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base md:text-lg font-bold">Son Siparişler</h2>
            <button className="text-xs font-bold text-black/50 hover:text-black">Tümünü Gör</button>
          </div>
          <div className="overflow-x-auto hide-scrollbar -mx-6 md:mx-0 px-6 md:px-0">
            <table className="w-full text-sm text-left min-w-[500px]">
              <thead>
                <tr className="text-black/40 border-b border-black/5">
                  <th className="pb-3 font-medium">Sipariş No</th>
                  <th className="pb-3 font-medium">Müşteri</th>
                  <th className="pb-3 font-medium">Durum</th>
                  <th className="pb-3 font-medium text-right">Tutar</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0,4).map((o:any, i:number) => (
                  <tr key={i} className="border-b border-black/5/50 last:border-0 hover:bg-black/[0.02] transition-colors">
                    <td className="py-4 font-bold">{o.id}</td>
                    <td className="py-4 text-black/60">{o.user}</td>
                    <td className="py-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-4 text-right font-bold">{o.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* EN ÇOK SATANLAR */}
        <div className="bg-white border border-black/5 rounded-[1.5rem] md:rounded-3xl p-6 md:p-8 w-full">
          <h2 className="text-base md:text-lg font-bold mb-6">En Çok Satanlar</h2>
          <div className="space-y-4">
            {products.slice(0, 3).map((p:any) => (
              <div key={p.id} className="flex gap-4 items-center">
                <img src={p.image} className="w-12 h-12 rounded-xl object-cover bg-black/5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm leading-tight truncate">{p.name}</p>
                  <p className="text-xs text-black/40 mt-0.5 truncate">{p.category} · {p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsTab({ products, onAdd }: any) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 sm:pb-0">
          <FilterButton label="Tümü" active />
          <FilterButton label="Yayında Olanlar" />
          <FilterButton label="Taslaklar" />
        </div>
        <button onClick={onAdd} className="bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all flex-shrink-0">
          <Plus size={16} /> Ürün Ekle
        </button>
      </div>

      <div className="bg-white border border-black/5 rounded-[1.5rem] md:rounded-3xl overflow-x-auto hide-scrollbar shadow-sm">
        <table className="w-full text-sm text-left min-w-[700px]">
          <thead className="bg-black/[0.02] border-b border-black/5 uppercase text-[10px] tracking-wider text-black/50">
            <tr>
              <th className="px-4 md:px-6 py-4 font-bold">Ürün</th>
              <th className="px-4 md:px-6 py-4 font-bold">Kategori</th>
              <th className="px-4 md:px-6 py-4 font-bold">Stok Durumu</th>
              <th className="px-4 md:px-6 py-4 font-bold">Fiyat</th>
              <th className="px-4 md:px-6 py-4 font-bold text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p:any) => (
              <tr key={p.id} className="border-b border-black/5 hover:bg-black/[0.01] transition-colors group">
                <td className="px-4 md:px-6 py-4 flex items-center gap-3 md:gap-4">
                  <img src={p.image} className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover flex-shrink-0" />
                  <span className="font-bold truncate max-w-[120px] md:max-w-none">{p.name}</span>
                </td>
                <td className="px-4 md:px-6 py-4 text-black/60">{p.category}</td>
                <td className="px-4 md:px-6 py-4"><span className="text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap">Stokta (45)</span></td>
                <td className="px-4 md:px-6 py-4 font-bold whitespace-nowrap">{p.price}</td>
                <td className="px-4 md:px-6 py-4 text-right whitespace-nowrap">
                  <button className="text-black/30 hover:text-black transition-colors p-2"><Edit size={16} /></button>
                  <button className="text-black/30 hover:text-red-500 transition-colors p-2"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoriesTab({ categories }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      <div className="lg:col-span-2 bg-white border border-black/5 rounded-[1.5rem] md:rounded-3xl p-6 md:p-8 overflow-x-auto hide-scrollbar">
        <table className="w-full text-sm text-left min-w-[400px]">
           <thead className="text-[10px] uppercase tracking-widest text-black/40 border-b border-black/5">
             <tr>
               <th className="pb-4 border-b">Koleksiyon Adı</th>
               <th className="pb-4 border-b">Durum</th>
               <th className="pb-4 border-b text-right">Ürün Sayısı</th>
             </tr>
           </thead>
           <tbody>
             {categories.map((c:any, i:number) => (
               <tr key={i} className="border-b border-black/5 last:border-0 hover:bg-black/5">
                 <td className="py-4 font-bold">{c}</td>
                 <td className="py-4"><span className="px-2 py-1 bg-black/5 rounded text-xs font-semibold">Aktif</span></td>
                 <td className="py-4 text-right text-black/60 whitespace-nowrap">12 Ürün</td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>
      <div>
        <div className="bg-black/5 rounded-[1.5rem] md:rounded-3xl p-6 md:p-8 border border-black/5">
          <h3 className="font-black text-lg mb-4">Yeni Koleksiyon</h3>
          <input type="text" placeholder="Koleksiyon Adı" className="w-full px-4 py-3 rounded-xl bg-white border border-black/5 mb-4 text-sm font-medium focus:outline-none focus:border-black/20" />
          <textarea placeholder="Açıklama" className="w-full px-4 py-3 rounded-xl bg-white border border-black/5 mb-4 text-sm font-medium focus:outline-none focus:border-black/20 h-24 resize-none" />
          <button className="w-full bg-black text-white font-bold py-3 rounded-xl text-sm transition-colors hover:bg-zinc-800">Kaydet</button>
        </div>
      </div>
    </div>
  )
}

function OrdersTab({ orders }: any) {
  return (
    <div className="bg-white border border-black/5 rounded-[1.5rem] md:rounded-3xl overflow-x-auto hide-scrollbar shadow-sm">
        <table className="w-full text-sm text-left min-w-[700px]">
          <thead className="bg-black/[0.02] border-b border-black/5 uppercase text-[10px] tracking-wider text-black/50">
            <tr>
              <th className="px-4 md:px-6 py-4 font-bold">Sipariş No</th>
              <th className="px-4 md:px-6 py-4 font-bold">Tarih</th>
              <th className="px-4 md:px-6 py-4 font-bold">Müşteri</th>
              <th className="px-4 md:px-6 py-4 font-bold">Durum</th>
              <th className="px-4 md:px-6 py-4 font-bold">Ürünler</th>
              <th className="px-4 md:px-6 py-4 font-bold text-right">Tutar</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o:any, i:number) => (
               <tr key={i} className="border-b border-black/5 hover:bg-black/[0.01] transition-colors cursor-pointer">
                <td className="px-4 md:px-6 py-4 font-bold whitespace-nowrap">{o.id}</td>
                <td className="px-4 md:px-6 py-4 text-black/50 whitespace-nowrap">{o.date}</td>
                <td className="px-4 md:px-6 py-4 font-medium whitespace-nowrap">{o.user}</td>
                <td className="px-4 md:px-6 py-4"><StatusBadge status={o.status} /></td>
                <td className="px-4 md:px-6 py-4 text-black/50 whitespace-nowrap">{o.items} adet</td>
                <td className="px-4 md:px-6 py-4 text-right font-bold whitespace-nowrap">{o.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  )
}

function CustomersTab() {
  return (
    <div className="flex items-center justify-center p-8 md:p-24 bg-white rounded-[1.5rem] md:rounded-3xl border border-black/5 shadow-sm">
       <div className="text-center">
         <Users size={40} className="mx-auto text-black/20 mb-4 md:w-12 md:h-12" />
         <h2 className="text-lg md:text-xl font-black mb-2">Müşteri Rehberi</h2>
         <p className="text-xs md:text-sm text-black/50 max-w-sm px-4">
           Müşteri profillerini, geçmiş siparişleri ve hesap veritabanını yönetin. Supabase tam entegre olduğunda burası otomatik dolacaktır.
         </p>
       </div>
    </div>
  )
}

function SettingsTab() {
  return (
    <div className="max-w-3xl space-y-6 md:space-y-8">
      <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-3xl border border-black/5 shadow-sm">
        <h2 className="text-base md:text-lg font-black mb-6">Mağaza Ayarları</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="text-[10px] uppercase font-bold text-black/40 mb-1 block">Mağaza Adı</label>
               <input type="text" defaultValue="Faem Studio" className="w-full px-4 py-3 bg-black/5 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border focus:border-black/20" />
             </div>
             <div>
               <label className="text-[10px] uppercase font-bold text-black/40 mb-1 block">İletişim Maili</label>
               <input type="email" defaultValue="hello@faem-studio.com" className="w-full px-4 py-3 bg-black/5 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border focus:border-black/20" />
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-3xl border border-black/5 opacity-50 shadow-sm">
        <h2 className="text-base md:text-lg font-black mb-2 flex items-center gap-2">Ödeme Altyapısı <span className="text-[9px] md:text-[10px] uppercase bg-black text-white px-2 py-0.5 rounded font-bold">Yakında</span></h2>
        <p className="text-xs md:text-sm font-medium mb-6">Iyzico ve Stripe ödeme ağ geçitleri entegrasyon ayarları.</p>
        <button disabled className="bg-black text-white px-6 py-3 rounded-xl text-sm font-bold opacity-50 cursor-not-allowed">Iyzico Bağla</button>
      </div>
    </div>
  )
}

// ─── MODALLAR VE BİLEŞENLER ──────────────────────────────────────────────────────────

function ProductModal({ onClose, categories, onPublish }: { onClose: () => void, categories: string[], onPublish: (p:any) => void }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState('');

  const submit = () => {
    onPublish({
      name,
      price: price + ' ₺',
      category: cat || categories[0],
      description: desc,
      image_url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800' // mockup
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center sm:p-6 overflow-hidden">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div 
        initial={{ y: 200, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        exit={{ y: 200, opacity: 0 }} 
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-[#FDFDFD] w-full max-w-4xl rounded-t-[2rem] md:rounded-[2rem] shadow-2xl relative z-10 flex flex-col h-[90vh] md:h-auto md:max-h-[90vh] overflow-hidden"
      >
        
        <div className="flex justify-between items-center p-5 md:p-6 border-b border-black/5 bg-white flex-shrink-0">
          <h2 className="text-lg md:text-xl font-black">Yeni Ürün Ekle</h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors bg-black/5 md:bg-transparent"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:p-8 border-b border-black/5 hide-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {/* Sol: Genel Profil */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <label className="text-[10px] uppercase font-bold text-black/40 mb-2 block">Ürün Adı</label>
                <input value={name} onChange={e=>setName(e.target.value)} type="text" placeholder="Örn: Siyah İpek Elbise" className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl text-sm font-medium focus:outline-none focus:border-black/30 transition-colors" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-black/40 mb-2 block">Fiyat (₺)</label>
                  <input value={price} onChange={e=>setPrice(e.target.value)} type="text" placeholder="4.500" className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl text-sm font-medium focus:outline-none focus:border-black/30 transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-black/40 mb-2 block">Stok Adedi</label>
                  <input type="number" placeholder="10" className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl text-sm font-medium focus:outline-none focus:border-black/30 transition-colors" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-black/40 mb-2 block">Açıklama</label>
                <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Ürünün kumaş yapısını ve detaylarını anlatın..." className="w-full h-24 md:h-32 px-4 py-3 bg-white border border-black/10 rounded-xl text-sm font-medium resize-none focus:outline-none focus:border-black/30 transition-colors" />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-black/40 mb-2 block">Özellikler (Virgülle ayırın)</label>
                <input type="text" placeholder="Örn: %100 Organik Pamuk, Astarlı, El İşçiliği" className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl text-sm font-medium focus:outline-none focus:border-black/30 transition-colors" />
              </div>
            </div>

            {/* Sağ: Organizasyon */}
            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase font-bold text-black/40 mb-2 block">Ürün Görseli</label>
                <div className="border border-dashed border-black/20 rounded-2xl h-32 md:h-40 flex flex-col items-center justify-center bg-black/[0.02] cursor-pointer hover:bg-black/5 transition-colors">
                  <UploadCloud size={24} className="text-black/40 mb-2" />
                  <span className="text-xs font-bold text-black/60">Görseli sürükle bırak</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-black/40 mb-2 block">Koleksiyon</label>
                <select value={cat} onChange={e=>setCat(e.target.value)} className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl text-sm font-medium focus:outline-none focus:border-black/30 transition-colors appearance-none">
                  <option value="" disabled>Kategori Seç</option>
                  {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-black/40 mb-2 block">Beden Seçenekleri</label>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'Standart'].map(s => (
                    <label key={s} className="flex items-center gap-1 cursor-pointer bg-black/5 px-2 py-1.5 rounded-lg border border-transparent hover:border-black/10">
                      <input type="checkbox" className="accent-black w-3.5 h-3.5" />
                      <span className="text-xs font-bold px-1">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 bg-[#FDFDFD] flex justify-end gap-3 flex-shrink-0">
           <button onClick={onClose} className="px-5 md:px-6 py-3 rounded-xl text-sm font-bold text-black hover:bg-black/5 transition-colors">İptal</button>
           <button onClick={submit} className="px-6 md:px-8 py-3 rounded-xl text-sm font-bold bg-black text-white hover:bg-zinc-800 transition-colors shadow-lg shadow-black/20">Ürünü Yayınla</button>
        </div>
      </motion.div>
    </div>
  )
}

function NavButton({ active, label, icon, onClick, badge }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-bold transition-all ${
        active 
          ? 'bg-black text-white shadow-lg shadow-black/10' 
          : 'text-black/60 hover:bg-black/5 hover:text-black'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={active ? 'opacity-100' : 'opacity-70'}>{icon}</span>
        {label}
      </div>
      {badge !== undefined && (
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-black/10'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function KpiCard({ title, value, trend, trendUp }: any) {
  return (
    <div className="bg-white border border-black/5 rounded-[1.5rem] p-5 md:p-6 relative overflow-hidden group shadow-sm">
      <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-black/40 font-bold mb-1 md:mb-2">{title}</p>
      <div className="flex items-end justify-between">
        <h3 className="text-2xl md:text-3xl font-black tracking-tight">{value}</h3>
        <span className={`text-[11px] md:text-xs font-bold ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
          {trend}
        </span>
      </div>
      <div className="absolute right-0 top-0 w-24 h-24 md:w-32 md:h-32 bg-black/[0.02] rounded-full -mr-8 -mt-8 md:-mr-10 md:-mt-10 group-hover:scale-110 transition-transform duration-500"></div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    beklemede: 'bg-yellow-100 text-yellow-800',
    kargolandi: 'bg-blue-100 text-blue-800',
    teslim_edildi: 'bg-green-100 text-green-800',
  };
  return (
    <span className={`text-[9px] md:text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md whitespace-nowrap ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

function FilterButton({ label, active }: { label: string, active?: boolean }) {
  return (
    <button className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
      active ? 'bg-black/5 text-black' : 'text-black/50 hover:bg-black/5 hover:text-black'
    }`}>
      {label}
    </button>
  )
}
