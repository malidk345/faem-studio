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
import { ProductModal } from '../components/Admin/Modals/ProductModal';

import { useSearchParams } from 'react-router-dom';

export default function Admin() {
  const { 
    isAdmin, products, orders, categories, loading, 
    deleteProduct, publishProduct, addCategory, updateProduct, updateOrderStatus 
  } = useAdminData();
  
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  
  const [isAddProductModalOpen, setAddProductModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<any>(null);

  if (isAdmin === null || (loading && isAdmin === true && products.length === 0)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-12 h-12 border-2 border-black rounded-full border-t-transparent"
        />
        <p className="mt-4 text-[10px] uppercase font-black tracking-[0.5em] text-black">Terminal Loading</p>
      </div>
    );
  }

  if (isAdmin === 'LOGIN') {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-8 bg-zinc-50 text-black text-center p-6 font-sans">
        <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center transform -rotate-6 shadow-2xl">
            <span className="text-3xl text-white font-black">F</span>
        </div>
        <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2 text-zinc-900">Restricted Access</h2>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto">Please identify yourself to access the administration hub.</p>
        </div>
        <Link to="/signin" className="bg-black text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-lg active:scale-95">
          Sign In <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar 
        // We can pass current tab to sidebar if we modify AppSidebar to accept props
        collapsible="icon"
      />
      <SidebarInset className="bg-zinc-50/50">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-zinc-200 mx-2" />
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400 leading-none">FAEM Studio</span>
              <span className="text-xs font-bold text-zinc-900 capitalize">{activeTab.replace('-', ' ')}</span>
            </div>
          </div>
          <SiteHeader />
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-8 pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
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
              
              {!['dashboard', 'products', 'categories', 'orders'].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-100/50 rounded-3xl border-2 border-dashed border-zinc-200">
                  <h3 className="text-lg font-bold text-zinc-400">Section Under Construction</h3>
                  <p className="text-zinc-400 text-xs mt-1">This module will be available in the next release.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </SidebarInset>

      {/* Enterprise Modals Integration */}
      <ProductModal 
        isOpen={isAddProductModalOpen}
        onClose={() => { setAddProductModalOpen(false); setEditingProduct(null); }} 
        categories={categories} 
        editingProduct={editingProduct}
        onSave={(data) => {
           if (editingProduct) {
              updateProduct(editingProduct.id, data);
           } else {
              publishProduct(data);
           }
           setAddProductModalOpen(false);
           setEditingProduct(null);
        }} 
      />
    </SidebarProvider>
  );
}
