import { Request, Response } from "express";
import prisma from "../utils/prisma";


export const getAllPosts = async (req: Request, res: Response) => {
    try {

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;
        const skip = (page - 1) * limit

        const post = await prisma.post.findMany({
            skip,
            take: limit,
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
                },
                _count: {
                    select: {
                        comments: true,
                        likes: true
                    }
                }
            }
        })

        const totalPosts = await prisma.post.count()
        const totalPages = Math.ceil(totalPosts / limit)

        res.json({
            status: "Success",
            code: 200,
            message: "Fetching get all post succesfully",
            meta: {
                timeStamp: new Date().toUTCString(),
                totalPages: totalPages
            },
            data: post
        })
    } catch (error) {
        console.error('Fething get all post error:', error);
        res.json({
            status: "Failed",
            code: 500,
            message: "Failed to get all post",
            meta: {
                timeStamp: new Date().toUTCString()
            },
        })
    }
}