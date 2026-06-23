import { HealthSnapshot } from '../models/HealthSnapshot.js';

export const getHealthSnapshot = () => new HealthSnapshot({
  status: 'ok',
  service: 'campusforge',
  timestamp: new Date().toISOString(),
});
