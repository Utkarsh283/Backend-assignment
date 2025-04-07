const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Utility function to send consistent error responses
const sendError = (res, status, message) => {
    return res.status(status).json({ message });
};

// Register a new user
exports.register = async (req, res) => {
    try {
        const { username, fullname, email, password, role } = req.body;
        // Check if username or email is already taken
        const existingUser = await User.findOne({ $or: [ { email }, { username } ] });
        if (existingUser) {
            return sendError(res, 400, 'Username or Email already in use');
        }
        // Create and save the new user (role defaults to 'user')
        const user = new User({ username, fullname, email, password, role: role || 'user' });
        await user.save();
        // (Optionally, could auto-login the user here by generating tokens)
        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error in register:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Login user and return JWT tokens
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return sendError(res, 401, 'Invalid credentials');
        }
        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return sendError(res, 401, 'Invalid credentials');
        }
        // Generate an access token (short-lived)
        const accessToken = jwt.sign(
            { userId: user._id.toString(), role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '15m' }
        );
        // Generate a refresh token (long-lived)
        const refreshToken = jwt.sign(
            { userId: user._id.toString() },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d' }
        );
        // Save refresh token in the database (User record)
        user.refreshToken = refreshToken;
        await user.save();
        // Set refresh token as an HTTP-only cookie in response
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        // Return the access token and user info in the response
        return res.json({
            message: 'Login successful',
            accessToken,
            user: {
                id: user._id,
                username: user.username,
                fullname: user.fullname,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error in login:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Refresh access token using refresh token
exports.refresh = async (req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) {
            return sendError(res, 401, 'Refresh token not found');
        }
        const refreshToken = cookies.jwt;
        // Verify the refresh token
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                console.error('Refresh token invalid:', err);
                return sendError(res, 403, 'Invalid refresh token');
            }
            const userId = decoded.userId;
            const user = await User.findById(userId);
            if (!user || !user.refreshToken) {
                // Token is invalidated or user no longer exists
                return sendError(res, 403, 'User not found or refresh token not valid');
            }
            // Ensure the token matches the one stored (prevents reuse of old refresh tokens)
            if (user.refreshToken !== refreshToken) {
                return sendError(res, 403, 'Refresh token mismatch');
            }
            // Token is valid and matches; issue new tokens
            const newAccessToken = jwt.sign(
                { userId: user._id.toString(), role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '15m' }
            );
            const newRefreshToken = jwt.sign(
                { userId: user._id.toString() },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d' }
            );
            // Update stored refresh token to the new one (rotate token)
            user.refreshToken = newRefreshToken;
            await user.save();
            // Set the new refresh token cookie
            res.cookie('jwt', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            // Send the new access token to the client
            return res.json({ accessToken: newAccessToken });
        });
    } catch (error) {
        console.error('Error in refresh:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Logout user (invalidate refresh token)
exports.logout = async (req, res) => {
    try {
        const cookies = req.cookies;
        const refreshToken = cookies?.jwt;
        if (refreshToken) {
            // Find the user with this refresh token and remove it (logout from that session)
            const user = await User.findOne({ refreshToken });
            if (user) {
                user.refreshToken = undefined;  // or null
                await user.save();
            }
            // Clear the refresh token cookie
            res.clearCookie('jwt', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
            });
        }
        return res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error in logout:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

