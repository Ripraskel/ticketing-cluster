import request from "supertest";
import { app } from "../../app";

describe('Test Sign Up', () => {
    it('returns a 201 on successful signup', async () => {
        const response = await request(app)
            .post('/api/users/signup')
            .send({
                email: "test@test.com",
                password: 'password'
            });
        
        expect(response.status).toBe(201);
        expect.assertions(1);
    });
    
    it('returns a 400 with an invalid email', async () => {
        const response = await request(app)
            .post('/api/users/signup')
            .send({
                email: "testtest.com",
                password: 'password'
            });
        
        expect(response.status).toBe(400);
        expect.assertions(1);
    });
    
    it('dissallows duplicate emails', async () => {
        const response1 = await request(app)
            .post('/api/users/signup')
            .send({
                email: "test@test.com",
                password: 'password'
            });
    
    
    
        const response2 = await request(app)
            .post('/api/users/signup')
            .send({
                email: "test@test.com",
                password: 'password'
            });
        
        expect(response1.status).toBe(201);
        expect(response2.status).toBe(400);
        expect.assertions(2);
    });
    
    it('sets a cookie after successful signup', async () => {
        const response = await request(app)
            .post('/api/users/signup')
            .send({
                email: "test@test.com",
                password: 'password'
            });
        
        expect(response.get('Set-Cookie')).toBeDefined();
        expect.assertions(1);
    })
});