/* eslint-disable no-console */
import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';

let server: Server;

async function bootstrap() {
  try {
    await mongoose.connect(config.db_url as string);
    console.log('✨ Database connected successfully');

    server = app.listen(config.port, () => {
      console.log(`🚀 Server is flying on port ${config.port}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to database:', err);
    process.exit(1);
  }
}

bootstrap();


process.on('uncaughtException', (error) => {
  console.error('😈 uncaughtException detected. Shutting down...', error);
  process.exit(1);
});


process.on('unhandledRejection', (error) => {
  console.error('😈 unhandledRejection detected. Shutting down...', error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});