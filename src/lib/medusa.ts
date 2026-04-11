/**
 * Medusa JS Client — Singleton instance.
 *
 * Usage:
 *   import { medusa } from '@/lib/medusa';
 *   const { products } = await medusa.products.list();
 *
 * Environment variable:
 *   VITE_MEDUSA_BACKEND_URL — Your deployed Medusa backend URL
 *   e.g. https://my-store.railway.app
 *
 * Docs: https://docs.medusajs.com/js-client/overview
 */
import Medusa from '@medusajs/medusa-js';

const BACKEND_URL =
  import.meta.env.VITE_MEDUSA_BACKEND_URL ?? 'http://localhost:9000';

export const medusa = new Medusa({
  baseUrl: BACKEND_URL,
  maxRetries: 3,
});
