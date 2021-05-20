import {HttpError} from 'http-errors';
export const getRouteError = (url: string):HttpError =>  {
    let urlError: HttpError = {} as HttpError;
    console.log({url})
    switch (url) {
        case "/api/users/signin":
            urlError.status = 500;
            urlError.message = 'Failed to signin'
            break;
        default:
            break;
    }

    return urlError;
}