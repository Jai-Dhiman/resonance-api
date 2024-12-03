import Redis from 'ioredis';
import ms from 'ms';

export class RedisService {
  private client: Redis;
  
  constructor() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: string | number): Promise<void> {
    if (ttl) {
      const ttlMs = typeof ttl === 'string' ? ms(ttl) : ttl;
      await this.client.set(key, value, 'PX', ttlMs);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}

export const redisService = new RedisService();