// auth/auth.routes.js
import express from 'express';
import UserController from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/logout', UserController.logout);
router.get('/me', UserController.me);
router.get('/profile/:id', UserController.getProfile);
router.put('/profile/:id', UserController.updateProfile);
router.put('/change-password', UserController.changePassword);
router.delete('/delete', UserController.deleteAccount);

export default router;
