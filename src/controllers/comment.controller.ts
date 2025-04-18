import { Response } from "express";
import { AuthRequest } from "../types";
import prisma from "../utils/prisma";


export const getCommentPostById = async (req: AuthRequest, res: Response) => {
    try {
        const { postId } = req.params

        const comment = await prisma.comment.findMany({
            where: {
                postId
            },
            orderBy: {
                createdAt: "desc"
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true
                    }
                }
            }
        })

        res.json({
            status: "Success",
            code: 200,
            message: "Fetching comment succesfully",
            meta: {
                timeStamp: new Date().toUTCString(),
            },
            data: comment
        })
    } catch (error) {
        console.error('Fething comment error:', error);
        res.json({
            status: "Failed",
            code: 500,
            message: "Failed to get comment",
            meta: {
                timeStamp: new Date().toUTCString()
            },
        })
    }
}

export const postComment = async (req: AuthRequest, res: Response) => {
    try {

        const { postId, content } = req.body

        // validasi user
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" })
        }

        // validasi post

        const post = await prisma.post.findUnique({
            where: {
                id: postId
            }
        })

        if (!post) {
            return res.status(404).json({ message: "Post not found" })

        }

        // create comment
        const comment = await prisma.comment.create({
            data: {
                content,
                authorId: req.user.id,
                postId
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true
                    }
                }
            }
        })

        res.json({
            status: "Success",
            code: 200,
            message: "Create comment succesfully",
            meta: {
                timeStamp: new Date().toUTCString(),
            },
            data: comment
        })

    } catch (error) {
        console.error('Create comment error:', error);
        res.json({
            status: "Failed",
            code: 500,
            message: "Failed to create comment",
            meta: {
                timeStamp: new Date().toUTCString()
            },
        })
    }
}

export const deleteComment = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params

        if (!req.user) {
            return res.status(501).json({ message: "Not authenticated" })
        }

        const comment = await prisma.comment.findUnique({
            where: {
                id
            }
        })

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" })
        }

        if (comment.authorId !== req.user.id) {
            return res.json({ message: "You not allowed delete this comment" })
        }

        await prisma.comment.delete({
            where: {
                id
            }
        })

        res.json({
            status: "Success",
            code: 200,
            message: "Delete comment succesfully",
            meta: {
                timeStamp: new Date().toUTCString(),
            },
            data: comment
        })

    } catch (error) {
        console.error('Delete comment error:', error);
        res.json({
            status: "Failed",
            code: 500,
            message: "Delete to create comment",
            meta: {
                timeStamp: new Date().toUTCString()
            },
        })
    }
}