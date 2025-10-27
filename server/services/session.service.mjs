import redisService from './redis.service.mjs';
import crypto from 'crypto';

class SessionService {
  // Generate unique session ID
  generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Create new session
  async createSession(userId, userData, expiresIn = 3600) {
    const sessionId = this.generateSessionId();
    const sessionData = {
      userId,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profilePicture: userData.profilePicture || null,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    await redisService.set(`session:${sessionId}`, sessionData, expiresIn);
    
    // Also store user's active sessions (for multi-device support)
    await this.addUserSession(userId, sessionId, expiresIn);
    
    console.log(`✅ Session created: ${sessionId} for user: ${userId}`);
    return sessionId;
  }

  // Get session data
  async getSession(sessionId) {
    const session = await redisService.get(`session:${sessionId}`);
    if (session) {
      // Update last activity
      session.lastActivity = new Date().toISOString();
      await redisService.set(`session:${sessionId}`, session, 3600);
    }
    return session;
  }

  // Validate session
  async validateSession(sessionId) {
    const session = await this.getSession(sessionId);
    return session !== null;
  }

  // Destroy session (logout)
  async destroySession(sessionId) {
    const session = await redisService.get(`session:${sessionId}`);
    if (session) {
      await this.removeUserSession(session.userId, sessionId);
      await redisService.del(`session:${sessionId}`);
      console.log(`✅ Session destroyed: ${sessionId}`);
      return true;
    }
    return false;
  }

  // Add session to user's active sessions list
  async addUserSession(userId, sessionId, expiresIn) {
    const userSessionsKey = `user:sessions:${userId}`;
    const sessions = await redisService.get(userSessionsKey) || [];
    sessions.push({
      sessionId,
      createdAt: new Date().toISOString()
    });
    await redisService.set(userSessionsKey, sessions, expiresIn);
  }

  // Remove session from user's active sessions
  async removeUserSession(userId, sessionId) {
    const userSessionsKey = `user:sessions:${userId}`;
    const sessions = await redisService.get(userSessionsKey) || [];
    const filtered = sessions.filter(s => s.sessionId !== sessionId);
    if (filtered.length > 0) {
      await redisService.set(userSessionsKey, filtered, 3600);
    } else {
      await redisService.del(userSessionsKey);
    }
  }

  // Get all active sessions for a user
  async getUserSessions(userId) {
    const userSessionsKey = `user:sessions:${userId}`;
    return await redisService.get(userSessionsKey) || [];
  }

  // Destroy all sessions for a user (logout from all devices)
  async destroyAllUserSessions(userId) {
    const sessions = await this.getUserSessions(userId);
    for (const session of sessions) {
      await redisService.del(`session:${session.sessionId}`);
    }
    await redisService.del(`user:sessions:${userId}`);
    console.log(`✅ All sessions destroyed for user: ${userId}`);
  }

  // Extend session expiration
  async extendSession(sessionId, expiresIn = 3600) {
    const session = await redisService.get(`session:${sessionId}`);
    if (session) {
      await redisService.set(`session:${sessionId}`, session, expiresIn);
      return true;
    }
    return false;
  }

  // Get active sessions count
  async getActiveSessionsCount() {
    // This would require scanning Redis keys, which is expensive
    // Better to track this separately if needed
    return null;
  }
}

export default new SessionService();
