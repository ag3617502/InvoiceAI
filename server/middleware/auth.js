const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

const auth = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken && !refreshToken) {
    return errorResponse(res, 'UNAUTHORIZED', 'Authentication required', 401);
  }

  try {
    if (accessToken) {
      const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
      req.user = decoded;
      return next();
    }
  } catch (error) {
    // Access token expired or invalid, try refresh token
    if (error.name !== 'TokenExpiredError' && !refreshToken) {
      return errorResponse(res, 'UNAUTHORIZED', 'Invalid access token', 401);
    }
  }

  // Try refresh token if access token is missing or expired
  if (refreshToken) {
    try {
      const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decodedRefresh.userId);

      if (!user) {
        return errorResponse(res, 'UNAUTHORIZED', 'User not found', 401);
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        {
          userId: user._id,
          plan: user.plan,
          teamId: user.teamId,
          role: user.role,
        },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES }
      );

      // Set new access token cookie
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 mins
      });

      req.user = {
        userId: user._id,
        plan: user.plan,
        teamId: user.teamId,
        role: user.role,
      };

      return next();
    } catch (refreshError) {
      return errorResponse(res, 'UNAUTHORIZED', 'Session expired, please login again', 401);
    }
  }

  return errorResponse(res, 'UNAUTHORIZED', 'Authentication required', 401);
};

module.exports = auth;
