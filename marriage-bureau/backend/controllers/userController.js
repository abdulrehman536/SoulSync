const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const normalizeGender = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value);
const normalizeCity = (value) => (typeof value === 'string' ? value.trim() : value);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const registerUser = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const normalizedName = typeof name === 'string' ? name.trim() : '';

        if (!normalizedEmail || !password || !normalizedName) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await User.create({
            name: normalizedName,
            email: normalizedEmail,
            password: hashedPassword
        });

        const token = user.isApproved
            ? jwt.sign(
                { userId: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            )
            : null;

        res.status(201).json({
            token,
            message: user.isApproved ? 'Registration successful' : 'Registration successful. Wait for admin approval before login.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isApproved: user.isApproved,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

        if (!normalizedEmail || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isAdmin && !user.isApproved) {
            return res.status(403).json({ message: 'Account pending admin approval' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isApproved: user.isApproved,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const { age, gender, city, education, bio, preferences } = req.body;
        const safeAge = Number.isFinite(Number(age)) ? Number(age) : age;
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            {
                age: safeAge,
                gender: normalizeGender(gender),
                city: normalizeCity(city),
                education,
                bio,
                preferences,
            },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const searchUsers = async (req, res) => {
    try {
        const { age, city, gender, education, preferences } = req.query;
        const filter = {
            _id: { $ne: req.user.userId },
            isApproved: true,
            isAdmin: false,
        };

        if (age) {
            filter.age = { $gte: parseInt(age) };
        }
        if (city) {
            filter.city = { $regex: `^${escapeRegex(city.trim())}$`, $options: 'i' };
        }
        if (gender) {
            filter.gender = { $regex: `^${escapeRegex(gender.trim())}$`, $options: 'i' };
        }
        if (education) {
            filter.education = { $regex: escapeRegex(education.trim()), $options: 'i' };
        }
        if (preferences) {
            filter.preferences = { $regex: escapeRegex(preferences.trim()), $options: 'i' };
        }

        const users = await User.find(filter).select('-password');
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('name email age gender city education bio preferences isAdmin isApproved createdAt');
        const payload = users.map((user) => ({
            id: user._id,
            name: user.name,
            email: user.email,
            age: user.age,
            gender: user.gender,
            city: user.city,
            education: user.education,
            bio: user.bio,
            preferences: user.preferences,
            role: user.isAdmin ? 'admin' : 'user',
            isApproved: user.isApproved,
            createdAt: user.createdAt,
        }));
        res.status(200).json(payload);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        if (updates.gender) updates.gender = normalizeGender(updates.gender);
        if (updates.city) updates.city = normalizeCity(updates.city);
        if (updates.age !== undefined) updates.age = Number.isFinite(Number(updates.age)) ? Number(updates.age) : updates.age;

        const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                gender: user.gender,
                city: user.city,
                education: user.education,
                bio: user.bio,
                preferences: user.preferences,
                isAdmin: user.isAdmin,
                isApproved: user.isApproved,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUserByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const setUserApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const { isApproved } = req.body;
        const user = await User.findByIdAndUpdate(id, { isApproved: Boolean(isApproved) }, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isApproved: user.isApproved,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    searchUsers,
    getAllUsers,
    updateUserByAdmin,
    deleteUserByAdmin,
    setUserApproval,
};


