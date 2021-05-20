import express, { Request, Response } from 'express';

const router = express.Router();

router.post('/api/users/signout', (req: Request, res: Response) => {
    res.json("Hi signout!")
})

export { router as signoutRouter };