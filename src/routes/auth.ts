import { eq, exists } from "drizzle-orm";
import { Router, Request, Response ,NextFunction} from "express";
import { db } from "../db";
import { NewUser, users } from "../db/schema";
import bcryptjs from "bcryptjs";

//ENV
import dotenv from 'dotenv';
dotenv.config(); 

import jwt from "jsonwebtoken";
import { auth, AuthRequest } from "../middleware/auth";

const authRouter = Router();


interface SignUpBody {
    name: string;
    email: string;
    password: string;  
}

interface LoginBody {
    email: string;
    password: string;
}



authRouter.post("/signup", async (req: Request<{}, {}, SignUpBody>, res: Response) => {
    try {
        
        const {name,email,password} = req.body;

        const existingUser = await db.select().from(users).where(eq(users.email, email));
        
        if (existingUser.length > 0) { 
            res.status(400).json({ msg: "User already exists" });
            return;
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        const newUser: NewUser = {
            name,
            email,
            password:hashedPassword,
        }
        const [user] = await db.insert(users).values(newUser).returning();
        res.status(201).json(user);
    } catch (e) { 
        console.error(e);
        res.status(500).json({error: e});
    }
});

authRouter.post("/login", async (req: Request<{}, {}, LoginBody>, res: Response) => {
    try {
        
        const {email,password} = req.body;

        const [existingUser] = await db.select().from(users).where(eq(users.email, email));
        
        if (!existingUser) { 
            res.status(400).json({ msg: "User Not exists" });
            return;
        }
        const isMatch = await bcryptjs.compare(password, existingUser.password);
       
        if (!isMatch) {
            res.status(400).json({ msg: "Incorrect password!" });
            return;
        }

        const token = jwt.sign({ id: existingUser.id }, process.env.JWT_SECRET!);
        res.json({ token, ...existingUser });

    } catch (e) {
        console.error(e);
        res.status(500).json({error: e});
    }
});


authRouter.post("/tokenIsValid", async (req: Request, res: Response) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) { res.json(false);return;}
        
        const verified = jwt.verify(token, process.env.JWT_SECRET!);
        if (!verified) { res.json(false); return; }

        const verifiedToken = verified as { id: string };
        const [user] = await db.select().from(users).where(eq(users.id, verifiedToken.id));
        
        if (!user) { res.json(false); return; }
        res.json(true);
        return;
        
    }
    catch {
        res.status(500).json({msg: "Invalid token" });
    }
});

authRouter.get("/", auth, async (req: AuthRequest, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ msg: "User not found" });
            return;
        }
        const [user] = await db.select().from(users).where(eq(users.id, req.user));

        res.json({ ...user, token: req.token });
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Internal server error" });
    }
});

export default authRouter;