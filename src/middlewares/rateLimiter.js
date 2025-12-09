import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Limitar cada IP a 10 peticiones por ventana
  message: {
    message: 'Demasiados intentos de inicio de sesión, por favor intente nuevamente después de 15 minutos.'
  },
  standardHeaders: true, // Retorna info de rate limit en los headers `RateLimit-*`
  legacyHeaders: false, // Deshabilita los headers `X-RateLimit-*`
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 peticiones por 15 min para API general
  standardHeaders: true,
  legacyHeaders: false,
});
