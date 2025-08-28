import express from 'express';
import { body, validationResult } from 'express-validator';
import { UserService } from '../services/user.js';

const router = express.Router();
const userService = new UserService();

/**
 * POST /api/user/login
 * Handle Web3Auth login - create or update user
 */
router.post('/login', [
  body('web3authUserId').notEmpty().withMessage('Web3Auth user ID is required'),
  body('walletAddress').notEmpty().withMessage('Wallet address is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').optional().isString().withMessage('Name must be a string'),
  body('avatarUrl').optional().isURL().withMessage('Avatar URL must be valid'),
  body('loginProvider').notEmpty().withMessage('Login provider is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      web3authUserId,
      walletAddress,
      email,
      name,
      avatarUrl,
      loginProvider
    } = req.body;

    console.log('🔐 User login request:', { web3authUserId, email, loginProvider });

    const result = await userService.upsertUser({
      web3authUserId,
      walletAddress,
      email,
      name,
      avatarUrl,
      loginProvider
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'User logged in successfully',
      user: result.user
    });

  } catch (error) {
    console.error('Error in POST /api/user/login:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/user/:id
 * Get user information
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('👤 Fetching user:', id);

    const result = await userService.getUser(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      user: result.user
    });

  } catch (error) {
    console.error('Error in GET /api/user/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/user/:id/profile
 * Update user profile
 */
router.put('/:id/profile', [
  body('username').optional().isString().withMessage('Username must be a string'),
  body('businessName').optional().isString().withMessage('Business name must be a string'),
  body('businessDescription').optional().isString().withMessage('Business description must be a string'),
  body('websiteUrl').optional().isURL().withMessage('Website URL must be valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { username, businessName, businessDescription, websiteUrl } = req.body;

    const result = await userService.updateProfile(id, {
      username,
      businessName,
      businessDescription,
      websiteUrl
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: result.user
    });

  } catch (error) {
    console.error('Error in PUT /api/user/:id/profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
