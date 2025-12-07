import { Shift, TurnoEstado } from '../models/index.js';
import io from '../server.js';
import { socketList } from '../socket.handler.js';


let bandera = false;
let releEncendido = false;
let step = 0;
let maxStep = 30;
let intervalId = null;

// Simula la función que manda el turno al frontend
function notificarTurno(socket, turno) {
    console.log('----------Notificando usuario------------')
    socket.emit("turno:ofrecido", {
        turnoId: turno.id,
        tiempoRespuesta: 30
    });
}

// función que obtiene el socket de un usuario
function getSocketByUserId(userId, io) {
    const socketId = socketList.get(userId)
    return socketId ? io.sockets.sockets.get(socketId) : null;
}

// Procesa el siguiente turno en la cola FIFO
const procesarColaDeTurnos = async () => {
    console.log('Procesando cola de turnos');

    // 1. Buscar el estado "pendiente"
    const estadoPendiente = await TurnoEstado.findOne({ where: { nombreEstado: 'pendiente' } });
    if (!estadoPendiente) {
        console.log('No se encontró el estado pendiente');
        return;
    }

    // 2. Buscar el primer turno pendiente
    const siguiente = await Shift.findOne({
        where: { id_estado: estadoPendiente.id },
        order: [['created_at', 'ASC']]
    });

    const activo = await Shift.findOne({
        where: { id_estado: 3 }
    })

    console.log('------------Turno Siguiente--------------', siguiente);
    console.log('------------Turno Activo-----------------', activo);

    if (!siguiente && activo) {
        return // No hay turnos o ya hay un turno activo
    }

    if (siguiente && !activo) {
        // 3. Obtener el socket del usuario
        const socket = getSocketByUserId(siguiente.id_usuario, io);
        if (!socket) {
            console.log("Usuario no conectado, se pasa al siguiente");
            // Cambia el estado a "rechazado"
            const estadoRechazado = await TurnoEstado.findOne({ where: { nombreEstado: 'rechazado' } });
            if (estadoRechazado) {
                await siguiente.update({ id_estado: estadoRechazado.id });
            }
            return procesarColaDeTurnos(io);
        }

        // 4. Notificamos al usuario
        notificarTurno(socket, siguiente);

        // 5. Esperamos 30 segundos para que acepte
        setTimeout(async () => {
            // Refresca el turno desde la BD
            const turnoActual = await Shift.findByPk(siguiente.id);
            if (turnoActual && turnoActual.id_estado === estadoPendiente.id) {
                console.log("Turno no aceptado a tiempo, se rechaza");
                const estadoRechazado = await TurnoEstado.findOne({ where: { nombreEstado: 'rechazado' } });
                if (estadoRechazado) {
                    await turnoActual.update({ id_estado: estadoRechazado.id });
                }
                procesarColaDeTurnos(io); // Continuamos con el siguiente
            }
        }, 30_000);
    }
}

function gaussTemp(t, A = 60, mu = 15, sigma = 5) {
    return A * Math.exp(-Math.pow(t - mu, 2) / (2 * Math.pow(sigma, 2)));
}

function leerResistenciaSensor() {
    // Usar el step como tiempo discreto
    const temp = gaussTemp(step, 60, 15, 5); // Máx 60°C, pico en step 15, sigma=5
    return temp;
}

function obtenerTemperatura() {
    const resistencia = leerResistenciaSensor();
    const data = {
        timestamp: Date.now(),
        temperatura: resistencia
    };
    return data;
}

