const jwt = require('jsonwebtoken');

// Middleware to verify access token and attach user info to request
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];  // Expect "Bearer <token>"
    if (!token) {
        return res.status(401).json({ message: 'Access token missing' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        // Token is valid; attach user info to request
        req.user = { id: decoded.userId, role: decoded.role };
        next();
    });
};

// Middleware to require admin role
exports.requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    next();
};

// Middleware to require that the requester is the user themselves or an admin
exports.requireSelfOrAdmin = (req, res, next) => {
    if (req.user.role === 'admin') {
        return next();
    }
    if (req.user.id !== req.params.id) {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};
