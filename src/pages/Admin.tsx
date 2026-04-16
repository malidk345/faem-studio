import React from 'react';
import { 
  SidebarProvider, 
  SidebarInset,
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { motion, AnimatePresence } from "motion/react";
import { Link } from 'react-router-dom';

import { useAdminData } from '../hooks/useAdminData';
import { DashboardTab } from '../components/Admin/Tabs/DashboardTab';
import { ProductsTab } from '../components/Admin/Tabs/ProductsTab';
import { CategoriesTab } from '../components/Admin/Tabs/CategoriesTab';
import { OrdersTab } from '../components/Admin/Tabs/OrdersTab';
import { ProductEditTab } from '../components/Admin/Tabs/ProductEditTab';
import { JournalTab } from '../components/Admin/Tabs/JournalTab';
import { CmsTab } from '../components/Admin/Tabs/CmsTab';
import { HeaderNotifications } from '../components/Admin/HeaderNotifications';

import { useSearchParams } from 'react-router-dom';

export default function Admin() {
  const { 
    isAdmin, products, orders, categories, loading, 
    deleteProduct, publishProduct, addCategory, updateProduct, updateOrderStatus 
  } = useAdminData();
  
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  
  // View State for Product Management (Listing vs Editing)
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<any>(null);

  // Sync edit state with tab changes
  React.useEffect(() => {
    setIsEditing(false);
  }, [activeTab]);

  if (isAdmin === null || (loading && isAdmin === true && products.length === 0)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-10 h-10 border-4 border-black rounded-full border-t-transparent animate-spin"
        />
        <p className="mt-4 text-[10px] uppercase font-black tracking-[0.4em] text-black">Authenticating...</p>
      </div>
    );
  }

  if (isAdmin === 'LOGIN') {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-8 bg-white text-black text-center p-6">
        <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center shadow-2xl">
            <span className="text-3xl text-white font-black">F</span>
        </div>
        <h2 className="text-3xl font-black tracking-tighter">Studio Access Required</h2>
        <Link to="/signin" className="bg-black text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-black/20">
          Sign In Account
        </Link>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar collapsible="icon" />
      <SidebarInset className="bg-white">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b-2 border-zinc-50 bg-white/80 backdrop-blur-md px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
               <SidebarTrigger className="w-9 h-9 rounded-xl hover:bg-zinc-100 transition-colors" />
               <div className="h-5 w-px bg-zinc-100 mx-1" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300 leading-none mb-0.5">Curation Hub</span>
              <span className="text-xs font-bold text-zinc-900 capitalize">{isEditing ? 'Editing Asset' : activeTab.replace('-', ' ')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HeaderNotifications orders={orders} />
            <SiteHeader />
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (isEditing ? '_editing' : '_listing')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {activeTab === 'dashboard' && <DashboardTab orders={orders} products={products} />}
              
              {activeTab === 'products' && (
                isEditing ? (
                  <ProductEditTab 
                    product={editingProduct} 
                    categories={categories}
                    onSave={(data) => {
                      if (editingProduct) updateProduct(editingProduct.id, data);
                      else publishProduct(data);
                      setIsEditing(false);
                      setEditingProduct(null);
                    }}
                    onCancel={() => { setIsEditing(false); setEditingProduct(null); }}
                    onDelete={deleteProduct}
                  />
                ) : (
                  <ProductsTab 
                    products={products} 
                    onAdd={() => { setEditingProduct(null); setIsEditing(true); }} 
                    onEdit={(p) => { setEditingProduct(p); setIsEditing(true); }}
                    onDelete={deleteProduct} 
                  />
                )
              )}

              {activeTab === 'categories' && <CategoriesTab categories={categories} onAdd={addCategory} />}
              {activeTab === 'orders' && <OrdersTab orders={orders} onUpdateStatus={updateOrderStatus} />}
              {activeTab === 'journal' && <JournalTab />}
              {activeTab === 'cms' && <CmsTab categories={categories} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
