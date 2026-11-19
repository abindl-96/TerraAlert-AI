import express from 'express'
import { getAllCategory, getAllCategories, getAllStaffs, getAllRequests, getAllFeedbacks, getAllUsers, getUserById, getGuidlines, getRiskPredictions, getAllGovernmentAuthorities, getGovernmentAlerts} from '../controllers/getServices.js'
import { getUserNotifications, getAllNotifications } from '../controllers/notificationServices.js'


const router= express.Router()

router.get('/getAllUsers', getAllUsers);
router.get('/getUserById/:id', getUserById);
router.get('/getGuidlines', getGuidlines)
router.get('/getAllCategory', getAllCategory)
router.get('/getAllStaff', getAllStaffs)
router.get('/getAllCategories', getAllCategories)
router.get('/getAllRequests', getAllRequests)
router.get('/getAllFeedbacks', getAllFeedbacks)
router.get('/getRiskPredictions', getRiskPredictions)
router.get('/getAllGovernmentAuthorities', getAllGovernmentAuthorities)
router.get('/getGovernmentAlerts', getGovernmentAlerts)
router.get('/getUserNotifications', getUserNotifications)
router.get('/getAllNotifications', getAllNotifications)


export default router