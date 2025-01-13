import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import { db } from "../db";
import { UUID } from "crypto";

export interface AuthRequest extends Request {
    user?: UUID; // 假设 UUID 是字符串类型
    token?: string;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) {
            res.status(401).json({ msg: "No auth token, access denied" });
            return;
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET!);
        if (!verified) {
            res.status(401).json({ msg: "Token verification failed" });
            return;
        }

        const verifiedToken = verified as { id: UUID };
        const [user] = await db.select().from(users).where(eq(users.id, verifiedToken.id));
        
        if (!user) {
            res.status(401).json({ msg: "User not found" });
            return ;
        }

        req.user = verifiedToken.id;
        req.token = token;

        next();

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: error });
        return;
    }
};
