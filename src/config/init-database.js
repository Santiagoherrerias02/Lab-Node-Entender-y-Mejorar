import sequelize from './database.js';
import { User, Shift } from '../models/index.js';

export const initDatabase = async () => {
  try {
    // Testear la conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Sincronizar modelos con la base de datos
    // force: true - recrea las tablas (¡CUIDADO! borra datos existentes)
    // alter: true - modifica las tablas existentes
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Modelos sincronizados con la base de datos.');

  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    throw error;
  }
};

export default sequelize; 