import express from 'express';
import { start } from '../controllers/startExperiment.controller.js';
import {authMiddleware} from '../middlewares/auth.middleware.js';
import { shiftMiddleware } from '../middlewares/shift.middleware.js';

const router = express.Router();

router.post('/start', authMiddleware, shiftMiddleware,  start);

export default router;
