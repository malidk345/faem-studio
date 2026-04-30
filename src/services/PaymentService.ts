import { supabase } from "@/lib/supabase";

export interface TamiPaymentParams {
  orderId: string;
  amount: string;
  cardHolderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  callbackUrl: string;
}

export class PaymentService {
  /**
   * Initiate 3D Secure Payment process
   */
  static async initiate3DPayment(params: TamiPaymentParams) {
    const { data, error } = await supabase.functions.invoke('tami-payment', {
      body: {
        action: 'init-3d',
        ...params
      }
    });

    if (error) {
      console.error('Payment initiation failed:', error);
      throw new Error(error.message || 'Ödeme başlatılamadı.');
    }

    return data;
  }

  /**
   * Complete payment after 3D validation
   */
  static async completePayment(tamiId: string, orderId: string) {
    const { data, error } = await supabase.functions.invoke('tami-payment', {
      body: {
        action: 'complete-3d',
        tamiId,
        orderId
      }
    });

    if (error) {
      console.error('Payment completion failed:', error);
      throw new Error(error.message || 'Ödeme tamamlanamadı.');
    }

    return data;
  }
}
