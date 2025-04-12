import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../types";
import { v2 as cloudinary } from 'cloudinary';


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

export const getPostById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params

        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true
                    }
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                name: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                },
                likes: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true
                            }
                        }
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

        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }


        res.json({
            status: "Success",
            code: 200,
            message: "Fetching post by id succesfully",
            meta: {
                timeStamp: new Date().toUTCString(),
            },
            data: post
        })

    } catch (error) {
        console.error('Fething post by id error:', error);
        res.json({
            status: "Failed",
            code: 500,
            message: "Failed to get post by id",
            meta: {
                timeStamp: new Date().toUTCString()
            },
        })
    }
}

export const createPost = async (req: AuthRequest, res: Response) => {

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_API_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        const { content } = req.body
        const file = req.file

        if (!req.user) {
            return res.status(401).json({
                status: "Failed",
                code: 401,
                message: "Not authenticated",
                meta: {
                    timeStamp: new Date().toUTCString()
                }
            });
        }

        let imageUrl = null;

        if (file) {
            const base64Image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

            try {
                const uploadResult = await cloudinary.uploader.upload(base64Image, {
                    public_id: content
                })

                imageUrl = cloudinary.url(uploadResult.public_id, {
                    fetch_format: 'auto',
                    quality: 'auto'
                })

            } catch (error) {
                console.error("Failed to upload image to Cloudinary:", error);
                return res.status(400).json({
                    status: "Failed",
                    code: 400,
                    message: "Failed to upload image",
                    meta: {
                        timeStamp: new Date().toUTCString()
                    }
                });
            }
        }

        const post = await prisma.post.create({
            data: {
                content,
                imageUrl,
                authorId: req.user.id
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
            message: "Post has been created",
            meta: {
                timeStamp: new Date().toUTCString()
            },
            data: {
                post
            }
        })

    } catch (error) {
        console.error("Failed to create post :", error)
        res.json({
            status: "Failed",
            code: 400,
            message: "Failed to create post",
            meta: {
                timeStamp: new Date().toUTCString()
            },
        })
    }
}

export const deletePost = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params
        const { content, imageUrl } = req.body

        if (!req.user) {
            return res.status(404).json({ message: "Not authenticated" })
        }

        // Check if post exists
        const post = await prisma.post.findUnique({
            where: { id }
        });

        if (!post) {
            return res.status(401).json({ message: "Post not found" })
        }

        // Check if user is the author of the post
        if (post.authorId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await prisma.post.delete({
            where: { id }
        })

        res.json({
            status: "Success",
            code: 200,
            message: "Post has been deleted",
            meta: {
                timeStamp: new Date().toUTCString()
            },
            data: {
                post
            }
        })
    } catch (error) {
        console.error("Failed to delete post :", error)
        res.json({
            status: "Failed",
            code: 400,
            message: "Failed to delete post",
            meta: {
                timeStamp: new Date().toUTCString()
            },
        })
    }
}