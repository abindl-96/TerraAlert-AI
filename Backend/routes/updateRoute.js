import express from 'express'
import { blockUser, unblockUser, updateCategory, updateGuidlines, updateRequest, updateUser, updateGovernmentAuthority, markAlertAsRead } from '../controllers/editServices.js'
import { markNotificationAsRead, updateNotification } from '../controllers/notificationServices.js'

const router= express.Router();

router.put('/UpdateUser/:id', updateUser);
router.put('/blockUser/:id', blockUser);
router.put('/unblockUser/:id', unblockUser);
router.put('/updateGuidlines/:id', updateGuidlines);
router.put('/UpdateCategory',updateCategory)
router.put('/UpdateRequest/:id',updateRequest)
router.put('/updateGovernmentAuthority/:id', updateGovernmentAuthority)
router.put('/markAlertAsRead/:id', markAlertAsRead)
router.post('/markNotificationAsRead', markNotificationAsRead)
router.put('/updateNotification/:id', updateNotification)

export default router;