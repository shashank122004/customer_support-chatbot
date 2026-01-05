import { body, validationResult } from 'express-validator';

// Validation rules for query requests
export const validateQuery = [
    body('query')
        .trim()
        .notEmpty().withMessage('Query is required')
        .isLength({ max: 500 }).withMessage('Query must not exceed 500 characters')
        .escape(), // Sanitize to prevent XSS
    
    body('history')
        .optional()
        .isArray().withMessage('History must be an array')
        .custom((value) => {
            if (value && value.length > 20) {
                throw new Error('History cannot exceed 20 messages');
            }
            return true;
        }),
    
    // Middleware to check validation results
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                response: 'Invalid request. Please check your input.',
                errors: errors.array() 
            });
        }
        next();
    }
];

// Validation for agent contact form
export const validateAgentRequest = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
        .escape(),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email')
        .normalizeEmail(),
    
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone is required')
        .matches(/^[+]?[0-9\s\-()]{10,15}$/).withMessage('Invalid phone number format'),
    
    body('category')
        .trim()
        .notEmpty().withMessage('Category is required')
        .isIn(['Product Inquiry', 'Warranty & Service', 'Delivery & Installation', 'Returns & Refunds', 'Payment Issues', 'Technical Support', 'Other'])
        .withMessage('Invalid category'),
    
    body('timeSlot')
        .trim()
        .notEmpty().withMessage('Time slot is required'),
    
    body('issue')
        .trim()
        .notEmpty().withMessage('Issue description is required')
        .isLength({ max: 1000 }).withMessage('Issue description must not exceed 1000 characters')
        .escape(),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                response: 'Invalid request data.',
                errors: errors.array() 
            });
        }
        next();
    }
];
