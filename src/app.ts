import express from "express"
import cors from "cors"
import morgan from "morgan"
import { authRoutes } from "./routes/auth.route"
import { userRoutes } from "./routes/user.route"
import { postRouter } from "./routes/post.route"
import { commentRoutes } from "./routes/comment.route"


const app = express()

// middleware
app.use(express.json())
app.use(morgan('dev'))
app.use(cors())

// routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/post', postRouter)
app.use('/api/comment', commentRoutes)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
    });
});


export default app