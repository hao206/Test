import { healthController } from '../controllers/healthController.js';

export const registerHealthRoutes = (app) => {
  app.get('/api/health', healthController);
};
