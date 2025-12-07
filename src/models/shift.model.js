import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Shift = sequelize.define('Shift', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_estado: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1 // Por defecto "pendiente"
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'shift',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Métodos estáticos para mantener la misma API
Shift.createShift = async (user_id) => {
  try {
    const shift = await Shift.create({ id_usuario: user_id });
    return shift.id;
  } catch (error) {
    console.error('Error creando el shift:', error);
    throw error;
  }
};

Shift.getAllShifts = async () => {
  try {
    return await Shift.findAll();
  } catch (error) {
    console.error('Error obteniendo shifts:', error);
    throw error;
  }
};

Shift.getShiftByUser = async (id) => {
  try {
    return await Shift.findAll({
      where: { id_usuario: id }
    });
  } catch (error) {
    console.error('Error obteniendo shift por usuario:', error);
    throw error;
  }
};

export default Shift;