import Redis from 'ioredis';
import ms from 'ms';

export class RedisService {
  private client: Redis;
  
  constructor() {
    const options = {
      retryStrategy(times: number) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 5,
      enableReadyCheck: true,
      reconnectOnError(err: Error) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      }
    };

    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', options);
    
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Successfully connected to Redis');
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