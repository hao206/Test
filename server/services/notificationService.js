import * as repo from '../repositories/notificationRepository.js';

export const getAllNotifications = () => {
  return repo.listNotifications();
};

export const createNotification = ({ title, message, audience = 'All', type = 'info', time }) => {
  const notif = {
    title,
    message,
    audience,
    type,
    time: time || new Date().toISOString()
  };
  return repo.addNotification(notif);
};

export const markNotificationRead = (id) => repo.markAsRead(id);

export const clearAll = () => repo.clearNotifications();

export default {
  getAllNotifications,
  createNotification,
  markNotificationRead,
  clearAll
};
