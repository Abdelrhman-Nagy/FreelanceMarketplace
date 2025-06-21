import session from 'express-session';
import dbService from './database.js';
import authService from './auth.js';

// Session middleware configuration
export const sessionConfig = session({
  secret: process.env.SESSION_SECRET || 'freelance-platform-dev-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  },
  name: 'sessionId'
});

// Session-based authentication middleware
export const requireSessionAuth = async (req, res, next) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Verify user still exists
    const user = await dbService.getUserById(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Session auth error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
};

// Login handler
export const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    const user = await dbService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    if (!user.passwordHash) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    const isPasswordValid = await authService.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Update login time
    await dbService.updateUserLoginTime(user.id);

    // Store in session with proper field mapping
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      role: user.userType,
      company: user.company,
      title: user.title,
      bio: user.bio,
      skills: user.skills ? (typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills) : [],
      hourlyRate: user.hourlyRate,
      location: user.location,
      rating: user.rating || 0,
      totalJobs: user.totalJobs || 0,
      completedJobs: user.completedJobs || 0,
      totalEarnings: user.totalEarnings || 0,
      createdAt: user.createdAt
    };

    req.session.userId = user.id;
    req.session.user = userData;

    res.json({
      status: 'success',
      message: 'Login successful',
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed'
    });
  }
};

// Logout handler
export const handleLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Logout failed'
      });
    }

    res.clearCookie('sessionId');
    res.json({
      status: 'success',
      message: 'Logout successful'
    });
  });
};

// Profile handler
export const handleProfile = async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const user = await dbService.getUserById(req.session.userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update session with fresh data using proper field mapping
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      role: user.userType,
      company: user.company,
      title: user.title,
      bio: user.bio,
      skills: user.skills ? (typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills) : [],
      hourlyRate: user.hourlyRate,
      location: user.location,
      rating: user.rating || 0,
      totalJobs: user.totalJobs || 0,
      completedJobs: user.completedJobs || 0,
      totalEarnings: user.totalEarnings || 0,
      createdAt: user.createdAt
    };

    req.session.user = userData;

    res.json({
      status: 'success',
      user: userData
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user profile'
    });
  }
};