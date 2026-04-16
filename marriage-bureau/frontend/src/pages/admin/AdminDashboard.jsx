import React, { useEffect, useState } from 'react';
import { ShieldCheck, Trash2, Pencil, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import api from '../../services/api';

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState(null);

    const pendingCount = users.filter((user) => !user.isApproved).length;
    const approvedCount = users.filter((user) => user.isApproved).length;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/users');
            setUsers(response.data || []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user permanently?')) {
            return;
        }

        try {
            await api.delete(`/api/users/${id}`);
            setUsers((prev) => prev.filter((user) => user.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleApprovalToggle = async (user) => {
        try {
            const nextApproved = !user.isApproved;
            await api.patch(`/api/users/${user.id}/approval`, { isApproved: nextApproved });
            setUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, isApproved: nextApproved } : item)));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update approval');
        }
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;

        try {
            const payload = {
                name: editingUser.name,
                email: editingUser.email,
                age: editingUser.age,
                gender: editingUser.gender,
                city: editingUser.city,
                education: editingUser.education,
                bio: editingUser.bio,
                preferences: editingUser.preferences,
            };

            const response = await api.put(`/api/users/${editingUser.id}`, payload);
            const updatedUser = response.data?.user;
            if (updatedUser) {
                setUsers((prev) => prev.map((item) => (item.id === editingUser.id ? { ...item, ...updatedUser } : item)));
            }
            setEditingUser(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update user');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-5 text-slate-100 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur md:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rose-100">
                                <ShieldCheck size={14} />
                                Control Center
                            </div>
                            <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">Admin Dashboard</h1>
                            <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
                                Approve accounts, edit user records, and remove profiles from the platform.
                            </p>
                        </div>
                        <button
                            onClick={fetchUsers}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                        >
                            <RefreshCw size={16} /> Refresh Data
                        </button>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Total Users</p>
                            <p className="mt-2 text-3xl font-black text-white">{users.length}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Pending Approval</p>
                            <p className="mt-2 text-3xl font-black text-amber-300">{pendingCount}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Approved</p>
                            <p className="mt-2 text-3xl font-black text-emerald-300">{approvedCount}</p>
                        </div>
                    </div>
                </div>

                {error && <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</div>}

                {loading ? (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Loading users...</div>
                ) : users.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">No users found.</div>
                ) : (
                    <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-sm">
                                <thead className="border-b border-white/10 bg-white/5">
                                <tr>
                                        <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.2em] text-slate-300">Name</th>
                                        <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.2em] text-slate-300">Email</th>
                                        <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.2em] text-slate-300">Age</th>
                                        <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.2em] text-slate-300">Gender</th>
                                        <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.2em] text-slate-300">City</th>
                                        <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.2em] text-slate-300">Status</th>
                                        <th className="px-4 py-3 text-left font-semibold uppercase tracking-[0.2em] text-slate-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="px-4 py-3 font-semibold text-white">{user.name}</td>
                                        <td className="px-4 py-3 text-slate-300">{user.email}</td>
                                        <td className="px-4 py-3 text-slate-300">{user.age || '-'}</td>
                                        <td className="px-4 py-3 text-slate-300">{user.gender || '-'}</td>
                                        <td className="px-4 py-3 text-slate-300">{user.city || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${user.isApproved ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}
                                            >
                                                {user.isApproved ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                                {user.isApproved ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                {!user.isApproved ? (
                                                    <button
                                                        onClick={() => handleApprovalToggle(user)}
                                                        className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-400"
                                                    >
                                                        Approve
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleApprovalToggle(user)}
                                                        className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-400"
                                                    >
                                                        Reject
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setEditingUser(user)}
                                                    className="rounded-lg bg-sky-500/15 p-2 text-sky-300 transition hover:bg-sky-500/25"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="rounded-lg bg-rose-500/15 p-2 text-rose-300 transition hover:bg-rose-500/25"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

                {editingUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Profile Editor</p>
                                    <h2 className="mt-2 text-2xl font-black text-white">Edit User</h2>
                                    <p className="mt-1 text-sm text-slate-300">Update the selected profile details.</p>
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                                {['name', 'email', 'age', 'gender', 'city', 'education', 'preferences'].map((field) => (
                                    <input
                                        key={field}
                                        value={editingUser[field] || ''}
                                        onChange={(e) => setEditingUser((prev) => ({ ...prev, [field]: e.target.value }))}
                                        placeholder={field}
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                                    />
                                ))}
                                <textarea
                                    value={editingUser.bio || ''}
                                    onChange={(e) => setEditingUser((prev) => ({ ...prev, bio: e.target.value }))}
                                    placeholder="bio"
                                    rows="4"
                                    className="md:col-span-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                                />
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="rounded-xl bg-linear-to-r from-rose-600 to-orange-700 px-4 py-2.5 text-sm font-semibold text-white"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
