import * as service from '../services/notificationService.js';

export const listNotifications = (_req, res) => {
  res.status(200).json(service.getAllNotifications());
};

export const createNotification = (req, res) => {
  const { title, message, audience, type } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'title and message required' });
  const created = service.createNotification({ title, message, audience, type });
  res.status(201).json(created);
};

export const markRead = (req, res) => {
  const { id } = req.params;
  const updated = service.markNotificationRead(id);
  if (!updated) return res.status(404).json({ error: 'not found' });
  res.status(200).json(updated);
};

export const clearAll = (_req, res) => {
  service.clearAll();
  res.status(200).json({ ok: true });
};

export default {
  listNotifications,
  createNotification,
  markRead,
  clearAll
};
