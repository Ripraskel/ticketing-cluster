import request from "supertest";
import { app } from "../../app";

describe('Test Sign Out', () => {
    it('returns cleared session cookie', async () => {
        const responseSignUp = await request(app)
            .post('/api/users/signup')
            .send({
                email: "test@test.com",
                password: 'password'
            });
    
        const responseSignOut = await request(app)
            .post('/api/users/signout')
            .send({});
        
        expect(responseSignUp.status).toBe(201);
        expect(responseSignOut.status).toBe(200);
        expect(responseSignOut.get('Set-Cookie')[0])
            .toEqual('session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly');
        expect.assertions(3);
    });
})