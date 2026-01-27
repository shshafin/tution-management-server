import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; 
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
import config from './app/config';

const app: Application = express();

// ১. Parsers
app.use(express.json());
app.use(cookieParser()); // কুকি রিড করার জন্য মাস্ট

// ২. CORS Configuration
app.use(
  cors({
    origin: [config.frontend_url as string, 'http://localhost:3000'], 
    credentials: true, 
  }),
);

// ৩. Application Routes
app.use('/api/v1', router);

// ৪. Health Check/Test Route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Tuition Management System Server is running 🚀',
  });
});

// ৫. Global Error Handler
app.use(globalErrorHandler);

// ৬. Not Found Route
app.use(notFound);

export default app;
