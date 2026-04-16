import { useState, useEffect } from 'react';
import { Save, UserCircle2 } from 'lucide-react';
import api from '../../services/api';

const Profile = () => {
    const [formData, setFormData] = useState({
        age: '',
        gender: '',
        city: '',
        education: '',
        bio: '',
        preferences: '',
    });
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/users/me');
            const user = response?.data?.user || {};
            setName(user.name || '');
            setEmail(user.email || '');
            setFormData({
                age: user.age || '',
                gender: user.gender || '',
                city: user.city || '',
                education: user.education || '',
                bio: user.bio || '',
                preferences: user.preferences || '',
            });
            setError('');
        } catch (err) {
            setError('Failed to fetch user data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.put('/api/users/me', formData);
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to update profile');
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-900">
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold shadow">
                    Loading your profile...
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl" />
            <div className="pointer-events-none absolute -right-12 bottom-0 h-96 w-96 rounded-full bg-emerald-300/25 blur-3xl" />

            <div className="relative mx-auto w-full max-w-4xl">
                <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg md:p-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-500 p-2.5 shadow-lg">
                            <UserCircle2 size={22} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black md:text-2xl">My Profile</h1>
                            <p className="text-sm text-slate-600">Keep your details up to date for better matches.</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg md:p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                disabled
                                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600 outline-none"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600 outline-none"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Age</label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                                placeholder="Your age"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                                placeholder="Your city"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Education</label>
                            <input
                                type="text"
                                name="education"
                                value={formData.education}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                                placeholder="Your highest education"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Preferences</label>
                            <input
                                type="text"
                                name="preferences"
                                value={formData.preferences}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                                placeholder="e.g. caring, family-oriented"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="4"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                            placeholder="Write a short intro about yourself"
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2.5 font-bold text-white shadow-lg transition hover:from-cyan-600 hover:to-emerald-600"
                    >
                        <Save size={18} />
                        Update Profile
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;