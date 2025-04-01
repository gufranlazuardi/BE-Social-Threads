import { NextFunction, Response } from "express";
import { AuthRequest } from "../types";
import jwt from "jsonwebtoken"


export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Access denied, no token provided" })
        }

        // Get token without bearer
        const token = authHeader.split(' ')[1];

        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            id: string
            email: string
            username: string
        }

        // add user data to request
        req.user = decoded;

        next()

    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
}