import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });

        if (error) {
            res.status(500).json({ error: 'Google login failed' });
            return;
        }

        // Redirect to Google's OAuth URL
        res.redirect(data.url);
    } catch (err) {
        console.error('Google Login Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
    try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(req.query.code as string);


        if (error) {
            res.status(500).json({ error: 'Google callback failed' });
            return;
        }

        const { user } = data.session ?? {};

        if (!user) {
            res.status(401).json({ error: 'No user found' });
            return;
        }

        if (!user.email) {
            res.status(400).json({ error: 'Email not provided by Google' });
            return 
        }

        // Check if the user exists
        let existingUser = await prisma.user.findUnique({
            where: {
                googleId: user.id,
            },
        });
          
        // If user doesn't exist, create a new one
        if (!existingUser) {
            existingUser = await prisma.user.create({
                data: {
                    googleId: user.id,
                    email: user.email,
                    firstName: user.user_metadata?.given_name ?? 'Unknown',
                    lastName: user.user_metadata?.family_name ?? 'Unknown',
                },
            });
        }

        // Set a session or token (this is just an example, adapt to your needs)
        res.status(200).json({ message: 'Login successful', user: existingUser });
    } catch (err) {
        console.error('Google Callback Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};