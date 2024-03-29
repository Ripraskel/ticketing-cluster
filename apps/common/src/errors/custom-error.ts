interface ISerializedError {
    message: string,
    field?: string
}
export abstract class CustomError extends Error {
    abstract statusCode: number

    constructor(message: string) {
        super(message);

        // only because we are extending a built in class
        Object.setPrototypeOf(this, CustomError.prototype);
    }

    abstract serializeErrors(): ISerializedError[]
}