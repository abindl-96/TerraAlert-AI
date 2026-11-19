import express from 'express'
import { addCategory, addFeedback, addGuidlines, addRequest, addUsers, addRiskPrediction, addGovernmentAuthority, sendGovernmentAlert } from '../controllers/addServices.js'
import { createNotification } from '../controllers/notificationServices.js'


const router= express.Router()

router.post('/adduser',addUsers)
router.post('/addGuidlines', addGuidlines)
router.post('/addCategory', addCategory)
router.post('/addRequest', addRequest)
router.post('/addFeedback', addFeedback)
router.post('/addRiskPrediction', addRiskPrediction)
router.post('/addGovernmentAuthority', addGovernmentAuthority)
router.post('/sendGovernmentAlert', sendGovernmentAlert)
router.post('/createNotification', createNotification)


export default router