const startExp = async (req, res) => {
    console.log('Estado de la bandera', bandera)
    const userId = req.user.userId
    const shiftId = req.body.shiftId

    const socket = getSocketByUserId(userId, io)

    let data = obtenerTemperatura();

    try {
        // Buscar el estado "aceptado"
        const aceptedShiftState = await TurnoEstado.findOne({ where: { nombreEstado: 'aceptado' } });
        if (!aceptedShiftState) {
            console.log('No se encontró el estado aceptado');
            return;
        }

        const aceptedShift = await Shift.findOne({ where: { id_estado: aceptedShiftState.id } })

        if (aceptedShift) {
            console.log('Ya hay un turno activo', aceptedShift)
            return res.status(400).json({ message: 'Ya hay un turno activo' })
        }
        const estadoPendiente = await TurnoEstado.findOne({ where: { nombreEstado: 'pendiente' } });
        if (!estadoPendiente) {
            console.log('No se encontró el estado pendiente');
            return;
        }

        const shift = await Shift.findOne({
            where: {
                id: shiftId,
                id_estado: estadoPendiente.id,
            }
        })
        if (!shift) return

        console.log('Aca esta el turno aceptado: ', aceptedShiftState)

        await shift.update({ id_estado: aceptedShiftState.id })

        console.log('Estado del turno al iniciar el experimento', shift)

        // Requiere instalar: npm install onoff
        // Y una librería para el MAX31865 si quieres acceso real al sensor

        // Simulación de dependencias hardware
        // const Gpio = require('onoff').Gpio;
        // const spi = require('spi-device'); // O la librería que uses para MAX31865

        // Simulación de pines y sensor
        // const rele = new Gpio(18, 'out');
        // const sensor = ... // Instancia real del MAX31865

        if (!releEncendido && !bandera && (data.temperatura <= 30)) {
            // rele.writeSync(0); // Encender el relé (hardware real)
            releEncendido = true
            bandera = true
            console.log('Relé encendido (GPIO 18 en LOW)');
        }

        intervalId = setInterval(async () => {
            data = obtenerTemperatura()

            if ((releEncendido && bandera && (data.temperatura >= 46)) || (step >= maxStep)) {
                // rele.writeSync(1); // Apagar el relé (hardware real)
                releEncendido = false
                bandera = false
                console.log('Relé apagado (GPIO 18 en HIGH)', data.temperatura)
            }
            if ((!releEncendido && (data.temperatura <= 30)) && (step >= maxStep)) {
                bandera = false
                step = 0
                // Buscar el estado "finalizado"
                const endShift = await TurnoEstado.findOne({ where: { nombreEstado: 'finalizado' } });
                if (!endShift) {
                    console.log('No se encontró el estado finalizado');
                    return;
                }

                //Cambiamos el estado a finalizado
                await shift.update({ id_estado: endShift.id })

                // finalizar turno y comenzar siguiente
                clearInterval(intervalId)

                await procesarColaDeTurnos()

                console.log("Experimento finalizado", [endShift.id, shift])

            }

            io.emit('exp:data', data)

            step++;

        }, 500)
    } catch (err) {
        console.error('Error: ', err)
    }


}

// Cuando el usuario acepta el turno
function aceptarTurno(turnoId) {
    // Aquí deberías actualizar el estado en la base de datos
    // Este método debe ser adaptado para usar Sequelize
    // Ejemplo:
    // const turno = await Shift.findByPk(turnoId);
    // if (turno && turno.id_estado === id_estado_pendiente) {
    //   await turno.update({ id_estado: id_estado_aceptado });
    // }
}

// Cuando termina el turno
function finalizarTurno(turnoId, io) {
    // Aquí deberías actualizar el estado en la base de datos
    // Este método debe ser adaptado para usar Sequelize
    // Ejemplo:
    // const turno = await Shift.findByPk(turnoId);
    // if (turno && turno.id_estado === id_estado_aceptado) {
    //   await turno.update({ id_estado: id_estado_finalizado });
    //   procesarColaDeTurnos(io);
    // }
}

// Cuando se conecta un usuario
function registrarSocket(userId, socketId) {
    socketList[userId] = socketId;
}

export {
    procesarColaDeTurnos,
    aceptarTurno,
    finalizarTurno,
    registrarSocket,
    startExp
};