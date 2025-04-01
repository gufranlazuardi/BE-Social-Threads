import { User } from "@prisma/client";
import { Request } from "express";

// Extend Express Request to include user property
export interface AuthRequest extends Request {
    user?: {
        id: string
        email: string
        username: string
    }
}

// Omit password from user object when returning to client
export type SafeUser = Omit<User, 'password'>