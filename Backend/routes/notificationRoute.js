import express from 'express';
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  getAllNotifications,
  updateNotification,
  deleteNotification,
} from '../controllers/notificationServices.js';

const router = express.Router();

router.post('/createNotification', createNotification);
router.get('/getUserNotifications', getUserNotifications);
router.post('/markNotificationAsRead', markNotificationAsRead);
router.get('/getAllNotifications', getAllNotifications);
router.put('/updateNotification/:id', updateNotification);
router.delete('/deleteNotification/:id', deleteNotification);

export default router;
