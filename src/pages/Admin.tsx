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
import { ArrowRight } from 'lucide-react';

import { useAdminData } from '../hooks/useAdminData';
import { DashboardTab } from '../components/Admin/Tabs/DashboardTab';
import { ProductsTab } from '../components/Admin/Tabs/ProductsTab';
import { CategoriesTab } from '../components/Admin/Tabs/CategoriesTab';
import { OrdersTab } from '../components/Admin/Tabs/OrdersTab';
import { ProductEditTab } from '../components/Admin/Tabs/ProductEditTab';

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
        <header className="flex h-20 shrink-0 items-center justify-between gap-2 border-b border-zinc-50 bg-white/80 backdrop-blur-md px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <SidebarTrigger className="w-10 h-10 rounded-xl hover:bg-zinc-50" />
               <div className="h-6 w-px bg-zinc-100 mx-1" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-300 leading-none mb-1">Curation Hub</span>
              <span className="text-sm font-bold text-zinc-900 capitalize">{isEditing ? 'Editing Asset' : activeTab.replace('-', ' ')}</span>
            </div>
          </div>
          <SiteHeader />
        </header>

        <main className="flex-1 p-4 md:p-10 lg:p-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (isEditing ? '_editing' : '_listing')}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
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
            </motion.div>
          </AnimatePresence>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
