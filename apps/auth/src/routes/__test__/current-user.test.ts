import request from "supertest";
import { app } from "../../app";
import { getAuthCookie } from "../../test/actions";

describe('Test Current User', () => {
    it('returns a null user if no valid session found', async () => {
        const response = await request(app)
            .get('/api/users/currentuser')
            .send();
    
        expect(response.status).toBe(200);
        expect(response.body.currentUser).toBeNull();
        expect.assertions(2);
    });
    
    it('returns a user with email matching session cookie', async () => {
        const cookie = await getAuthCookie(app, 'test@test.com');
    
        const response = await request(app)
            .get('/api/users/currentuser')
            .set('Cookie', cookie)
            .send();
        
        expect(response.status).toBe(200);
        expect(response.body.currentUser.email).toEqual('test@test.com');
        expect.assertions(2);
    });
});
