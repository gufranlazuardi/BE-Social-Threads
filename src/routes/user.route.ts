import { Router } from "express";
import { deleteUser, getAllUsers, getUserById, udpateUser } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";


const router = Router()

router.get("/", getAllUsers)
router.get("/:id", getUserById)
router.put("/:id", authenticate, udpateUser)
router.delete("/:id", authenticate, deleteUser)

export { router as userRoutes }