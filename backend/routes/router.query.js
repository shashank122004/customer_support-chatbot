import { Router } from 'express';
import { handleQuery } from '../controller/queryController.js';
import { validateQuery } from '../middleware/validation.js';

const router = Router();

router.post('/request_query', validateQuery, handleQuery);

export default router;