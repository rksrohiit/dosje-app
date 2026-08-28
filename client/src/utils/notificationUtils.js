/**
 * Web Push Notifications utility for browser native alerts
 */

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Browser does not support desktop notifications.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const triggerPushNotification = (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      tag: 'dosje-anomaly-alert',
      renotify: true,
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      window.location.href = '/analytics';
    };
  } catch (err) {
    console.warn('Push notification error:', err);
  }
};
