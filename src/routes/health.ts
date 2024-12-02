import { Router } from 'express';
import pool from '../db';

const router = Router();

router.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/db-test', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      dbConnection: true,
      timestamp: result.rows[0].now
    });
  } catch (error) {
    next(error);
  }
});

router.get('/error-test', () => {
  throw new Error('Test error handling');
});

export { router as healthRouter };