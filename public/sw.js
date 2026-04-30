/* 
  Faem Studio Admin - Service Worker
  Handles background push notifications for iOS 16.4+ and Desktop
*/

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Yeni bir bildiriminiz var.',
      icon: '/manifest.json', // Manifest icons are often used if specific icons aren't provided
      badge: 'https://img.icons8.com/ios-filled/50/000000/notification.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/'
      },
      actions: [
        { action: 'open', title: 'Görüntüle' },
        { action: 'close', title: 'Kapat' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Faem Studio', options)
    );
  } catch (err) {
    console.error('Push notification error:', err);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Basic fetch handler to make it a valid PWA
self.addEventListener('fetch', (event) => {
  // We can implement caching here if needed, but for admin portal, 
  // live data is usually preferred.
});
