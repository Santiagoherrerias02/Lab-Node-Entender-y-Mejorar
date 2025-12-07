import express from 'express';
import { 
  getAllEstados, 
  getEstadoById, 
  getEstadoByNombre, 
  createEstado, 
  updateEstado, 
  deleteEstado 
} from '../controllers/turnoEstado.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rutas públicas (sin autenticación)
router.get('/estados', getAllEstados);
router.get('/estados/:id', getEstadoById);
router.get('/estados/nombre/:nombre', getEstadoByNombre);

// Rutas protegidas (con autenticación)
router.post('/estados', authMiddleware, createEstado);
router.put('/estados/:id', authMiddleware, updateEstado);
router.delete('/estados/:id', authMiddleware, deleteEstado);

export default router; 