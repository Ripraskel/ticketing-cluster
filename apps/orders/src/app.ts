import express, { Request, Response, NextFunction } from 'express';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';


import { currentUser, errorHandler, NotFoundError } from '@ticketing/common';
import { CreateOrderRouter } from './routes/new';
import { ShowOrderRouter } from './routes/show';
import { IndexOrderRouter } from './routes';
import { CancelOrderRouter } from './routes/cancel';

const app = express();

app.set('trust proxy', true);

app.use(json());
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}))
app.use(currentUser);

// Routes
app.use(CreateOrderRouter);
app.use(ShowOrderRouter);
app.use(IndexOrderRouter);
app.use(CancelOrderRouter);

app.all('*', async (req: Request, res: Response, next: NextFunction) => {
    next(new NotFoundError());
});

app.use(errorHandler);

export { app };