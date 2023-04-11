import jwt from "jsonwebtoken";

const getAuthCookie = (email: string = 'test@test.com') => {
    const payload = {
        id: 's2342fsf',
        email
    };

    const token = jwt.sign(payload, process.env.JWT_KEY!);

    const session = { jwt: token };

    const sessionJSON = JSON.stringify(session);

    const base64 = Buffer.from(sessionJSON).toString('base64');

    return `session=${base64}`
}

export {
    getAuthCookie,
}