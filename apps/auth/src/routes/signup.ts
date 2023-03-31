import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { User } from '../models/user';
import { BadRequestError, validateRequest } from '@ticketing/common';

const router = express.Router();

router.post('/api/users/signup', 
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .isLength({ min: 5, max: 20})
            .withMessage('Password must be between 5 and 20 characters long')
    ], 
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;
            
            const existingUser = await User.findOne({email});
            if (existingUser) {
                return next(new BadRequestError("User already exists"));
            }

            const user = User.build({email, password});
            await user.save();

            // Generat Json Web Token
            const userJwt = jwt.sign(
                {
                    id: user.id,
                    email: user.email
                },
                process.env.JWT_KEY!
            );

            // Append JWT to cookie session
            req.session = {
                jwt: userJwt
            }

            res.status(201).send(user); 
        } catch (err) {
            next(err);
        }
         
    }
)

export { router as signupRouter };