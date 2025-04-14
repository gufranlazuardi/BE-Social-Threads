import { Response } from "express";
import { AuthRequest } from "../types";
import prisma from "../utils/prisma";
import bcrypt from "bcryptjs"

export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                bio: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        posts: true,
                        followers: true,
                        following: true
                    }
                }
            }
        })

        res.json({
            status: "Success",
            code: 200,
            message: "Get all users success",
            meta: {
                timeStamp: new Date().toUTCString()
            },
            data: users
        })

    } catch (error) {
        console.error("Error to get all users", error)
        res.status(500).json({
            status: "Failed",
            code: 500,
            message: "Failed to get all users",
            meta: {
                timeStamp: new Date().toUTCString()
            },
        })
    }
}

export const getUserById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                bio: true,
                username: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        posts: true,
                        followers: true,
                        following: true
                    }
                }
            }
        })

        if (!user) {
            res.status(404).json({ message: "User not found" })
        }

        res.json({
            status: "Success",
            code: 200,
            message: "Success get user by id",
            meta: {
                timestamp: new Date().toUTCString()
            },
            data: user
        })
    } catch (error) {
        console.error("Failed to get user by id", error)
        res.status(500).json({ message: "Failed to get user by id" })
    }
}

export const udpateUser = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params
        const { username, name, bio, password } = req.body

        const user = await prisma.user.findUnique({
            where: { id }
        })

        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        if (req.user?.id !== id) {
            return res.status(400).json({ message: "Not authorize to update this user" })
        }

        // update
        const updateUserData: any = {}

        if (password) {
            updateUserData.password = await bcrypt.hash(password, 10)
        }

        if (username) {
            updateUserData.username = username
        }

        if (name) {
            updateUserData.name = name
        }

        if (bio) {
            updateUserData.bio = bio
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateUserData,
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                bio: true,
                createdAt: true,
                updatedAt: true
            }
        })

        res.json({
            status: "Success",
            code: 200,
            message: "Updated user success",
            meta: {
                timestamp: new Date().toUTCString()
            },
            data: updatedUser
        })

    } catch (error) {
        console.error("Update user error: ", error)
        res.status(500).json({ message: "Failed to update user" })
    }
}

export const deleteUser = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params

        const user = await prisma.user.delete({
            where: { id }
        })

        res.json({
            status: "Success",
            code: 200,
            message: "User has been deleted",
            meta: {
                timestamp: new Date().toUTCString()
            },
            data: user
        })
    } catch (error) {
        console.error("Error to delete user :", error)
        res.status(500).json({ message: "Failed to delete user" })
    }
}