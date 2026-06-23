import express from 'express';
import { listNotifications, createNotification, markRead, clearAll } from '../controllers/notificationController.js';

export const registerNotificationRoutes = (app) => {
  const router = express.Router();

  router.get('/', listNotifications);
  router.post('/', createNotification);
  router.put('/:id/read', markRead);
  router.delete('/', clearAll);

  app.use('/api/notifications', router);
};

export default registerNotificationRoutes;
