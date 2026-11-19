import express from "express";
import { deleteCategory, deleteGuidline, deleteGovernmentAuthority} from "../controllers/deleteServices.js";
import { deleteNotification } from "../controllers/notificationServices.js";

const router=express.Router();

router.delete('/deleteGuidline/:id', deleteGuidline);
router.delete('/deleteCategory/:id', deleteCategory)
router.delete('/deleteGovernmentAuthority/:id', deleteGovernmentAuthority)
router.delete('/deleteNotification/:id', deleteNotification)

export default router
