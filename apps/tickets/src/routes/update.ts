import express, { NextFunction, Request, Response } from 'express';
import { body, param } from 'express-validator';
import { NotAuthorisedError, NotFoundError, requireAuth, validateRequest } from '@ticketing/common';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.put('/api/tickets/:id', requireAuth, [
    param('id').isMongoId().withMessage('Id must be valid'),
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0')
], validateRequest, 
async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const { title, price } = req.body;
    
        const ticket = await Ticket.findById(id);
        
        if (!ticket) {
            return next(new NotFoundError()); 
        }

        if (ticket.userId !== req.currentUser?.id) {
            return next(new NotAuthorisedError()); 
        }

        ticket.set({title, price});
        await ticket.save();
    
        res.status(201).send(ticket);
    } catch (err) {
        next(err);
    }
});

export { router as UpdateTicketRouter}