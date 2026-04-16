import React, { useEffect, useState } from 'react';
import { CheckCircle2, HeartHandshake, XCircle } from 'lucide-react';
import api from '../../services/api';

const Interests = () => {
    const [interests, setInterests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInterests();
    }, []);

    const fetchInterests = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/interests');
            setInterests(response.data?.interests || []);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            await api.put(`/api/interests/${id}`, { status: 'accepted' });
            setInterests((prev) => prev.filter((interest) => interest._id !== id));
        } catch {
            setError('Failed to accept interest');
        }
    };

    const handleReject = async (id) => {
        try {
            await api.put(`/api/interests/${id}`, { status: 'rejected' });
            setInterests((prev) => prev.filter((interest) => interest._id !== id));
        } catch {
            setError('Failed to reject interest');
        }
    };

    if (loading) {
        return (
            <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading interests...</div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg md:p-4">
                <h1 className="flex items-center gap-2 text-xl font-black text-slate-900">
                    <HeartHandshake size={20} />
                    Received Interests
                </h1>
                <p className="mt-1 text-sm text-slate-600">Review requests and respond quickly.</p>
            </div>

            {error && <div className="mb-4 rounded-xl border border-rose-300/30 bg-rose-500/15 px-4 py-3 text-sm text-rose-100">{error}</div>}

            {interests.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">No interests received yet.</div>
            ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {interests.map(interest => (
                        <div key={interest._id} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-lg">
                            <h3 className="text-lg font-bold text-slate-900">{interest.sender?.name || 'Unknown User'}</h3>
                            <p className="mt-1 text-sm text-slate-600">{interest.sender?.email || 'No email available'}</p>

                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={() => handleAccept(interest._id)}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                                >
                                    <CheckCircle2 size={16} />
                                    Accept
                                </button>
                                <button
                                    onClick={() => handleReject(interest._id)}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
                                >
                                    <XCircle size={16} />
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Interests;