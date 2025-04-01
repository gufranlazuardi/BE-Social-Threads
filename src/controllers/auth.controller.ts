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
            return res.status(400).json({ message: "Email or password is wrong" })
        }

        // check password
        const isMatched = await bcrypt.compare(password, user.password)
        if (!isMatched) {
            return res.status(400).json({ message: "Email or password is wrong" })
        }

        // created jwt token
        const token = generateToken(user.id, user.email, user.username)

        // return without passwrod
        const { password: _, ...safeUser } = user

        res.json({
            user: safeUser,
            token
        })

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
}

const generateToken = (id: string, email: string, username: string): string => {
    return jwt.sign(
        { id, email, username },
        process.env.JWT_SECRET as string,
        { expiresIn: '10d' }
    )
}