import express from 'express'
import activateController from './controllers/activate-controller'
import authController from './controllers/auth-controller'
import authMiddleware from './middlewares/auth-middleware'

const router = express.Router()
router.post('/api/send-otp', authController.sendOtp)
router.post('/api/verify-otp', authController.verifyOtp)
router.post('/api/activate', authMiddleware, activateController.activate)
router.get('/api/refresh', authController.refresh)
export default router
