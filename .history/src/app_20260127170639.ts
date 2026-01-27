import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';


const app: Application = express();

// ১. Parsers
app.use(express.json());
app.use(cookieParser());
express.static('uploads');

// ২. CORS Configuration (Open to all)
app.use(
  cors({
    origin: true, // 🟢 এটা দিলে যেকোনো অরিজিন থেকেই রিকোয়েস্ট এক্সেপ্ট করবে এবং ক্রেডেনশিয়ালও কাজ করবে
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
