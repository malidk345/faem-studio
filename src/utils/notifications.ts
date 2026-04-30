import { supabase } from '../lib/supabase';

const VAPID_PUBLIC_KEY = 'BK6TEdnqSBjpbCaIbAMD5w_93HbCDuw2DBzaosP__Ufn7aDB9kNHkLdLJ9QrvrjosBcnZVKcFjom2Kt_0KRDYhc';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPushNotifications(userId: string) {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Tarayıcınız push bildirimlerini desteklemiyor.');
    }

    const registration = await navigator.serviceWorker.ready;
    
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Bildirim izni verilmedi.');
    }

    // Subscribe
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    // Save to Supabase
    const subJSON = subscription.toJSON();
    const { error } = await supabase
      .from('admin_subscriptions')
      .upsert({
        user_id: userId,
        endpoint: subJSON.endpoint,
        subscription: subJSON
      }, { onConflict: 'endpoint' });

    if (error) throw error;

    return true;
  } catch (error: any) {
    console.error('Subscription error:', error);
    throw error;
  }
}

export async function checkSubscriptionStatus() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
}
