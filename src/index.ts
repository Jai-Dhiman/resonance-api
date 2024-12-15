import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { routes } from './routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: [ process.env.FRONTEND_URL || 'http://localhost:3000', 'https://artistanalytics.up.railway.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});