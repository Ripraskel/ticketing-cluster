import express, { Request, Response, NextFunction } from 'express';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';


import { currentUser, errorHandler, NotFoundError } from '@ticketing/common';

const app = express();

app.set('trust proxy', true);

app.use(json());
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}))
app.use(currentUser);

// Routes

app.all('*', async (req: Request, res: Response, next: NextFunction) => {
    next(new NotFoundError());
});

app.use(errorHandler);

export { app };