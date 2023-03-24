import request from "supertest";
import { app } from "../../app";

it('returns a 400 if user does not exist', async () => {
    await request(app)
        .post('/api/users/signin')
        .send({
            email: "test@test.com",
            password: 'password'
        })
        .expect(400);
});

it('returns a 400 if password is wrong', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: 'password'
        })
        .expect(201);

    await request(app)
        .post('/api/users/signin')
        .send({
            email: "test@test.com",
            password: 'wrong'
        })
        .expect(400);
});

it('returns a 200 and cookie if password is correct', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: 'password'
        })
        .expect(201);

    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: "test@test.com",
            password: 'password'
        })
        .expect(200);
    
    expect(response.get('Set-Cookie')).toBeDefined();
});