import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { PrismaClient } from '@prisma/client';
import { jwtDecode } from "jwt-decode";

const prisma = new PrismaClient();

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'http://localhost:5000/auth/callback'
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
        // Extract the access token from the URL
        const {accessToken} = req.body;

        if (!accessToken) {
            res.status(400).json({ error: 'Access token not provided' });
            return;
        }

        // Decode the JWT token to get user details
        const decodedToken = jwtDecode(accessToken) as any;

        if (!decodedToken || !decodedToken.email) {
            res.status(400).json({ error: 'Invalid token or email not found' });
            return;
        }

        // Extract user info from the decoded token
        const userEmail = decodedToken.email;
        const userId = decodedToken.sub; // Unique identifier for the user
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

            console.log('New user added:', existingUser);
        } else {
            console.log('User already exists:', existingUser);
        }

        // Redirect or send success response
        res.status(200).json({ message: 'User successfully authenticated', user: existingUser });

    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};