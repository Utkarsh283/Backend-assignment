const User = require('../models/User');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password -refreshToken').exec();
        return res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId, '-password -refreshToken').exec();
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get current user's profile
exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId, '-password -refreshToken').exec();
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Create new user
exports.createUser = async (req, res) => {
    try {
        const { username, fullname, email, password, role } = req.body;
        if (!username || !fullname || !email || !password) {
            return res.status(400).json({ message: 'Required fields: username, fullname, email, password' });
        }
        const existingUser = await User.findOne({ $or: [ { email }, { username } ] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or Email already in use' });
        }
        const newUser = new User({ username, fullname, email, password, role: role || 'user' });
        await newUser.save();
        return res.status(201).json({ message: 'User created', user: { 
            id: newUser._id,
            username: newUser.username,
            fullname: newUser.fullname,
            email: newUser.email,
            role: newUser.role
        }});
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Username or Email already in use' });
        }
        return res.status(500).json({ message: 'Server error' });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { username, fullname, email, password, role } = req.body;
        const user = await User.findById(userId).exec();
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (req.user.role !== 'admin' && role) delete req.body.role;
        if (username) user.username = username;
        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (password) user.password = password;
        if (req.user.role === 'admin' && role) user.role = role;
        await user.save();
        return res.json({ message: 'User updated', user: {
            id: user._id,
            username: user.username,
            fullname: user.fullname,
            email: user.email,
            role: user.role
        }});
    } catch (error) {
        console.error('Error updating user:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Username or Email already in use' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Server error' });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).exec();
        if (!user) return res.status(404).json({ message: 'User not found' });
        await user.deleteOne();
        return res.json({ message: 'User deleted' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

