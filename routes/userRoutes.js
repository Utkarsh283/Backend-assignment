const express = require('express');
const { body, validationResult } = require('express-validator');
const userController = require('../controllers/userController');
const { verifyToken, requireAdmin, requireSelfOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.use(verifyToken);

router.get('/', requireAdmin, userController.getAllUsers);
router.get('/me', userController.getMyProfile);
router.get('/:id', requireSelfOrAdmin, userController.getUserById);

router.post('/', [
    requireAdmin,
    body('username').notEmpty().withMessage('Username is required'),
    body('fullname').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Role must be either user or admin'),
    validate
], userController.createUser);

router.put('/:id', [
    requireSelfOrAdmin,
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('username').optional().notEmpty().withMessage('Username cannot be empty'),
    body('fullname').optional().notEmpty().withMessage('Full name cannot be empty'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Role must be either user or admin'),
    validate
], userController.updateUser);

router.delete('/:id', requireSelfOrAdmin, userController.deleteUser);

module.exports = router;

