import request from "supertest";
import { app } from "../../app";

describe('Test Sign In', () => {
    it('returns a 400 if user does not exist', async () => {
        const response = await request(app)
            .post('/api/users/signin')
            .send({
                email: "test@test.com",
                password: 'password'
            });
        
        expect(response.status).toBe(400);
        expect.assertions(1);
    });
    
    it('returns a 400 if password is wrong', async () => {
        const responseSignUp = await request(app)
            .post('/api/users/signup')
            .send({
                email: "test@test.com",
                password: 'password'
            });
    
        const responseSignIn = await request(app)
            .post('/api/users/signin')
            .send({
                email: "test@test.com",
                password: 'wrong'
            });
        
        expect(responseSignUp.status).toBe(201);
        expect(responseSignIn.status).toBe(400);
        expect.assertions(2);
    });
    
    it('returns a 200 and cookie if password is correct', async () => {
        const responseSignUp = await request(app)
            .post('/api/users/signup')
            .send({
                email: "test@test.com",
                password: 'password'
            });
    
        const responseSignIn = await request(app)
            .post('/api/users/signin')
            .send({
                email: "test@test.com",
                password: 'password'
            });
        
        expect(responseSignUp.status).toBe(201);
        expect(responseSignIn.status).toBe(200);
        expect(responseSignIn.get('Set-Cookie')).toBeDefined();
        expect.assertions(3);
    });
})