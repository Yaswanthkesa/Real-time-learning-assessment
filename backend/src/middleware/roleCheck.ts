import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

// @desc    Check if user has teacher role
export const requireTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reqUser = (req as any).user;
    
    if (!reqUser || !reqUser.id) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    // Fetch user to get role
    const user = await User.findById(reqUser.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (user.role !== 'teacher') {
      res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.',
      });
      return;
    }

    // Attach role to request for future use
    reqUser.role = user.role;
    next();
  } catch (error: any) {
    console.error('Role check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Check if user has student role
export const requireStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reqUser = (req as any).user;
    
    if (!reqUser || !reqUser.id) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    // Fetch user to get role
    const user = await User.findById(reqUser.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (user.role !== 'student') {
      res.status(403).json({
        success: false,
        message: 'Access denied. Student role required.',
      });
      return;
    }

    // Attach role to request for future use
    reqUser.role = user.role;
    next();
  } catch (error: any) {
    console.error('Role check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
