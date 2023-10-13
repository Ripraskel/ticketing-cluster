import express, { NextFunction, Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import { param } from 'express-validator';
import { NotFoundError, validateRequest } from '@ticketing/common';

const router = express.Router();

router.get('/api/tickets/:id',
    [
        param('id').isMongoId().withMessage('Id must be valid')
    ], 
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;

            const ticket = await Ticket.findById(id);
        
            if (!ticket) {
                return next(new NotFoundError()); 
            }

            res.status(200).send(ticket);
        } catch(err) {
            next(err);
        }
    }
);

export { router as ShowTicketRouter}