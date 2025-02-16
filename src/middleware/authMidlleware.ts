import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IProtectMiddleware } from "../types/types"

export const protect = (roles: string[]) => {
    return (req: any, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized: Token not provided or invalid format' });
        }

        const token = authHeader.split(' ')[1]; // Extract the token

        try {
            // Decode the token using the secret key from the environment
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

            // Attach user information to the request object
            req.user = decoded;

            // Check if the user's role is in the list of allowed roles
            if (!roles.includes(decoded.role)) {
                return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
            }

            // Proceed to the next middleware or route handler if the user has the required role
            next();
        } catch (err) {
            res.status(401).json({ message: 'Token invalid' });
        }
    };
};
