import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'tr' | 'en';

type Translations = Record<string, string>;

// Mixed aesthetic: TR uses some EN terms to sound premium/classy.
const translations: Record<Language, Translations> = {
  tr: {
    'nav.collection': 'Collection', // Kept English for aesthetics
    'nav.about': 'Hakkımızda',
    'nav.account': 'Account',
    'hero.badge': 'YENİ SEZON',
    'hero.title': 'FAEM STUDIO\nARCHIVE 26',
    'hero.cta': 'Koleksiyonu Keşfet',
    'shop.title': 'The Collection',
    'shop.desc': 'Faem Studio kapsül koleksiyonundan seçkin parçalar.',
    'cart.empty': 'Sepetinizde ürün bulunmamaktadır.',
    'cart.checkout': 'Checkout',
    'cart.total': 'Toplam',
    'product.add': 'Sepete Ekle',
    'product.details': 'Ürün Detayları',
    'product.shipping': 'Kargo & İade',
    'footer.rights': 'Tüm hakları saklıdır.',
    'auth.title': 'Sign In', // Kept English
    'auth.desc': 'Hesabınıza giriş yapın veya yeni bir üyelik oluşturun.',
    'home.explore': 'Koleksiyonu Keşfet',
    'home.current': 'Yeni Sezon',
    'home.all_pieces': 'Tüm Parçalar',
    'home.studio_notes': 'Stüdyo Notları',
  },
  en: {
    'nav.collection': 'Collection',
    'nav.about': 'About',
    'nav.account': 'Account',
    'hero.badge': 'NEW ARRIVALS',
    'hero.title': 'FAEM STUDIO\nARCHIVE 26',
    'hero.cta': 'Explore Collection',
    'shop.title': 'The Collection',
    'shop.desc': 'Selected pieces from the Faem Studio capsule collection.',
    'cart.empty': 'Your cart is empty.',
    'cart.checkout': 'Checkout',
    'cart.total': 'Total',
    'product.add': 'Add to Cart',
    'product.details': 'Product Details',
    'product.shipping': 'Shipping & Returns',
    'footer.rights': 'All rights reserved.',
    'auth.title': 'Sign In',
    'auth.desc': 'Sign in to your account or create a new one.',
    'home.explore': 'Explore Collection',
    'home.current': 'Current Season',
    'home.all_pieces': 'All Pieces',
    'home.studio_notes': 'Studio Notes',
  }
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('faem_lang');
    return (saved as Language) || 'tr';
  });

  useEffect(() => {
    localStorage.setItem('faem_lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'tr' ? 'en' : 'tr');
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
