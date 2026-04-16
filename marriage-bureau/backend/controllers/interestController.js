const Interest = require('../models/Interest');
const User = require('../models/User');

exports.sendInterest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user.userId;

        if (!receiverId) {
            return res.status(400).json({ message: 'Receiver ID is required' });
        }

        if (senderId === receiverId) {
            return res.status(400).json({ message: 'Cannot send interest to yourself' });
        }

        const receiver = await User.findById(receiverId).select('isApproved isAdmin');
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        if (receiver.isAdmin || !receiver.isApproved) {
            return res.status(400).json({ message: 'Receiver is not available for interests' });
        }

        const existing = await Interest.findOne({
            sender: senderId,
            receiver: receiverId
        });

        if (existing) {
            return res.status(400).json({ message: "Interest already sent" });
        }

        const interest = new Interest({
            sender: senderId,
            receiver: receiverId,
            status: 'pending'
        });

        await interest.save();
        res.status(201).json({ message: 'Interest sent successfully', interest });
    } catch (error) {
        res.status(500).json({ message: 'Error sending interest', error: error.message });
    }
};

exports.getReceivedInterests = async (req, res) => {
    try {
        const receiverId = req.user.userId;

        const interests = await Interest.find({ receiver: receiverId })
            .populate('sender', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ interests });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching interests', error: error.message });
    }
};

exports.updateInterest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const interest = await Interest.findById(id);

        if (!interest) {
            return res.status(404).json({ message: 'Interest not found' });
        }

        if (interest.receiver.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        interest.status = status;
        await interest.save();

        res.status(200).json({
            message: 'Interest updated successfully',
            interest
        });

    } catch (error) {
        res.status(500).json({ message: 'Error updating interest', error: error.message });
    }
};
