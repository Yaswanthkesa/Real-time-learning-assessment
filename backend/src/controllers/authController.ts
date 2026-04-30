import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';

// Generate JWT token
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  
  return jwt.sign({ id: userId }, secret, { expiresIn } as jwt.SignOptions);
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, role',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
      return;
    }

    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
      return;
    }

    // Validate role
    if (role !== 'teacher' && role !== 'student') {
      res.status(400).json({
        success: false,
        message: 'Role must be either teacher or student',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        bio: user.bio,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Check if user has a password (not a Google OAuth user)
    if (!user.password) {
      res.status(401).json({
        success: false,
        message: 'This account uses Google Sign-In. Please use the "Sign in with Google" button.',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        bio: user.bio,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // User ID is attached to request by auth middleware
    const userId = (req as any).user.id;

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as any;

    if (!user) {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`);
      return;
    }

    // Generate JWT token
    const token = generateToken(user._id.toString());

    // Check if user needs to select role (first-time Google user)
    const needsRoleSelection = !user.role || user.role === 'student'; // Default is student, might need to change

    // Redirect to frontend with token
    if (needsRoleSelection) {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/select-role?token=${token}`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth-success?token=${token}`);
    }
  } catch (error: any) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=server_error`);
  }
};

// @desc    Update user role (for first-time Google OAuth users)
// @route   PUT /api/auth/role
// @access  Private
export const updateRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { role } = req.body;

    // Validate role
    if (role !== 'teacher' && role !== 'student') {
      res.status(400).json({
        success: false,
        message: 'Role must be either teacher or student',
      });
      return;
    }

    // Update user role
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        bio: user.bio,
      },
    });
  } catch (error: any) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { name, bio, profilePicture } = req.body;

    // Build update object with only provided fields
    const updateFields: any = {};
    
    if (name !== undefined) {
      // Validate name length
      if (name.trim().length < 2) {
        res.status(400).json({
          success: false,
          message: 'Name must be at least 2 characters long',
        });
        return;
      }
      updateFields.name = name.trim();
    }

    if (bio !== undefined) {
      // Validate bio length (max 500 characters)
      if (bio.length > 500) {
        res.status(400).json({
          success: false,
          message: 'Bio must not exceed 500 characters',
        });
        return;
      }
      updateFields.bio = bio;
    }

    if (profilePicture !== undefined) {
      // Validate profile picture URL format (basic validation)
      if (profilePicture && profilePicture.length > 0) {
        const urlRegex = /^(https?:\/\/)|(data:image\/(jpeg|jpg|png);base64,)/;
        if (!urlRegex.test(profilePicture)) {
          res.status(400).json({
            success: false,
            message: 'Profile picture must be a valid URL or base64 image (JPEG/PNG)',
          });
          return;
        }
      }
      updateFields.profilePicture = profilePicture;
    }

    // Check if there are fields to update
    if (Object.keys(updateFields).length === 0) {
      res.status(400).json({
        success: false,
        message: 'No fields provided for update',
      });
      return;
    }

    // Update user profile
    const user = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        bio: user.bio,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
