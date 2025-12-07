// auth/auth.routes.js
import express from 'express';
import {createShift, getAllShifts, getShiftById} from '../controllers/shift.controller.js';
import {authMiddleware} from '../middlewares/auth.middleware.js'

const router = express.Router();

router.post('/create', authMiddleware, createShift);
router.get('/shifts', getAllShifts);
router.post('/shift', getShiftById);

export default router;
