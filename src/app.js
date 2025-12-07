import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// import { initDB } from './initDB.js';
import authRoutes from './routes/auth.routes.js';
import shiftRoutes from './routes/shift.routes.js';
import exproutes from './routes/experiment.routes.js'
import turnoEstadoRoutes from './routes/turnoEstado.routes.js';
const { pathname: root } = new URL('../', import.meta.url)

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// await initDB();

app.use('/auth', authRoutes);
app.use('/shift', shiftRoutes);
app.use('/exp', exproutes);
app.use('/turno-estado', turnoEstadoRoutes);
app.get('/', (req, res) => {
    res.sendFile(root + '/index.html');
} )

export default server;
