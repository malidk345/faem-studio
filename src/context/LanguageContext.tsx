import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'tr' | 'en';

type Translations = Record<string, string>;

// Mixed aesthetic: TR uses some EN terms to sound premium/classy.
const translations: Record<Language, Translations> = {
  tr: {
    'nav.collection': 'Collection',
    'nav.about': 'Hakkımızda',
    'nav.account': 'Account',
    'hero.badge': 'YENİ SEZON',
    'hero.title': 'FAEM STUDIO\nARCHIVE 26',
    'hero.cta': 'Koleksiyonu Keşfet',
    'shop.title': 'The Collection',
    'shop.desc': 'Faem Studio kapsül koleksiyonundan seçkin parçalar.',
    'cart.empty': 'Sepetiniz henüz boş.',
    'cart.checkout': 'Ödemeye Geç',
    'cart.total': 'Toplam',
    'product.add': 'Sepete Ekle',
    'product.details': 'Ürün Detayları',
    'product.shipping': 'Kargo & İade',
    'footer.rights': 'Tüm hakları saklıdır.',
    'auth.title': 'Giriş Yap',
    'auth.desc': 'Stüdyo hesabınıza erişin veya yeni bir profil oluşturun.',
    'home.explore': 'Koleksiyonu Keşfet',
    'home.current': 'Yeni Sezon',
    'home.all_pieces': 'Tüm Parçalar',
    'home.studio_notes': 'Stüdyo Notları',
    'checkout.title': 'Ödeme',
    'checkout.back': 'Vitrine Dön',
    'checkout.empty_desc': 'Sepetinizde ürün bulunmamaktadır.',
    'checkout.shop_now': 'Alışverişe Başla',
    'checkout.success_title': 'Siparişiniz Alındı!',
    'checkout.success_desc': 'Tercihiniz için teşekkürler. Sipariş detayları e-posta adresinize iletilecektir.',
    'checkout.back_to_store': 'Mağazaya Dön',
    'checkout.step_1': 'İletişim & Teslimat',
    'checkout.step_2': 'Gönderim Yöntemi',
    'checkout.step_3': 'İnceleme & Ödeme',
    'checkout.email': 'E-posta Adresi',
    'checkout.first_name': 'Ad',
    'checkout.last_name': 'Soyad',
    'checkout.address': 'Adres',
    'checkout.city': 'Şehir',
    'checkout.postal': 'Posta Kodu',
    'checkout.continue_shipping': 'Gönderim Seçeneklerine Geç',
    'checkout.shipping_method': 'Teslimat Biçimi',
    'checkout.review_order': 'Siparişi Gözden Geçir',
    'checkout.place_order': 'Siparişi Tamamla',
    'checkout.summary': 'Sipariş Özeti',
    'checkout.shipping_to': 'Teslimat Adresi',
    'checkout.free': 'Ücretsiz',
    'checkout.standard': 'Standart Gönderim',
    'checkout.express': 'Hızlı Teslimat',
    'checkout.qty': 'adet',
    'account.title': 'Stüdyo Hesabım',
    'account.desc': 'Siparişlerinizi, favorilerinizi ve profil ayarlarınızı yönetin.',
    'account.member': 'Stüdyo Üyesi',
    'account.signout': 'Hesaptan Çıkış Yap',
    'account.orders': 'Siparişlerim',
    'account.wishlist': 'Favorilerim',
    'account.profile': 'Profil Ayarları',
    'account.history': 'Sipariş Geçmişi',
    'account.order_id': 'Sipariş No',
    'account.no_orders': 'Henüz bir siparişiniz bulunmuyor.',
    'account.empty_wishlist': 'Favori listeniz henüz boş.',
    'account.full_name': 'Ad Soyad',
    'account.email': 'E-posta Adresi',
    'account.shipping_addr': 'Teslimat Adresi',
    'account.no_addr': 'Kayıtlı adres bulunamadı. Ödeme sırasında ekleyebilirsiniz.',
    'account.loading': 'Geçmiş yükleniyor...',
    'account.status.delivered': 'Teslim Edildi',
    'account.status.pending': 'Beklemede',
    'account.status.shipped': 'Kargoda',
    'auth.instant_entry': 'Şifresiz Hızlı Giriş',
    'auth.send_link': 'Sihirli Bağlantı Gönder',
    'auth.sending': 'Gönderiliyor...',
    'auth.check_mail': 'E-postanızı kontrol edin.',
    'auth.link_sent_desc': 'size güvenli bir giriş bağlantısı gönderdik.',
    'auth.change_email': 'E-postayı Değiştir',
    'auth.privacy_terms': 'Gizlilik Politikası & Stüdyo Şartları',
    'auth.back_to_store': 'Mağazaya Dön',
    'nav.search': 'Arama',
    'nav.profile': 'Profil',
    'nav.menu': 'Menü',
    'nav.cart': 'Sepet',
    'cart.size': 'Beden',
    'cart.qty': 'Adet',
    'cart.empty_msg': 'Sepetiniz henüz boş',
    'nav.categories': 'Kategoriler',
    'nav.new_arrivals': 'Yeni Gelenler',
    'nav.accessories': 'Aksesuar',
    'nav.socials': 'Sosyal Medya',
    'nav.contact_us': 'İletişim',
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
    'checkout.title': 'Checkout',
    'checkout.back': 'Back to Store',
    'checkout.empty_desc': 'Your cart is empty.',
    'checkout.shop_now': 'Shop Now',
    'checkout.success_title': 'Order Placed!',
    'checkout.success_desc': "Thank you for your order. You'll receive a confirmation email shortly.",
    'checkout.back_to_store': 'Back to Store',
    'checkout.step_1': 'Contact & Shipping',
    'checkout.step_2': 'Delivery Method',
    'checkout.step_3': 'Review & Pay',
    'checkout.email': 'Email Address',
    'checkout.first_name': 'First Name',
    'checkout.last_name': 'Last Name',
    'checkout.address': 'Street Address',
    'checkout.city': 'City',
    'checkout.postal': 'Postal Code',
    'checkout.continue_shipping': 'Continue to Delivery',
    'checkout.shipping_method': 'Shipping Method',
    'checkout.review_order': 'Review Order',
    'checkout.place_order': 'Place Order',
    'checkout.summary': 'Order Summary',
    'checkout.shipping_to': 'Shipping to',
    'checkout.free': 'Free',
    'checkout.standard': 'Standard Shipping',
    'checkout.express': 'Express Shipping',
    'checkout.qty': 'qty',
    'account.title': 'My Studio Account',
    'account.desc': 'Manage your orders, wishlist, and profile settings.',
    'account.member': 'Studio Member',
    'account.signout': 'Sign Out Account',
    'account.orders': 'Orders',
    'account.wishlist': 'Wishlist',
    'account.profile': 'Profile',
    'account.history': 'Order History',
    'account.order_id': 'Order ID',
    'account.no_orders': "You haven't placed any orders yet.",
    'account.empty_wishlist': 'Your wishlist is currently empty.',
    'account.full_name': 'Full Name',
    'account.email': 'Email Address',
    'account.shipping_addr': 'Shipping Address',
    'account.no_addr': "No shipping address saved yet. We'll collect this at checkout.",
    'account.loading': 'Loading history...',
    'account.status.delivered': 'Delivered',
    'account.status.pending': 'Pending',
    'account.status.shipped': 'Shipped',
    'auth.instant_entry': 'Instant Passwordless Entry',
    'auth.send_link': 'Send Magic Link',
    'auth.sending': 'Sending...',
    'auth.check_mail': 'Check your mail.',
    'auth.link_sent_desc': "we've sent a secure access link to",
    'auth.change_email': 'Change Email',
    'auth.privacy_terms': 'Privacy Policy & Studio Terms',
    'auth.back_to_store': 'Back to Store',
    'nav.search': 'Search',
    'nav.profile': 'Profile',
    'nav.menu': 'Menu',
    'nav.cart': 'Cart',
    'cart.size': 'Size',
    'cart.qty': 'Qty',
    'cart.empty_msg': 'Your cart is empty',
    'nav.categories': 'Categories',
    'nav.new_arrivals': 'New Arrivals',
    'nav.accessories': 'Accessories',
    'nav.socials': 'Socials',
    'nav.contact_us': 'Contact US',
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
