import { Request, Response } from "express";
import prisma from "../utils/prisma";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types";



export const register = async (req: Request, res: Response) => {
    try {
        const { email, username, password, name } = req.body

        // check if user have been registered before
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email }, { username }
                ]
            }
        })

        if (existingUser) {
            return res.status(401).json({ message: "Email or Username already exist" })
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // create user
        const user = await prisma.user.create({
            data: {
                email, password: hashedPassword, username, name
            }
        })

        // create jwt token
        const token = generateToken(user.id, user.email, user.username)

        // return user without password
        const { password: _, ...safeuser } = user

        res.status(201).json({
            user: { safeuser },
            token
        })

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
}

export const login = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password } = req.body

        // find user by email
        const user = await prisma.user.findFirst({
            where: { email }
        })

        if (!user) {
            return res.status(400).json({
                status: "Failed",
                code: 400,
                message: "Invalid email or password",
                meta: {
                    timestamp: new Date().toISOString()
                }
            });
        }

        // check password
        const isMatched = await bcrypt.compare(password, user.password)
        if (!isMatched) {
            return res.status(400).json({
                status: "Failed",
                code: 400,
                message: "Invalid email or password",
                meta: {
                    timestamp: new Date().toISOString()
                }
            });
        }

        // created jwt token
        const token = generateToken(user.id, user.email, user.username)

        // return without passwrod
        const { password: _, ...safeUser } = user

        res.json({
            status: "Success",
            code: 200,
            message: "Login succesfully",
            meta: {
                timeStamp: new Date().toUTCString()
            },
            data: safeUser, token
        })

    } catch (error) {
        console.error('Login error:', error);
        res.json({
            status: "Failed",
            code: 500,
            message: "Failed to login",
            meta: {
                timeStamp: new Date().toUTCString()
            },
        })
    }
}

// Get current user
export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return user without password
        const { password, ...safeUser } = user;

        res.status(200).json({
            status: "Success",
            code: 200,
            message: "Successfully get current user",
            meta: {
                timeStamp: new Date().toUTCString()
            },
            data: safeUser
        })
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const generateToken = (id: string, email: string, username: string): string => {
    return jwt.sign(
        { id, email, username },
        process.env.JWT_SECRET as string,
        { expiresIn: '10d' }
    )
}