const Message = require('../models/Message');
const User = require('../models/User');

const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.userId;

        if (!receiverId || !content) {
            return res.status(400).json({ message: 'Receiver and content are required' });
        }

        const safeContent = typeof content === 'string' ? content.trim() : '';
        if (!safeContent) {
            return res.status(400).json({ message: 'Message content cannot be empty' });
        }

        if (senderId === receiverId) {
            return res.status(400).json({ message: 'Cannot message yourself' });
        }

        const receiver = await User.findById(receiverId).select('isApproved isAdmin');
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        if (receiver.isAdmin || !receiver.isApproved) {
            return res.status(400).json({ message: 'Receiver is not available for messaging' });
        }

        const message = await Message.create({ sender: senderId, receiver: receiverId, content: safeContent });
        res.status(201).json({ message: 'Message sent successfully', data: message });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMessagesWithUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const myId = req.user.userId;

        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: userId },
                { sender: userId, receiver: myId },
            ],
        })
            .populate('sender', 'name email')
            .populate('receiver', 'name email')
            .sort({ createdAt: 1 });

        res.status(200).json({ messages });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getConversations = async (req, res) => {
    try {
        const myId = req.user.userId;
        const messages = await Message.find({
            $or: [{ sender: myId }, { receiver: myId }],
        })
            .populate('sender', 'name email')
            .populate('receiver', 'name email')
            .sort({ createdAt: -1 });

        const conversations = new Map();
        messages.forEach((message) => {
            const otherUser = message.sender._id.toString() === myId ? message.receiver : message.sender;
            const key = otherUser._id.toString();
            if (!conversations.has(key)) {
                conversations.set(key, {
                    user: { id: otherUser._id, name: otherUser.name, email: otherUser.email },
                    lastMessage: message.content,
                    updatedAt: message.createdAt,
                });
            }
        });

        res.status(200).json({ conversations: Array.from(conversations.values()) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { sendMessage, getMessagesWithUser, getConversations };