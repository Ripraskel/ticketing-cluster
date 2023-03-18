import { CustomError } from "./custom-error";

export class NotAuthorisedError extends CustomError {
    statusCode = 401;

    constructor() {
        super('Not Authorised');

        // only because we are extending a built in class
        Object.setPrototypeOf(this, NotAuthorisedError.prototype);
    }

    serializeErrors() {
        return [{ message: this.message }]
    }
}