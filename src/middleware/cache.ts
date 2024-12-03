import { Request, Response, NextFunction } from 'express';
import { redisService } from '../services/RedisService';

export const cache = (ttl: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cacheKey = `cache:${req.originalUrl}`;
      const cachedData = await redisService.get(cacheKey);

      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      const originalJson = res.json.bind(res);
      res.json = ((data: any) => {
        redisService.set(cacheKey, JSON.stringify(data), ttl);
        return originalJson(data);
      }) as any;

      next();
    } catch (error) {
      next(error);
    }
  };
};