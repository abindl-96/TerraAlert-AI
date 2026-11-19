import express from 'express';
import { getUsersByPincode, getUsersByDistrict, generateEmailContent, sendEmailsToCitizens } from '../controllers/emailServices.js';

const router = express.Router();

router.get('/getUsersByPincode', getUsersByPincode);
router.get('/getUsersByDistrict', getUsersByDistrict);
router.post('/generateEmailContent', generateEmailContent);
router.post('/sendEmailsToCitizens', sendEmailsToCitizens);

export default router;
