const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const signup = async (req, res) => {
  try {
    const { email, password, businessName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'ALREADY_EXISTS', 'Email already registered', 400);
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // For dev purposes, auto-verify email or set a token
    const emailVerifyToken = 'mock_token_' + Date.now();
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await User.create({
      email,
      password: hashedPassword,
      businessName,
      isEmailVerified: true, // Auto-verify for easy testing, change to false if email works
      emailVerifyToken,
      emailVerifyExpires,
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return successResponse(res, userResponse, 'User registered successfully. Please verify your email.', 201);
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 'INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    if (!user.isEmailVerified) {
      return errorResponse(res, 'EMAIL_NOT_VERIFIED', 'Please verify your email first', 401);
    }

    // Generate Tokens
    const accessToken = jwt.sign(
      {
        userId: user._id,
        plan: user.plan,
        teamId: user.teamId,
        role: user.role,
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES }
    );

    // Set Cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const userResponse = {
      _id: user._id,
      email: user.email,
      businessName: user.businessName,
      plan: user.plan,
      role: user.role,
    };

    return successResponse(res, { user: userResponse }, 'Login successful');
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const logout = async (req, res) => {
  res.cookie('accessToken', '', { maxAge: 0 });
  res.cookie('refreshToken', '', { maxAge: 0 });
  return successResponse(res, null, 'Logged out successfully');
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return errorResponse(res, 'NOT_FOUND', 'User not found', 404);
    }
    return successResponse(res, user);
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      emailVerifyToken: token,
      emailVerifyExpires: { $gt: Date.now() },
    });

    if (!user) {
      return errorResponse(res, 'INVALID_TOKEN', 'Token invalid or expired', 400);
    }

    user.isEmailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    await user.save();

    return successResponse(res, null, 'Email verified successfully');
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

const updateOnboarding = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return errorResponse(res, 'NOT_FOUND', 'User not found', 404);
    }

    return successResponse(res, user, 'Onboarding data updated');
  } catch (error) {
    return errorResponse(res, 'SERVER_ERROR', error.message, 500);
  }
};

module.exports = {
  signup,
  login,
  logout,
  me,
  verifyEmail,
  updateOnboarding,
};
