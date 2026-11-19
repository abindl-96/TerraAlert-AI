import express from 'express'
import { Adminlogin, Userlogin, GovernmentLogin} from '../controllers/auth.js'


const router= express.Router()


router.post('/AdminLogin', Adminlogin)
router.post('/UserLogin', Userlogin)
router.post('/GovernmentLogin', GovernmentLogin)


export default router
