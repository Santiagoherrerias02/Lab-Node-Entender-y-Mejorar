import jwt from 'jsonwebtoken';
import { Shift, TurnoEstado } from '../models/index.js';

/*
 * Verificar que el turno del usuario sea el siguiente
 */

const JWT_SECRET = process.env.JWT_SECRET

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export const shiftMiddleware = async (req, res, next) => {
  const token = req.user;
  if (!token) {
    return res.status(401).json({ error: 'Token faltante' });
  }

  const shiftId = req.body.shiftId

  try {
    const estadoPendiente = await TurnoEstado.findOne({ where: { nombreEstado: 'pendiente' } });
    if (!estadoPendiente) {
      console.log('No se encontró el estado pendiente');
      return;
    }

    const nextShift = await Shift.findOne({
      where: { id_estado: estadoPendiente.id },
      order: [['created_at', 'ASC']]
    });

    if (!nextShift) return;

    if (shiftId !== nextShift.id) {
      return res.status(401).json({ error: 'No es el siguiente turno' });
    }

    next()

  } catch (err) {
    return res.status(401).json({ error: `Error en el turno ${err } ${shiftId}` });
  }
};