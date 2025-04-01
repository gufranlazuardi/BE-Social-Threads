import { Router } from "express";
import { getMe, login, register } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";


const router = Router()

router.post("/register", register)
router.post("/login", login)
router.get('/me', authenticate, getMe);

export { router as authRoutes }