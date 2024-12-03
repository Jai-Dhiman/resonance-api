import { cache } from '../../middleware/cache';
import { redisService } from '../../services/RedisService';
import { Request, Response } from 'express';

jest.mock('../../services/RedisService');

describe('Cache Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      originalUrl: '/test'
    };
    mockResponse = {
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  it('should return cached data if available', async () => {
    const cachedData = { test: 'data' };
    // @ts-ignore - Mock implementation
    redisService.get.mockResolvedValue(JSON.stringify(cachedData));

    await cache('5m')(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.json).toHaveBeenCalledWith(cachedData);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should call next() if no cached data exists', async () => {
    // @ts-ignore - Mock implementation
    redisService.get.mockResolvedValue(null);

    await cache('5m')(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
  });
});