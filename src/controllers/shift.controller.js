import Shift from '../models/shift.model.js';
import { User, TurnoEstado } from '../models/index.js';
import { socketList } from '../socket.handler.js';
import io from '../server.js';
import { shiftQueue } from './startExperiment.controller.js';

export const createShift = async (req, res) => {
  try {
    const userId = req.body.userId;
    const socketId = req.body.socketid;

    const shift = await Shift.findOne({
      where : {
        id_estado : 1,
        id_usuario : userId
      }
    })
    console.log('Turno con ID del usuario: ', userId)
    console.log('Existe turno?', shift)

    if (shift) {
      console.log('UPS YA HAY UN TURNO')
      return res.status(400).json({ message: 'Ya hay un turno pendiente o aceptado para tu usuario' })
    }

    socketList.set(userId, socketId);
    console.log('socketList', socketList);

    const socket = io.sockets.sockets.get(socketId);
    if (!socket) {
      console.error(`Socket con ID ${socketId} no encontrado o desconectado`);
    } else {
      console.log(`Socket encontrado, emitiendo...`);
      socket.emit("hello", socketId);
    }

    // Obtener el estado "pendiente" por defecto
    const estadoPendiente = await TurnoEstado.findOne({ where: { nombreEstado: 'pendiente' } });
    if (!estadoPendiente) {
      return res.status(500).json({ message: 'Error: Estado pendiente no encontrado' });
    }

    // Usar Sequelize de manera más limpia
    const newShift = await Shift.create({
      id_usuario: userId,
      id_estado: estadoPendiente.id
    });

    if (!newShift) {
      return res.status(400).json({ message: 'Error creating shift' });
    }

    // Llamar al endpoint /start después de crear el turno
    try {
      console.log('Llamando a shiftQueue después de crear turno...');
      await shiftQueue();
      console.log('shiftQueue ejecutado exitosamente');
    } catch (error) {
      console.error('Error ejecutando shiftQueue:', error.message);
      // No fallamos la creación del turno si falla la ejecución de shiftQueue
    }

    res.json({ id: newShift.id });
  } catch (error) {
    console.error('Error creating shift:', error);
    res.status(400).json({ message: 'Error creating shifts', error: error.message });
  }
};

export const getAllShifts = async (req, res) => {
  try {
    // Usar Sequelize con includes para traer datos relacionados
    const shifts = await Shift.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'role']
        },
        {
          model: TurnoEstado,
          as: 'estado',
          attributes: ['id', 'nombreEstado']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    if (!shifts || shifts.length === 0) {
      return res.status(404).json({ message: 'No shifts found' });
    }

    res.json(shifts);
  } catch (error) {
    console.error('Error getting shifts:', error);
    res.status(400).json({ message: 'Error getting shifts', error: error.message });
  }
};

export const getShiftById = async (req, res) => {
  try {
    const data = req.user; // Asumiendo que tienes middleware de autenticación
    const userId = data.userId;

    const shifts = await Shift.findAll({
      where: { id_usuario: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'role']
        },
        {
          model: TurnoEstado,
          as: 'estado',
          attributes: ['id', 'nombreEstado']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    if (!shifts || shifts.length === 0) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.json(shifts);
  } catch (error) {
    console.error('Error getting shift:', error);
    res.status(400).json({ message: 'Error getting shift', error: error.message });
  }
};

// Nuevos métodos usando Sequelize
export const getShiftWithUser = async (req, res) => {
  try {
    const { id } = req.params;

    const shift = await Shift.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'role']
        },
        {
          model: TurnoEstado,
          as: 'estado',
          attributes: ['id', 'nombreEstado']
        }
      ]
    });

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.json(shift);
  } catch (error) {
    console.error('Error getting shift:', error);
    res.status(400).json({ message: 'Error getting shift', error: error.message });
  }
};

export const deleteShift = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.user;

    const shift = await Shift.findOne({
      where: {
        id: id,
        id_usuario: data.userId // Solo el propietario puede eliminar
      }
    });

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found or unauthorized' });
    }

    await shift.destroy();
    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    console.error('Error deleting shift:', error);
    res.status(400).json({ message: 'Error deleting shift', error: error.message });
  }
};