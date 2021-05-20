import express, { Request, Response } from 'express';

const router = express.Router();

router.post('/api/users/signup', (req: Request, res: Response) => {
    const { email, password } = req.body;

    res.json("Hi sign up")    
})

export { router as signupRouter };