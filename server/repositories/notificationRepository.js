const notifications = [];

export const listNotifications = () => notifications;

export const addNotification = (notif) => {
  const item = { id: `n_${Date.now()}`, read: false, ...notif };
  notifications.unshift(item);
  return item;
};

export const markAsRead = (id) => {
  const idx = notifications.findIndex(n => n.id === id);
  if (idx === -1) return null;
  notifications[idx].read = true;
  return notifications[idx];
};

export const clearNotifications = () => {
  notifications.length = 0;
};

export default {
  listNotifications,
  addNotification,
  markAsRead,
  clearNotifications
};
