import { procesarColaDeTurnos, startExp } from "../services/startExperiment.service.js";

export const shiftQueue = async () => {
    procesarColaDeTurnos();
}

export const start = async (req, res)=> {
    console.log('experimento iniciado')
    startExp(req, res)
    return res.status(200).json({ error: 'experimento iniciado' });
}