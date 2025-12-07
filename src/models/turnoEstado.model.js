import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TurnoEstado = sequelize.define('TurnoEstado', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombreEstado: {
    type: DataTypes.ENUM('pendiente', 'aceptado', 'rechazado', 'finalizado', 'cancelado'),
    allowNull: false,
    defaultValue: 'pendiente'
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
  tableName: 'turno_estado',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Métodos estáticos
TurnoEstado.findByEstado = async (nombreEstado) => {
  try {
    return await TurnoEstado.findOne({
      where: { nombreEstado }
    });
  } catch (error) {
    console.error('Error buscando estado por nombre:', error);
    throw error;
  }
};

TurnoEstado.getAllEstados = async () => {
  try {
    return await TurnoEstado.findAll();
  } catch (error) {
    console.error('Error obteniendo estados:', error);
    throw error;
  }
};

export default TurnoEstado; 