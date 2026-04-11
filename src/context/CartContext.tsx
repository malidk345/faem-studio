/**
 * CartContext.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages shopping cart state.
 *
 * When VITE_MEDUSA_BACKEND_URL is set:
 *   • Cart is persistent via Medusa's cart API (cartId stored in localStorage)
 *   • addToCart() maps local data → Medusa variant ID and calls the API
 *   • removeFromCart() / updateQuantity() sync with Medusa line items
 *
 * When the backend is NOT configured:
 *   • Falls back to local in-memory cart (exactly the previous behaviour).
 *
 * NOTE: Mapping "size" → Medusa variant ID requires knowing the variant IDs
 * from the product data. When products are fetched from Medusa, the variant
 * IDs are available on each product. The local seed data uses placeholder
 * sizes, so addToCart() in offline mode bypasses the variant lookup.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getOrCreateCart,
  addCartItem,
  removeCartItem,
  updateCartItem,
  type MedusaCart,
  type MedusaCartItem,
} from '../lib/medusa-api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;         // line item ID (Medusa) or `${productId}-${size}` (local)
  productId: string | number;
  variantId?: string; // Medusa variant ID — undefined in offline mode
  name: string;
  price: string;      // formatted: "$12.00"
  image: string;
  size: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: string;
  medusaCartId: string | null;
  isLoading: boolean;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const IS_BACKEND_CONFIGURED = Boolean(
  import.meta.env.VITE_MEDUSA_BACKEND_URL
);

function formatPrice(amount: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function medusaCartToItems(cart: MedusaCart): CartItem[] {
  return cart.items.map((item: MedusaCartItem) => ({
    id: item.id,
    productId: item.variant_id,
    variantId: item.variant_id,
    name: item.title,
    price: formatPrice(item.unit_price, cart.currency_code),
    image: item.thumbnail ?? '',
    size: item.variant?.title ?? '—',
    quantity: item.quantity,
  }));
}

// ─── Context ─────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [medusaCartId, setMedusaCartId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const cartTotal = (() => {
    const total = cartItems.reduce((acc, item) => {
      const num = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      return acc + (isNaN(num) ? 0 : num * item.quantity);
    }, 0);
    return `$${total.toFixed(2)}`;
  })();

  // On mount — initialise the Medusa cart if backend is configured
  useEffect(() => {
    if (!IS_BACKEND_CONFIGURED) return;

    (async () => {
      try {
        const cart = await getOrCreateCart();
        if (cart) {
          setMedusaCartId(cart.id);
          setCartItems(medusaCartToItems(cart));
        }
      } catch (err) {
        console.error('[CartContext] Failed to init Medusa cart:', err);
      }
    })();
  }, []);

  // ── addToCart ──────────────────────────────────────────────────────────────

  const addToCart = useCallback(
    async (item: Omit<CartItem, 'id'>) => {
      // ── OFFLINE MODE ──
      if (!IS_BACKEND_CONFIGURED) {
        setCartItems((prev) => {
          const localId = `${item.productId}-${item.size}`;
          const existing = prev.find((i) => i.id === localId);
          if (existing) {
            return prev.map((i) =>
              i.id === localId ? { ...i, quantity: i.quantity + item.quantity } : i
            );
          }
          return [...prev, { ...item, id: localId }];
        });
        return;
      }

      // ── MEDUSA MODE ──
      if (!item.variantId) {
        console.warn('[CartContext] addToCart: variantId is required in Medusa mode.');
        return;
      }

      setIsLoading(true);
      try {
        const cartId = medusaCartId ?? (await getOrCreateCart())?.id;
        if (!cartId) throw new Error('No cart available');
        if (!medusaCartId) setMedusaCartId(cartId);

        const updatedCart = await addCartItem(cartId, item.variantId, item.quantity);
        setCartItems(medusaCartToItems(updatedCart));
      } catch (err) {
        console.error('[CartContext] addToCart failed:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [medusaCartId]
  );

  // ── removeFromCart ─────────────────────────────────────────────────────────

  const removeFromCart = useCallback(
    async (id: string) => {
      if (!IS_BACKEND_CONFIGURED) {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
        return;
      }

      if (!medusaCartId) return;
      setIsLoading(true);
      try {
        const updatedCart = await removeCartItem(medusaCartId, id);
        setCartItems(medusaCartToItems(updatedCart));
      } catch (err) {
        console.error('[CartContext] removeFromCart failed:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [medusaCartId]
  );

  // ── updateQuantity ─────────────────────────────────────────────────────────

  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      if (quantity < 1) {
        await removeFromCart(id);
        return;
      }

      if (!IS_BACKEND_CONFIGURED) {
        setCartItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, quantity } : item))
        );
        return;
      }

      if (!medusaCartId) return;
      setIsLoading(true);
      try {
        const updatedCart = await updateCartItem(medusaCartId, id, quantity);
        setCartItems(medusaCartToItems(updatedCart));
      } catch (err) {
        console.error('[CartContext] updateQuantity failed:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [medusaCartId, removeFromCart]
  );

  // ── clearCart ──────────────────────────────────────────────────────────────

  const clearCart = useCallback(() => {
    setCartItems([]);
    setMedusaCartId(null);
    localStorage.removeItem('faem_cart_id');
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        medusaCartId,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
