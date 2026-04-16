import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Send } from 'lucide-react';
import api from '../../services/api';

export default function Search() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        age: '',
        city: '',
        gender: '',
        education: '',
        preferences: '',
    });
    const navigate = useNavigate();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.age) params.append('age', filters.age);
            if (filters.city) params.append('city', filters.city);
            if (filters.gender) params.append('gender', filters.gender);
            if (filters.education) params.append('education', filters.education);
            if (filters.preferences) params.append('preferences', filters.preferences);

            const response = await api.get(`/api/users/search?${params.toString()}`);
            setUsers(response.data?.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const sendInterest = async (userId) => {
        try {
            await api.post('/api/interests/send', { receiverId: userId });
            alert('Interest sent!');
        } catch (error) {
            console.error('Error sending interest:', error);
            alert(error.response?.data?.message || 'Failed to send interest');
        }
    };

    const openMessages = (user) => {
        navigate('/messages', {
            state: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            },
        });
    };

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg md:p-4">
                <h1 className="flex items-center gap-2 text-xl font-black text-slate-900">
                    <SearchIcon size={20} />
                    Search Matches
                </h1>
                <p className="mt-1 text-sm text-slate-600">Refine filters to find compatible profiles quickly.</p>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-5">
                    <input
                        type="number"
                        name="age"
                        placeholder="Min age"
                        value={filters.age}
                        onChange={handleFilterChange}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                    />
                    <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={filters.city}
                        onChange={handleFilterChange}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                    />
                    <select
                        name="gender"
                        value={filters.gender}
                        onChange={handleFilterChange}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                    >
                        <option value="">All Genders</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                    <input
                        type="text"
                        name="education"
                        placeholder="Education"
                        value={filters.education}
                        onChange={handleFilterChange}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                    />
                    <input
                        type="text"
                        name="preferences"
                        placeholder="Preferences"
                        value={filters.preferences}
                        onChange={handleFilterChange}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading matches...</div>
                ) : users.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">No matching users found.</div>
                ) : (
                    users.map((user) => (
                        <div key={user._id} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-lg">
                            <div className="mb-3 h-40 overflow-hidden rounded-xl bg-slate-800">
                                <img
                                    src={user.photo || 'https://placehold.co/800x600/1e293b/e2e8f0?text=Profile'}
                                    alt={user.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                {user.age || 'N/A'} • {user.city || 'Unknown city'}
                            </p>
                            <p className="mt-2 line-clamp-2 text-sm text-slate-400">{user.bio || 'No bio added yet.'}</p>

                            <button
                                onClick={() => sendInterest(user._id)}
                                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2.5 text-sm font-bold text-white transition hover:from-cyan-600 hover:to-emerald-600"
                            >
                                <Send size={16} />
                                Send Interest
                            </button>

                            <button
                                onClick={() => openMessages(user)}
                                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                            >
                                Message
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}