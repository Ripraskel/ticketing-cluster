import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import {json} from 'body-parser';
import * as OpenApiValidator from 'express-openapi-validator';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signupRouter } from './routes/signup';
import { signoutRouter } from './routes/signout';
import { getRouteError } from './routes/routeErrors';

const app = express();

app.use(cors());

app.use(json());

app.use(
    OpenApiValidator.middleware({
      apiSpec: './src/openapi.yaml',
      validateRequests: true, // (default)
      validateResponses: true
    }),
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signupRouter);
app.use(signoutRouter);

// app.use(
//   OpenApiValidator.middleware({
//     apiSpec: './src/openapi.yaml',
//     validateResponses: true
//   }),
// );

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err)
  // format error
  console.log(getRouteError(req.originalUrl));
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

app.listen(3000, () => {
    console.log(`Listerning on port ${3000}!!!!!`)
})