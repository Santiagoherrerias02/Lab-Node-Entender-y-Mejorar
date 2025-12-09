import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { apiLimiter } from './middlewares/rateLimiter.js';
// import { initDB } from './initDB.js';
import authRoutes from './routes/auth.routes.js';
import shiftRoutes from './routes/shift.routes.js';
import exproutes from './routes/experiment.routes.js'
import turnoEstadoRoutes from './routes/turnoEstado.routes.js';
const { pathname: root } = new URL('../', import.meta.url)

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(apiLimiter); // Global rate limiter for API

app.use(express.static('public')); // Serve static assets (CSS, JS)

// await initDB();

app.use('/auth', authRoutes);
app.use('/shift', shiftRoutes);
app.use('/exp', exproutes);
app.use('/turno-estado', turnoEstadoRoutes);
app.get('/', (req, res) => {
    // Serve from public now
    // res.sendFile(root + '/public/index.html'); // Express static handles '/' if index.html is in public
    // But since we had a custom handler, let's defer to static middleware or explicit send
    res.sendFile(root + 'public/index.html');
} )

export default server;
