import { getHealthSnapshot } from '../services/healthService.js';

export const healthController = (_req, res) => {
  res.status(200).json(getHealthSnapshot());
};
