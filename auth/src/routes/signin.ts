import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { BadRequestError } from '../errors/bad-request-error';
import { validateRequest } from '../middleware/validate-request';
import { User } from '../models/user';
import { Password } from '../services/password';

const router = express.Router();

router.post('/api/users/signin',
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('Password must be provided')
    ],
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;
            
            const existingUser = await User.findOne({email});
            if(!existingUser) {
                throw new BadRequestError("Invalid credentials");
            }

            const passwordMatch = await Password.compare(existingUser.password, password);

            if (!passwordMatch) {
                throw new BadRequestError("Invalid credentials");
            }

            // Generat Json Web Token
            const userJwt = jwt.sign(
                {
                    id: existingUser.id,
                    email: existingUser.email
                },
                process.env.JWT_KEY!
            );

            // Append JWT to cookie session
            req.session = {
                jwt: userJwt
            }

            res.status(201).send(existingUser);
        } catch(err) {
            next(err)
        }

    }
);

export { router as signinRouter };