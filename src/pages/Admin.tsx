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
import { CustomersTab } from '../components/Admin/Tabs/CustomersTab';
import { SettingsTab } from '../components/Admin/Tabs/SettingsTab';
import { CmsTab } from '../components/Admin/Tabs/CmsTab';
import { MessagesTab } from '../components/Admin/Tabs/MessagesTab';
import { HeaderNotifications } from '../components/Admin/HeaderNotifications';
import { BulkImportModal } from '../components/Admin/Modals/BulkImportModal';
import { toast } from 'sonner';

import { useSearchParams } from 'react-router-dom';

export default function Admin() {
  const {
    isAdmin, products, orders, categories, collections, messages, customers, settings, loading,
    deleteProduct, publishProduct, addCategory, deleteCategory, addCollection, deleteCollection,
    updateProduct, updateOrderStatus,
    toggleMessageRead, deleteMessage, updateSettings, refreshData, clearAllProducts
  } = useAdminData();

  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  // View State for Product Management (Listing vs Editing)
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<any>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = React.useState(false);

  // Sync edit state with tab changes
  React.useEffect(() => {
    setIsEditing(false);
  }, [activeTab]);

  React.useEffect(() => {
    document.body.classList.add('admin-theme');
    return () => document.body.classList.remove('admin-theme');
  }, []);

  if (isAdmin === null || (loading && isAdmin === true && products.length === 0)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-10 h-10 border-4 border-black rounded-full border-t-transparent animate-spin"
        />
        <p className="mt-4 text-[10px] uppercase font-black tracking-[0.4em] text-black">Doğrulanıyor...</p>
      </div>
    );
  }

  if (isAdmin === 'LOGIN') {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-8 bg-white text-black text-center p-6">
        <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center shadow-2xl">
          <span className="text-3xl text-white font-black">F</span>
        </div>
        <h2 className="text-3xl font-black tracking-tighter">Yönetici Girişi Gerekli</h2>
        <Link to="/signin" className="bg-black text-white px-10 py-4 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-black/20">
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-theme">
      <SidebarProvider>
        <AppSidebar collapsible="icon" />
        <SidebarInset className="bg-white">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 liquid-header px-4 md:px-8 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="w-9 h-9 rounded-xl hover:bg-black/5 text-zinc-900 transition-colors" />
                <div className="h-5 w-px bg-black/10 mx-1" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 leading-none mb-0.5">Yönetim Merkezi</span>
                <span className="text-sm font-semibold text-zinc-900 capitalize tracking-tight">{isEditing ? 'Ürün Düzenleniyor' : activeTab.replace('-', ' ')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <HeaderNotifications orders={orders} />
              <SiteHeader />
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 xl:px-12 mx-auto w-full max-w-7xl overflow-x-hidden">
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
                      onClearAll={clearAllProducts}
                    />
                  )
                )}

                {activeTab === 'categories' && <CategoriesTab categories={categories} onAdd={addCategory} onDelete={deleteCategory} />}
                {activeTab === 'collections' && <CategoriesTab categories={collections} onAdd={addCollection} onDelete={deleteCollection} isCollection />}
                {activeTab === 'orders' && <OrdersTab orders={orders} onUpdateStatus={updateOrderStatus} />}
                {activeTab === 'customers' && <CustomersTab customers={customers} orders={orders} />}
                {activeTab === 'journal' && <JournalTab />}
                {activeTab === 'settings' && <SettingsTab settings={settings} onUpdateSettings={updateSettings} />}
                {activeTab === 'messages' && <MessagesTab messages={messages} onToggleRead={toggleMessageRead} onDelete={deleteMessage} />}
                {activeTab === 'cms' && <CmsTab collections={collections} />}
              </motion.div>
            </AnimatePresence>
          </main>
        </SidebarInset>
      </SidebarProvider>

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
