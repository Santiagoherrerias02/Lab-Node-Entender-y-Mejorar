export const socketList = new Map();

export function socketConnection(io) {
  io.on('connection', (socket) => {
    console.log('usuario conectado', socket.id);

    socket.on('disconnect', () => {
      if (socketList) {
        socketList.forEach((value, key) => {
          if (value === socket.id) {
            socketList.delete(key); // Eliminar el socket al desconectarse
          }
        });
      }
    });
  })
}
