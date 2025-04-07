const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the User schema with fields and validation
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    fullname: { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ['user', 'admin'], default: 'user' },
    refreshToken: { type: String }  // Store the refresh token for the user (latest valid token)
}, { timestamps: true });

// Pre-save hook to hash password if it has been modified (or on user creation)
userSchema.pre('save', async function(next) {
    try {
        if (!this.isModified('password')) return next();
        // Hash the password with a salt round of 10
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare entered password with the hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Optional: hide sensitive fields (password, refreshToken) when converting to JSON
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.refreshToken;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
