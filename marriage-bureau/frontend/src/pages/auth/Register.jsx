import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartHandshake, UserPlus } from 'lucide-react';
import api from '../../services/api';

export default function Register({ setIsAuthenticated, setIsAdmin }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const theme = {
        pageBg: 'bg-slate-950',
        glowOne: 'bg-rose-400/10',
        glowTwo: 'bg-emerald-400/10',
        shellBorder: 'border-rose-500/15',
        leftPanel: 'bg-gradient-to-br from-slate-950 via-slate-900 to-rose-900',
        badgeBorder: 'border-white/15',
        badgeBg: 'bg-white/10',
        badgeText: 'text-slate-50',
        eyebrow: 'text-rose-700',
        fieldFocus: 'focus:border-rose-600 focus:ring-4 focus:ring-rose-100',
        submitGradient: 'bg-linear-to-r from-rose-600 to-indigo-700 hover:from-rose-500 hover:to-indigo-600',
        linkText: 'text-rose-700 hover:text-rose-800',
        helperBorder: 'border-rose-200 bg-rose-50 text-rose-800',
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const { data } = await api.post('/api/users/register', formData);
            const role = data?.user?.isAdmin ? 'admin' : 'user';

            if (data?.token && data?.user?.isApproved) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userEmail', data?.user?.email || formData.email);
                localStorage.setItem('userName', data?.user?.name || formData.name);
                localStorage.setItem('userRole', role);

                if (setIsAuthenticated) {
                    setIsAuthenticated(true);
                }
                if (setIsAdmin) {
                    setIsAdmin(role === 'admin');
                }

                navigate('/dashboard');
                return;
            }

            setSuccess(data?.message || 'Registration submitted. Wait for admin approval before login.');
            setFormData({ name: '', email: '', password: '' });
        } catch (err) {
            if (!err.response) {
                setError('Cannot connect to server. Please start backend on port 5000.');
            } else {
                setError(err.response?.data?.message || 'Registration failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`relative h-screen overflow-hidden ${theme.pageBg}`}>
            <div className={`pointer-events-none absolute right-2 top-2 h-72 w-72 rounded-full ${theme.glowOne} blur-3xl`} />
            <div className={`pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full ${theme.glowTwo} blur-3xl`} />

            <div className="relative mx-auto flex h-full w-full max-w-4xl items-center justify-center p-2.5 md:p-4">
                <div className={`grid w-full overflow-hidden rounded-3xl border ${theme.shellBorder} bg-white/96 shadow-2xl backdrop-blur md:grid-cols-2`}>
                    <section className={`hidden p-5.5 text-white md:flex md:flex-col md:justify-between ${theme.leftPanel}`}>
                        <div>
                            <div className={`mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${theme.badgeBorder} ${theme.badgeBg} ${theme.badgeText}`}>
                                <HeartHandshake size={16} />
                                SoulSync Marriage Bureau
                            </div>
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/75">Member Access</p>
                            <h1 className="mt-2 text-[1.4rem] font-black leading-tight text-white">Create your marriage profile and start connecting.</h1>
                            <p className="mt-4 text-slate-100/90">
                                Join SoulSync Marriage Bureau to find compatible proposals and meaningful conversations.
                            </p>
                        </div>
                        <p className="text-sm text-slate-100/80">It takes less than a minute to get started. New accounts may wait for admin approval.</p>
                    </section>

                    <section className="bg-white p-4.5 sm:p-5.5">
                        <div className="mb-5">
                            <p className={`text-sm font-semibold uppercase tracking-widest ${theme.eyebrow}`}>New Account</p>
                            <h2 className="mt-1 text-xl font-extrabold text-slate-900">Register</h2>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700">
                                {success}
                            </div>
                        )}

                        <p className={`mb-4 rounded-xl border px-3.5 py-2.5 text-sm font-medium ${theme.helperBorder}`}>
                            Use your real name and email. After registration, your account may remain pending until an admin approves it.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className={`w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 ${theme.fieldFocus}`}
                                    placeholder="Your full name"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className={`w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 ${theme.fieldFocus}`}
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className={`w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 ${theme.fieldFocus}`}
                                    placeholder="Choose a secure password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${theme.submitGradient}`}
                            >
                                <UserPlus size={18} />
                                {loading ? 'Registering...' : 'Create Account'}
                            </button>
                        </form>

                        <p className="mt-5 text-center text-sm text-slate-600">
                            Already have an account?{' '}
                            <Link to="/login" className={`font-bold hover:underline ${theme.linkText}`}>
                                Login
                            </Link>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}