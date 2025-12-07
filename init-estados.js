import { initEstados } from './src/config/init-estados.js';

console.log('Inicializando estados de turno...');

initEstados()
  .then(() => {
    console.log('✅ Estados inicializados correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error inicializando estados:', error);
    process.exit(1);
  }); 