import { Express } from "express";
import request from "supertest";

const getAuthCookie = async (app: Express, email: string) => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: 'password'
        })
        .expect(201);
    
    return response.get('Set-Cookie');
}

export {
    getAuthCookie,
}