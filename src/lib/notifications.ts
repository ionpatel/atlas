/**
 * Push Notification System for Atlas ERP
 */

export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  tag?: string;
  actions?: { action: string; title: string }[];
}

// Check if notifications are supported
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

// Get current permission status
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  
  const permission = await Notification.requestPermission();
  return permission;
}

// Subscribe to push notifications
export async function subscribeToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
  if (!isNotificationSupported()) return null;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });
    
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return null;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
    return false;
  }
}

// Show a local notification (without push)
export async function showLocalNotification(payload: NotificationPayload): Promise<void> {
  if (!isNotificationSupported()) return;
  
  const permission = getNotificationPermission();
  if (permission !== 'granted') return;
  
  const registration = await navigator.serviceWorker.ready;
  
  await registration.showNotification(payload.title, {
    body: payload.body,
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: payload.tag,
    data: { url: payload.url || '/dashboard' },
    actions: payload.actions
  });
}

// Helper: Convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
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

// Notification types for Atlas ERP
export const NOTIFICATION_TYPES = {
  LOW_STOCK: 'low_stock',
  INVOICE_DUE: 'invoice_due',
  INVOICE_PAID: 'invoice_paid',
  NEW_ORDER: 'new_order',
  PAYMENT_RECEIVED: 'payment_received'
} as const;

// Create notification payloads for common events
export function createLowStockNotification(productName: string, quantity: number): NotificationPayload {
  return {
    title: 'Low Stock Alert',
    body: `${productName} is running low (${quantity} left)`,
    url: '/inventory?filter=low-stock',
    tag: NOTIFICATION_TYPES.LOW_STOCK,
    actions: [
      { action: 'reorder', title: 'Reorder' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
}

export function createInvoiceDueNotification(invoiceNumber: string, amount: number, daysLeft: number): NotificationPayload {
  return {
    title: 'Invoice Due Soon',
    body: `Invoice #${invoiceNumber} ($${amount}) is due in ${daysLeft} days`,
    url: '/invoices?filter=due-soon',
    tag: NOTIFICATION_TYPES.INVOICE_DUE,
    actions: [
      { action: 'send_reminder', title: 'Send Reminder' },
      { action: 'view', title: 'View' }
    ]
  };
}

export function createPaymentReceivedNotification(amount: number, customerName: string): NotificationPayload {
  return {
    title: 'Payment Received! 💰',
    body: `$${amount.toLocaleString()} received from ${customerName}`,
    url: '/invoices?filter=paid',
    tag: NOTIFICATION_TYPES.PAYMENT_RECEIVED
  };
}
