import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { PrismaClient } from '@prisma/client';
import { jwtDecode } from "jwt-decode";
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'http://localhost:5173'
            }
        });

        if (error) {
            res.status(500).json({ error: 'Google login failed' });
            return;
        }

        // Redirect to Google's OAuth URL
        res.redirect(data.url);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
    try {
        const {accessToken} = req.body;

        if (!accessToken) {
            res.status(400).json({ error: 'Access token not provided' });
            return;
        }

        const decodedToken = jwtDecode(accessToken) as any;

        if (!decodedToken || !decodedToken.email) {
            res.status(400).json({ error: 'Invalid token or email not found' });
            return;
        }

        // Extract user info from the decoded token
        const userEmail = decodedToken.email;
        const userId = decodedToken.sub; 
        const fullName = decodedToken.user_metadata.full_name || 'Unknown';
        const firstName = fullName.split(' ')[0];
        const lastName = fullName.split(' ')[1] || '';

        // Check if the user exists by email
        let existingUser = await prisma.user.findUnique({
            where: {
                email: userEmail,
            },
        });

        // If user doesn't exist, create a new one
        if (!existingUser) {
            existingUser = await prisma.user.create({
                data: {
                    googleId: userId,
                    email: userEmail,
                    firstName: firstName,
                    lastName: lastName,
                },
            });

            console.log('New user added:');
        } else {
            console.log('User already exists:');
        }

        // Create JWT Token with role and other user info
        const token = jwt.sign(
            {
                id: existingUser.id,
                email: existingUser.email,
                role: existingUser.role,   
                firstName: existingUser.firstName,
                lastName: existingUser.lastName
            },
            process.env.JWT_SECRET! as string,
            { expiresIn: '1y' }
        );

        // Send success response with token and user info
        res.status(200).json({ 
            message: 'User successfully authenticated', 
            "token":token
        });

    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};