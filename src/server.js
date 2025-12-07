import 'dotenv/config';
import server from './app.js';
import { Server } from 'socket.io';
import {socketConnection} from './socket.handler.js'
import { initDatabase } from './config/init-database.js';

//WebSocket
const io = new Server(server, {
  cors: {
      origin: 'http://localhost:3000', // o donde esté tu frontend
      credentials: true
  }
});

socketConnection(io)

const PORT = process.env.PORT || 3000;

// Inicializar base de datos antes de iniciar el servidor
const startServer = async () => {
  try {
    await initDatabase();
    
    server.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error iniciando el servidor:', error);
    process.exit(1);
  }
};

startServer();

export default io; 