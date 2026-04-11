/**
 * medusa-api.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * High-level wrappers around the Medusa JS client.
 *
 * Each function corresponds to a Medusa Storefront API endpoint and returns
 * data normalised to the shape the rest of the app expects.
 *
 * When VITE_MEDUSA_BACKEND_URL is not set (local dev without a backend),
 * every function gracefully falls back to the static seed data in
 * src/data/products.ts so the UI always renders.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { medusa } from './medusa';
import type { Product, Review } from '../data/products';
import { PRODUCTS, REVIEWS } from '../data/products';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const IS_BACKEND_CONFIGURED = Boolean(
  import.meta.env.VITE_MEDUSA_BACKEND_URL
);

/** Convert a Medusa price amount (cents integer) → "$12.00" formatted string */
function formatPrice(amount: number, currencyCode = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount / 100);
}

/** Map a raw Medusa product object → our internal Product shape */
function mapMedusaProduct(p: any): Product {
  const variant = p.variants?.[0];
  const price = variant?.prices?.[0];

  return {
    id: p.id,
    name: p.title,
    price: price ? formatPrice(price.amount, price.currency_code) : '—',
    image: p.thumbnail ?? p.images?.[0]?.url ?? '',
    images: (p.images ?? []).map((img: any) => ({
      id: img.id,
      url: img.url,
    })),
    category: p.collection?.title ?? p.type?.value ?? 'Uncategorized',
    sizes:
      p.options
        ?.find((o: any) => o.title?.toLowerCase() === 'size')
        ?.values?.map((v: any) => v.value) ?? ['One Size'],
    description: p.description ?? '',
    features: (p.tags ?? []).map((t: any) => t.value),
  };
}

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

/**
 * Fetch all products.
 * Falls back to local seed data if the backend is not configured.
 */
export async function fetchProducts(): Promise<Product[]> {
  if (!IS_BACKEND_CONFIGURED) {
    console.info('[medusa-api] No backend URL — using seed data.');
    return PRODUCTS;
  }

  try {
    const { products } = await medusa.products.list({ limit: 100 });
    return products.map(mapMedusaProduct);
  } catch (err) {
    console.error('[medusa-api] fetchProducts failed, using seed data:', err);
    return PRODUCTS;
  }
}

/**
 * Fetch a single product by its ID.
 * Falls back to seed data match if the backend is not configured.
 */
export async function fetchProduct(id: string | number): Promise<Product | null> {
  if (!IS_BACKEND_CONFIGURED) {
    return PRODUCTS.find((p) => String(p.id) === String(id)) ?? null;
  }

  try {
    const { product } = await medusa.products.retrieve(String(id));
    return mapMedusaProduct(product);
  } catch (err) {
    console.error('[medusa-api] fetchProduct failed, using seed data:', err);
    return PRODUCTS.find((p) => String(p.id) === String(id)) ?? null;
  }
}

/**
 * Fetch reviews for a product.
 * Medusa v1 does not have a native reviews module — reviews are stored
 * either via a custom module or a third-party plugin. Until that is wired up,
 * this always returns the seeded reviews so the UI is fully functional.
 */
export async function fetchProductReviews(_productId: string | number): Promise<Review[]> {
  // TODO: Replace with your Medusa reviews plugin endpoint, e.g.:
  //   GET /store/products/{id}/reviews
  return REVIEWS;
}

// ─── AUTHENTICATION ───────────────────────────────────────────────────────────

export interface MedusaCustomer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

/**
 * Authenticate a customer with email + password.
 * On success, returns the customer object; on failure, throws.
 */
export async function loginCustomer(
  email: string,
  password: string
): Promise<MedusaCustomer> {
  if (!IS_BACKEND_CONFIGURED) {
    // Dev fallback — simulate a successful login
    return {
      id: `cus_${Math.random().toString(36).substr(2, 9)}`,
      email,
      first_name: email.split('@')[0],
      last_name: '',
    };
  }

  const { customer } = await medusa.auth.authenticate({ email, password });
  return customer as MedusaCustomer;
}

/**
 * Register a new customer account.
 */
