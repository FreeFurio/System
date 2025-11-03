import { createClient } from 'redis';

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      console.log('🔄 Connecting to Redis:', redisUrl.replace(/:[^:@]+@/, ':****@'));
      
      this.client = createClient({
        url: redisUrl,
        socket: {
          keepAlive: 5000,
          reconnectStrategy: (retries) => {
            if (retries > 20) {
              console.error('❌ Redis reconnection failed after 20 attempts');
              return new Error('Max retries reached');
            }
            return Math.min(retries * 100, 3000);
          },
          connectTimeout: 30000
        },
        pingInterval: 60000
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis Client Error:', err.message);
        this.isConnected = false;
      });
      
      this.client.on('connect', () => {
        console.log('✅ Redis Connected successfully');
        this.isConnected = true;
      });
      
      this.client.on('ready', () => {
        console.log('✅ Redis Ready for operations');
        this.isConnected = true;
      });

      await this.client.connect();
      console.log('✅ Redis connection established');
      this.isConnected = true;
    } catch (error) {
      console.error('❌ Redis Connection Failed:', error.message);
      console.error('❌ Redis URL format:', process.env.REDIS_URL ? 'SET' : 'NOT SET');
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.isConnected) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Redis GET Error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 300) {
    if (!this.isConnected) return false;
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('❌ Redis SET Error:', error);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('❌ Redis DEL Error:', error);
      return false;
    }
  }

  async delPattern(pattern) {
    if (!this.isConnected) return false;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('❌ Redis DEL Pattern Error:', error);
      return false;
    }
  }
}

export default new RedisService();
