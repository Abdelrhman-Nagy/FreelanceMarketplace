import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dbService from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

class AuthService {
  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  // Hash password
  async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  // Verify password
  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Create user session
  async createSession(userId) {
    const sessionId = crypto.randomUUID();
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    await dbService.createUserSession({
      id: sessionId,
      userId,
      token,
      expiresAt
    });

    return { sessionId, token, expiresAt };
  }

  // Validate session
  async validateSession(token) {
    try {
      const session = await dbService.getUserSessionByToken(token);
      if (!session || session.expiresAt < new Date()) {
        return null;
      }

      const user = await dbService.getUserById(session.userId);
      if (!user || user.status !== 'active') {
        return null;
      }

      return { user, session };
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  // Delete session (logout)
  async deleteSession(token) {
    try {
      await dbService.deleteUserSession(token);
      return true;
    } catch (error) {
      console.error('Session deletion error:', error);
      return false;
    }
  }

  // Check user permissions
  async checkPermission(userId, permission, resourceType = null, resourceId = null) {
    try {
      const user = await dbService.getUserById(userId);
      if (!user) return false;

      // Admin has all permissions
      if (user.role === 'admin') return true;

      // Check specific permissions
      const userPermissions = await dbService.getUserPermissions(userId);
      
      const hasPermission = userPermissions.some(perm => 
        perm.permission === permission && 
        perm.granted &&
        (resourceType ? perm.resourceType === resourceType : true) &&
        (resourceId ? perm.resourceId === resourceId : true)
      );

      return hasPermission;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  // Role-based access control middleware
  requireRole(allowedRoles) {
    return async (req, res, next) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '') || 
                     req.cookies?.authToken;

        if (!token) {
          return res.status(401).json({ 
            status: 'error', 
            message: 'Authentication required' 
          });
        }

        const validation = await this.validateSession(token);
        if (!validation) {
          return res.status(401).json({ 
            status: 'error', 
            message: 'Invalid or expired session' 
          });
        }

        const { user } = validation;

        if (!allowedRoles.includes(user.role)) {
          return res.status(403).json({ 
            status: 'error', 
            message: 'Insufficient permissions' 
          });
        }

        req.user = user;
        req.session = validation.session;
        next();
      } catch (error) {
        console.error('Role authorization error:', error);
        res.status(500).json({ 
          status: 'error', 
          message: 'Authorization failed' 
        });
      }
    };
  }

  // Permission-based access control middleware
  requirePermission(permission, resourceType = null) {
    return async (req, res, next) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '') || 
                     req.cookies?.authToken;

        if (!token) {
          return res.status(401).json({ 
            status: 'error', 
            message: 'Authentication required' 
          });
        }

        const validation = await this.validateSession(token);
        if (!validation) {
          return res.status(401).json({ 
            status: 'error', 
            message: 'Invalid or expired session' 
          });
        }

        const { user } = validation;
        const resourceId = req.params.id || req.params.resourceId;

        const hasPermission = await this.checkPermission(
          user.id, 
          permission, 
          resourceType, 
          resourceId
        );

        if (!hasPermission) {
          return res.status(403).json({ 
            status: 'error', 
            message: 'Permission denied' 
          });
        }

        req.user = user;
        req.session = validation.session;
        next();
      } catch (error) {
        console.error('Permission authorization error:', error);
        res.status(500).json({ 
          status: 'error', 
          message: 'Authorization failed' 
        });
      }
    };
  }
}

export default new AuthService();