export async function registerCustomer(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<MedusaCustomer> {
  if (!IS_BACKEND_CONFIGURED) {
    return {
      id: `cus_${Math.random().toString(36).substr(2, 9)}`,
      email,
      first_name: firstName,
      last_name: lastName,
    };
  }

  const { customer } = await medusa.customers.create({
    email,
    password,
    first_name: firstName,
    last_name: lastName,
  });
  return customer as MedusaCustomer;
}

/**
 * Fetch the currently logged-in customer (uses session cookie).
 * Returns null if not authenticated.
 */
export async function getSessionCustomer(): Promise<MedusaCustomer | null> {
  if (!IS_BACKEND_CONFIGURED) return null;

  try {
    const { customer } = await medusa.auth.getSession();
    return customer as MedusaCustomer;
  } catch {
    return null;
  }
}

/**
 * Log out the current customer session.
 */
export async function logoutCustomer(): Promise<void> {
  if (!IS_BACKEND_CONFIGURED) return;
  await medusa.auth.deleteSession();
}

// ─── CART ────────────────────────────────────────────────────────────────────

export interface MedusaCartItem {
  id: string;
  variant_id: string;
  title: string;
  thumbnail: string | null;
  unit_price: number;
  quantity: number;
  variant: {
    title: string; // e.g. "M" (size)
  };
}

export interface MedusaCart {
  id: string;
  items: MedusaCartItem[];
  total: number;
  currency_code: string;
}

/** Persisted cart ID — stored in localStorage to survive page reloads */
const CART_ID_KEY = 'faem_cart_id';

function getPersistedCartId(): string | null {
  return localStorage.getItem(CART_ID_KEY);
}
function persistCartId(id: string) {
  localStorage.setItem(CART_ID_KEY, id);
}
function clearPersistedCartId() {
  localStorage.removeItem(CART_ID_KEY);
}

/**
 * Create a new cart or retrieve the existing one.
 */
export async function getOrCreateCart(): Promise<MedusaCart | null> {
  if (!IS_BACKEND_CONFIGURED) return null;

  const existingId = getPersistedCartId();

  if (existingId) {
    try {
      const { cart } = await medusa.carts.retrieve(existingId);
      return cart as unknown as MedusaCart;
    } catch {
      // Cart expired or invalid — create a fresh one
      clearPersistedCartId();
    }
  }

  const { cart } = await medusa.carts.create();
  persistCartId(cart.id);
  return cart as unknown as MedusaCart;
}

/**
 * Add a line item to the cart.
 * @param variantId — Medusa variant ID (e.g. "variant_01HXXX…")
 * @param quantity — number of units to add
 */
export async function addCartItem(
  cartId: string,
  variantId: string,
  quantity: number
): Promise<MedusaCart> {
  const { cart } = await medusa.carts.lineItems.create(cartId, {
    variant_id: variantId,
    quantity,
  });
  return cart as unknown as MedusaCart;
}

/**
 * Remove a line item from the cart.
 */
export async function removeCartItem(
  cartId: string,
  lineItemId: string
): Promise<MedusaCart> {
  const { cart } = await medusa.carts.lineItems.delete(cartId, lineItemId);
  return cart as unknown as MedusaCart;
}

/**
 * Update line item quantity.
 */
export async function updateCartItem(
  cartId: string,
  lineItemId: string,
  quantity: number
): Promise<MedusaCart> {
  const { cart } = await medusa.carts.lineItems.update(cartId, lineItemId, {
    quantity,
  });
  return cart as unknown as MedusaCart;
}

// ─── CHECKOUT ────────────────────────────────────────────────────────────────

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  country_code: string;
  postal_code: string;
  phone?: string;
}

/**
 * Set the email + shipping address on the cart (step 1 of checkout).
 */
export async function setCheckoutDetails(
  cartId: string,
  email: string,
  address: ShippingAddress
): Promise<MedusaCart> {
  const { cart } = await medusa.carts.update(cartId, {
    email,
    shipping_address: address,
  });
  return cart as unknown as MedusaCart;
}

/**
 * List available shipping options for the cart.
 */
export async function getShippingOptions(cartId: string) {
  const { shipping_options } = await medusa.shippingOptions.listCartOptions(cartId);
  return shipping_options;
}

/**
 * Select a shipping method.
 */
export async function addShippingMethod(
  cartId: string,
  shippingOptionId: string
): Promise<MedusaCart> {
  const { cart } = await medusa.carts.addShippingMethod(cartId, {
    option_id: shippingOptionId,
  });
  return cart as unknown as MedusaCart;
}

/**
 * Complete the cart — initiates payment and places the order.
 * Returns the completed order object.
 */
export async function completeCart(cartId: string) {
  const { data, type } = await medusa.carts.complete(cartId);
  if (type === 'order') {
    clearPersistedCartId();
  }
  return { data, type };
}
