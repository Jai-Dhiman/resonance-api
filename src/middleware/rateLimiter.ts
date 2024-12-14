import { Request, Response, NextFunction } from 'express';
import { redisService } from '../services/RedisService';

export const rateLimiter = (requests: number, window: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const key = `ratelimit:${ip}`;
    
    try {
      const current = await redisService.get(key);
      const count = current ? parseInt(current) : 0;
      
      if (count >= requests) {
        return res.status(429).json({
          error: 'Too many requests, please try again later'
        });
      }
      
      await redisService.set(key, (count + 1).toString(), window);
      next();
    } catch (error) {
      next(error);
    }
  };
};