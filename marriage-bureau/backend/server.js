const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const dns= require("dns");
const interestRoutes = require('./routes/interestRoutes');
const messageRoutes = require('./routes/messageRoutes');
const User = require('./models/User');

dns.setServers(["1.1.1.1","8.8.8.8"]);

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/messages', messageRoutes);

const ensureDefaultAdmin = async () => {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@soulsync.local';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@12345';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
        if (!existingAdmin.isAdmin) {
            existingAdmin.isAdmin = true;
            existingAdmin.isApproved = true;
            await existingAdmin.save();
        }
        return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
        isApproved: true,
    });

    console.log(`Default admin ready: ${adminEmail}`);
};

connectDB().then(ensureDefaultAdmin).catch((error) => {
    console.error('Startup initialization failed:', error.message);
});

app.get('/', (req, res) => {
    res.json({ message: 'API running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

