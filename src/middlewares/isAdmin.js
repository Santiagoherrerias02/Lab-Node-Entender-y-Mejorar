
import User from '../models/user.model.js';

export const isAdmin = async (req, res, next) => {
    try {
        // req.user is usually set by an authentication middleware previously
        // But the current controller just decodes the token.
        // We need to fetch the user or trust the token.
        // Let's assume we decode the token here or it was decoded in the controller?

        // Wait, the current architecture does not seem to have a global 'authenticate' middleware that attaches user to req.
        // It does it inside 'me' or 'deleteAccount'.
        // We should probably check the token here.

        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'No autenticado' });
        }

        // We need to import jwt here or trust the previous step?
        // Let's do a robust check.
        const jwt = (await import('jsonwebtoken')).default;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado. Requiere privilegios de administrador.' });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error("Admin middleware error", error);
        return res.status(401).json({ message: 'Token inválido o error de servidor' });
    }
};
