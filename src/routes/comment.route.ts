import { Router } from "express";
import { deleteComment, getCommentPostById, getRepliesCommentById, postComment } from "../controllers/comment.controller";
import { authenticate } from "../middleware/auth.middleware";


const router = Router()


router.get('/post/:postId', getCommentPostById)
router.post('/', authenticate, postComment)
router.delete('/:id', authenticate, deleteComment)
router.get('/:commentId/replies', getRepliesCommentById)

export { router as commentRoutes }