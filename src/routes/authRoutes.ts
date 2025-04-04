import express from 'express';
import { googleLogin, googleCallback } from '../controllers/authController';

const router = express.Router();

router.get('/google', googleLogin);
router.post('/callback', googleCallback);

export default router;
