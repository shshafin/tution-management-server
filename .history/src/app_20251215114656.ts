import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
import csvImportRoute from './app/csvImport.route';

const app: Application = express();

// parsers
app.use(express.json());
app.use(
  cors({
    origin: [
      'http://localhost:8080',
      'https://cashtracker.marcelinestudios.com',
    ],
    credentials: true,
  }),
);

// Application Routes
app.use('/api/v1', router);


// Test Route
app.get('/', (req: Request, res: Response) => {
  res.send('Server is running successfully');
});

// global error handler
app.use(globalErrorHandler);

// not found route
app.use(notFound);

export default app;
