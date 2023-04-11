import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }
    try {
        await mongoose.connect('mongodb://ticket-mongo-srv:27017/ticket');
        console.log("connected to mongo db");
    } catch (err) {
        console.error(err)
    }
    
    app.listen(3000, () => {
        console.log(`Listerning on port ${3000}!!!!!`)
    })
};


start();