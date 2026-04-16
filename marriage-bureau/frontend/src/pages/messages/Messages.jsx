import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SendHorizonal, MessageSquareText } from 'lucide-react';
import api from '../../services/api';

export default function Messages() {
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [messageLoading, setMessageLoading] = useState(false);
    const [error, setError] = useState('');
    const currentEmail = localStorage.getItem('userEmail');

    const fetchConversations = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/messages');
            setConversations(response.data?.conversations || []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load conversations');
        } finally {
            setLoading(false);
        }
    }, []);

    const openConversation = useCallback(async (user) => {
        try {
            setSelectedUser(user);
            setMessageLoading(true);
            const response = await api.get(`/api/messages/with/${user.id}`);
            setMessages(response.data?.messages || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load messages');
        } finally {
            setMessageLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        const selected = location.state?.user;
        if (selected) {
            openConversation(selected);
        }
    }, [location.state, openConversation]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!selectedUser || !content.trim()) return;

        try {
            await api.post('/api/messages', {
                receiverId: selectedUser.id,
                content,
            });
            setContent('');
            const response = await api.get(`/api/messages/with/${selectedUser.id}`);
            setMessages(response.data?.messages || []);
            fetchConversations();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send message');
        }
    };

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg md:p-4">
                <h1 className="flex items-center gap-2 text-xl font-black text-slate-900">
                    <MessageSquareText size={20} />
                    Messages
                </h1>
                <p className="mt-1 text-sm text-slate-600">Send and receive secure in-app messages.</p>
            </div>

            {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

            <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Conversations</h2>
                    <div className="mt-4 space-y-2">
                        {loading ? (
                            <div className="text-sm text-slate-600">Loading...</div>
                        ) : conversations.length === 0 ? (
                            <div className="text-sm text-slate-600">No conversations yet.</div>
                        ) : (
                            conversations.map((conversation) => (
                                <button
                                    key={conversation.user.id}
                                    onClick={() => openConversation(conversation.user)}
                                    className={`w-full rounded-xl border px-3 py-3 text-left transition ${selectedUser?.id === conversation.user.id ? 'border-cyan-300 bg-cyan-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                                >
                                    <div className="font-semibold text-slate-900">{conversation.user.name}</div>
                                    <div className="text-sm text-slate-600 line-clamp-1">{conversation.lastMessage}</div>
                                </button>
                            ))
                        )}
                    </div>
                </aside>

                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
                    <h2 className="text-lg font-bold text-slate-900">Chat Window</h2>
                    {selectedUser ? (
                        <>
                            <div className="mt-4 h-[420px] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                {messageLoading ? (
                                    <div className="text-sm text-slate-600">Loading conversation...</div>
                                ) : messages.length === 0 ? (
                                    <div className="text-sm text-slate-600">No messages yet. Start the conversation below.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {messages.map((message) => {
                                            const isMine = message.sender?.email === currentEmail;
                                            return (
                                                <div key={message._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${isMine ? 'bg-cyan-600 text-white' : 'bg-white text-slate-900 border border-slate-200'}`}>
                                                        {message.content}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <form onSubmit={sendMessage} className="mt-4 flex gap-2">
                                <input
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={`Message ${selectedUser.name}`}
                                    className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
                                />
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-700 px-4 py-3 font-semibold text-white"
                                >
                                    <SendHorizonal size={16} />
                                    Send
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                            Select a conversation to view messages.
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
