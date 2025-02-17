import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

export const createBooking = async (req: any, res: Response) => {
    const { propertyId, checkInDate, checkOutDate } = req.body;

    const user = req.user;

    if (!user) {
        res.status(401).json({ message: 'User not authenticated' });
        return
    }

    // Check if property is available for booking
    try {
        const existingBookings = await prisma.booking.findMany({
            where: {
                propertyId,
                status: 'Confirmed',  // Only check confirmed bookings for double booking
                OR: [
                    {
                        checkInDate: {
                            lte: new Date(checkOutDate), // Check if booking starts before the desired check-out
                        },
                        checkOutDate: {
                            gte: new Date(checkInDate), // Check if booking ends after the desired check-in
                        },
                    },
                ],
            },
        });

        // If any confirmed booking conflicts with the new booking's dates, return an error
        if (existingBookings.length > 0) {
            res.status(400).json({
                message: 'The property is not available for the selected dates.',
            });
            return
        }

        const newBooking = await prisma.booking.create({
            data: {
                userId: user.id,
                propertyId,
                checkInDate: new Date(checkInDate),
                checkOutDate: new Date(checkOutDate),
            }
        });

        res.status(201).json({
            message: 'Booking created successfully',
            data: newBooking,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking', error });
    }
};

export const getAllBookings = async (req: Request, res: Response) => {

    try {
        const bookings = await prisma.booking.findMany({
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
                property: {
                    select: {
                        title: true,
                    },
                },
            }
        });

        // Count the total number of bookings
        const total = await prisma.booking.count();
        res.status(200).json({
            message: 'bookings retrieved successfully',
            data: bookings,
            total: total,
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
}

export const updateOneBooking = async (req: any, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const user = req.user;

    if (!user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        // Find the booking by id
        const booking = await prisma.booking.findUnique({
            where: {
                id: id,
            },
        });

        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }

        // If status is being changed to 'Confirmed', check for conflicts
        if (status === 'Confirmed') {
            // Check for conflicting pending bookings for the same property
            const conflictingBookings = await prisma.booking.findMany({
                where: {
                    propertyId: booking.propertyId,
                    status: 'Pending',
                    OR: [
                        {
                            checkInDate: {
                                lte: booking.checkOutDate,
                            },
                            checkOutDate: {
                                gte: booking.checkInDate,
                            },
                        },
                    ],
                },
            });

            // Cancel conflicting pending bookings
            const updatePromises = conflictingBookings.map((conflict: any) =>
                prisma.booking.update({
                    where: {
                        id: conflict.id,
                    },
                    data: {
                        status: 'Canceled',
                    },
                })
            );
            await Promise.all(updatePromises);
        }

        // Update the booking status
        const updatedBooking = await prisma.booking.update({
            where: {
                id: id,
            },
            data: {
                status: status || booking.status,
            },
        });

        res.status(200).json({
            message: 'Booking updated successfully',
            data: updatedBooking,
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
};
