import express from 'express';
import { generateReport } from '../controllers/reportServices.js';

const router = express.Router();

router.get('/generateReport', generateReport);

export default router;
