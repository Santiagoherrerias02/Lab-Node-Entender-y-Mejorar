import User from './user.model.js';
import Shift from './shift.model.js';
import TurnoEstado from './turnoEstado.model.js';

// Definir relaciones
User.hasMany(Shift, {
  foreignKey: 'id_usuario',
  as: 'shifts'
});

Shift.belongsTo(User, {
  foreignKey: 'id_usuario',
  as: 'user'
});

// Relación entre Shift y TurnoEstado
Shift.belongsTo(TurnoEstado, {
  foreignKey: 'id_estado',
  as: 'estado'
});

TurnoEstado.hasMany(Shift, {
  foreignKey: 'id_estado',
  as: 'shifts'
});

export { User, Shift, TurnoEstado }; 