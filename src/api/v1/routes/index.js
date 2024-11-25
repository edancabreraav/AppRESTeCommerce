import { Router } from 'express';
import config from '../../../config/config';

import prodServRoutes from './prodServ.routes';

const routerAPI = (app) => { 
  const router = Router();
  const api = config.API_URL;

  app.use(api, router);
  // Routes
  router.use('/prod-serv', prodServRoutes);
 
  return router;
};
module.exports = routerAPI;