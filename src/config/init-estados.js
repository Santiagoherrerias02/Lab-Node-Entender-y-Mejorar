import TurnoEstado from '../models/turnoEstado.model.js';
import sequelize from './database.js';

export const initEstados = async () => {
  try {
    // Sincronizar el modelo con la base de datos
    await TurnoEstado.sync({ force: true }); // force: true recreará la tabla
    
    // Crear los estados iniciales
    const estados = [
      { nombreEstado: 'pendiente' },
      { nombreEstado: 'aceptado' },
      { nombreEstado: 'rechazado' },
      { nombreEstado: 'finalizado' },
      { nombreEstado: 'cancelado' }
    ];
    
    await TurnoEstado.bulkCreate(estados);
    
    console.log('Estados de turno inicializados correctamente');
    
    // Mostrar los estados creados
    const estadosCreados = await TurnoEstado.findAll();
    console.log('Estados disponibles:', estadosCreados.map(e => ({ id: e.id, nombre: e.nombreEstado })));
    
  } catch (error) {
    console.error('Error inicializando estados:', error);
    throw error;
  }
};

// Si se ejecuta directamente este archivo
if (import.meta.url === `file://${process.argv[1]}`) {
  initEstados()
    .then(() => {
      console.log('Inicialización completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error en inicialización:', error);
      process.exit(1);
    });
} 