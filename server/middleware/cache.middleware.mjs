import redisService from '../services/redis.service.mjs';

export const cacheMiddleware = (keyPrefix, ttl = 300) => {
  return async (req, res, next) => {
    if (req.query.refresh) {
      return next();
    }

    const cacheKey = `${keyPrefix}:${req.params.accountId || 'all'}`;
    const cached = await redisService.get(cacheKey);

    if (cached) {
      console.log(`✅ Cache hit: ${cacheKey}`);
      return res.json({
        ...cached,
        cached: true
      });
    }

    res.locals.cacheKey = cacheKey;
    res.locals.cacheTTL = ttl;
    next();
  };
};

export const setCacheResponse = async (res, data) => {
  if (res.locals.cacheKey) {
    await redisService.set(res.locals.cacheKey, data, res.locals.cacheTTL);
  }
};
