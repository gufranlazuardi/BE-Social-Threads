import { Router } from "express";
import { createPost, deletePost, getAllPosts, getPostById } from "../controllers/post.controller";
import { authenticate } from "../middleware/auth.middleware";
import { upload } from "../middleware/multer.middleware";


const router = Router()

router.get("/", getAllPosts)
router.get("/:id", getPostById)
router.post("/", authenticate, upload.single('image'), createPost)
router.delete("/:id", authenticate, deletePost)

export { router as postRouter }