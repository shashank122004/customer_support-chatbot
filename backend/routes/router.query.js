import { Router } from 'express';
import { handleQuery } from '../controller/queryController.js';

const router = Router();

router.post('/request_query', handleQuery);

export default router;