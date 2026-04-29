import React from 'react';
import type { AdminOrder } from "@/hooks/useAdminData";

export const generateInvoiceHTML = (order: AdminOrder) => {
  const addr = order.shippingAddress || {};
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Faem Studio — Fatura #${order.shortId}</title>
      <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #1a1a1a; margin: 0; padding: 40px; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 60px; border-bottom: 1px solid #eee; padding-bottom: 30px; }
        .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; text-transform: lowercase; }
        .logo span { color: #800020; }
        .invoice-title { text-align: right; }
        .invoice-title h1 { margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #999; }
        .invoice-title p { margin: 5px 0 0; font-size: 18px; font-weight: bold; }
        
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 60px; }
        .info-section h2 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 15px; border-bottom: 1px solid #f0f0f0; padding-bottom: 5px; }
        .info-section p { margin: 2px 0; font-size: 13px; font-weight: 500; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; padding: 15px 0; border-bottom: 1px solid #eee; }
        td { padding: 20px 0; border-bottom: 1px solid #f9f9f9; font-size: 13px; }
        .item-name { font-weight: bold; }
        .item-meta { font-size: 11px; color: #999; margin-top: 4px; }
        
        .totals { margin-left: auto; width: 250px; }
        .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px; }
        .total-row.grand-total { border-top: 2px solid #1a1a1a; margin-top: 10px; padding-top: 15px; font-size: 18px; font-weight: 900; }
        
        .footer { margin-top: 100px; padding-top: 30px; border-top: 1px solid #eee; text-align: center; font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1px; }
        
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">faem <span>studio</span></div>
        <div class="invoice-title">
          <h1>Sipariş Belgesi</h1>
          <p>#${order.shortId}</p>
          <div style="font-size: 11px; color: #999; margin-top: 5px;">${order.date}</div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-section">
          <h2>Müşteri Bilgileri</h2>
          <p><strong>${order.user}</strong></p>
          <p>${addr.address || ''}</p>
          <p>${addr.city || ''} ${addr.postal || ''}</p>
          <p>${order.email || ''}</p>
          <p>${addr.phone || ''}</p>
        </div>
        <div class="info-section">
          <h2>Mağaza Bilgileri</h2>
          <p><strong>Faem Studio Archive</strong></p>
          <p>Barbaros Mahallesi 177 Sokak</p>
          <p>No: 4 Daire: 1, Bağcılar</p>
          <p>İstanbul, Türkiye</p>
          <p>faembutik@gmail.com</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Ürün Açıklaması</th>
            <th style="text-align: center;">Adet</th>
            <th style="text-align: right;">Birim Fiyat</th>
            <th style="text-align: right;">Toplam</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((item: any) => `
            <tr>
              <td>
                <div class="item-name">${item.name}</div>
                <div class="item-meta">Beden: ${item.size || 'STD'}</div>
              </td>
              <td style="text-align: center;">${item.quantity || 1}</td>
              <td style="text-align: right;">${item.price}</td>
              <td style="text-align: right;">${item.price}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span style="color: #999; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Ödeme Yöntemi</span>
          <span style="font-weight: bold;">iyzico / Online</span>
        </div>
        <div class="total-row grand-total">
          <span>Toplam</span>
          <span>${order.total}</span>
        </div>
      </div>

      <div class="footer">
        © ${currentYear} Faem Studio — Archive & Collections<br>
        Bu belge mali mühür yerine geçmez, sipariş bilgilendirme formudur.
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;
};
