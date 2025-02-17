import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createProperty = async (req: any, res: Response) => {
    const { title, description, pricePerNight, location } = req.body;

    const user = req.user;

    if (!user) {
        res.status(401).json({ message: 'user not authenticated' })
        return
    }

    // Check if required fields are provided
    if (!title || !description || !pricePerNight || !location) {
        res.status(400).json({ error: 'Title, description, pricePerNight and location are required.' });
        return
    }

    try {
        const newProperty = await prisma.property.create({
            data: {
                title,
                propertyImage: req.file?.path || null,
                description,
                pricePerNight: parseFloat(pricePerNight),
                location,
                hostName: user.firstName + " " + user.lastName,
                hostId: user.id
            }
        });
        // Return a success message with the newly created Property
        res.status(200).json({
            message: 'Property created successfully',
            data: newProperty
        })

    } catch (error) {
        throw error
    }
}

export const getAllProperty =  async (req: Request, res: Response) => {

    try {
        const properties = await prisma.property.findMany();

        // Count the total number of properties
        const total = await prisma.property.count();
        res.status(200).json({
            message: 'Properties retrieved successfully',
            data: properties,
            total: total,
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
}

export const getOneProperty =  async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const property = await prisma.property.findUnique({
            where: {
                id: id,  
            }
        });

        if(!property){
            res.status(404).json({message:'property not found'})
            return
        }
        
        res.status(200).json({
            message: 'property retrieved successfully',
            data: property
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
}

export const updateOneProperty = async (req: any, res: Response) => {
    const { id } = req.params;
    const { title, description, pricePerNight, location } = req.body;

    const user = req.user;

    if (!user) {
        res.status(401).json({ message: 'User not authenticated' });
        return 
    }

    try {
        // Find the property by id
        const property = await prisma.property.findUnique({
            where: {
                id: id,  
            }
        });

        if (!property) {
            res.status(404).json({ message: 'Property not found' });
            return
        }

        // Update property fields
        const updatedProperty = await prisma.property.update({
            where: {
                id: id,  
            },
            data: {
                title: title || property.title,
                description: description || property.description,
                pricePerNight: pricePerNight || property.pricePerNight,
                location: location || property.location,
                propertyImage: req.file?.path || property.propertyImage
            },
        });

        res.status(200).json({
            message: 'Property updated successfully',
            data: updatedProperty,
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
};


export const deleteProperty = async (req: any, res:Response) =>{
    const { id } = req.params;

    try {
        const property = await prisma.property.delete({
            where: {
                id: id
            }
        });

        if(!property){
            res.status(404).json({message:'property not found'});
            return
        }

        res.status(200).json({ message: 'Property deleted successfully' });
        return

    } catch (error) {
        throw error
    }
}