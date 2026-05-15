import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateInvoiceHTML } from '../invoiceGenerator.ts';
import type { AdminOrder } from '@/hooks/useAdminData';

describe('generateInvoiceHTML', () => {
  const currentYear = new Date().getFullYear();

  const mockValidOrder: AdminOrder = {
    id: '12345678-1234-1234-1234-1234567890ab',
    shortId: '12345678',
    user: 'John Doe',
    email: 'john@example.com',
    total: '1,500.00 ₺',
    totalNumeric: 1500,
    status: 'pending',
    date: '15 May 2024, 14:30',
    rawDate: '2024-05-15T11:30:00Z',
    items: [
      { name: 'Cool T-Shirt', size: 'M', quantity: 2, price: '500.00 ₺' },
      { name: 'Awesome Pants', size: 'L', quantity: 1, price: '500.00 ₺' }
    ],
    itemCount: 2,
    isGuest: false,
    userId: null,
    shippingAddress: {
      address: '123 Main St',
      city: 'Istanbul',
      postal: '34000',
      phone: '+90 555 123 4567'
    },
    tracking_number: null,
    admin_note: null
  };

  it('should generate valid HTML containing correct order ID, total, items, and customer information', () => {
    const html = generateInvoiceHTML(mockValidOrder);

    // Order Details
    assert.match(html, /<title>Faem Studio — Fatura #12345678<\/title>/);
    assert.match(html, /<p>#12345678<\/p>/);
    assert.match(html, /15 May 2024, 14:30/);

    // Customer Information
    assert.match(html, /<strong>John Doe<\/strong>/);
    assert.match(html, /john@example\.com/);
    assert.match(html, /123 Main St/);
    assert.match(html, /Istanbul 34000/);
    assert.match(html, /\+90 555 123 4567/);

    // Items
    assert.match(html, /Cool T-Shirt/);
    assert.match(html, /Beden: M/);
    assert.match(html, /<td style="text-align: center;">2<\/td>/);
    assert.match(html, /500\.00 ₺/);

    assert.match(html, /Awesome Pants/);
    assert.match(html, /Beden: L/);
    assert.match(html, /<td style="text-align: center;">1<\/td>/);

    // Total
    assert.match(html, /<span>1,500\.00 ₺<\/span>/);

    // Current year in footer
    assert.match(html, new RegExp(`© ${currentYear} Faem Studio`));
  });

  it('should handle missing shippingAddress safely', () => {
    const orderWithoutAddress = {
      ...mockValidOrder,
      shippingAddress: null
    };

    const html = generateInvoiceHTML(orderWithoutAddress as unknown as AdminOrder);

    // It should still generate the user and email
    assert.match(html, /<strong>John Doe<\/strong>/);
    assert.match(html, /john@example\.com/);

    // Ensure no null/undefined text is printed where address parts usually go,
    // though the code does `${addr.address || ''}` so it will be empty
    assert.doesNotMatch(html, /null/);
    assert.doesNotMatch(html, /undefined/);
  });

  it('should handle missing properties like email, user, phone, and item size gracefully', () => {
    const minimalOrder: AdminOrder = {
      id: '87654321-1234-1234-1234-1234567890ab',
      shortId: '87654321',
      user: '', // missing user
      email: '', // missing email
      total: '1,000.00 ₺',
      totalNumeric: 1000,
      status: 'pending',
      date: '16 May 2024, 10:00',
      rawDate: '2024-05-16T07:00:00Z',
      items: [
        { name: 'Basic Item', price: '1,000.00 ₺' } // missing size and quantity
      ],
      itemCount: 1,
      isGuest: true,
      userId: null,
      shippingAddress: {}, // missing all fields
      tracking_number: null,
      admin_note: null
    };

    const html = generateInvoiceHTML(minimalOrder);

    assert.match(html, /<p>#87654321<\/p>/);

    // Check that missing user/email are empty, not "undefined"
    assert.doesNotMatch(html, /undefined/);
    assert.doesNotMatch(html, /null/);

    // Missing size defaults to STD
    assert.match(html, /Beden: STD/);

    // Missing quantity defaults to 1
    assert.match(html, /<td style="text-align: center;">1<\/td>/);

    // Empty paragraphs for missing address parts (check that the paragraph is empty, but we can just rely on no 'undefined' text)
    assert.match(html, /<p><\/p>/);
  });
});
