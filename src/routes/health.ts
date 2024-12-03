import { Router } from 'express';
import { cache } from '../middleware/cache';
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

router.get('/cache-test', cache('1m'), (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    random: Math.random()
  });
});

export { router as healthRouter };