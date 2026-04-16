import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartHandshake, LogIn } from 'lucide-react';
import api from '../../services/api';

export default function Login({ setIsAuthenticated, setIsAdmin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginMode, setLoginMode] = useState('user');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const isAdminMode = loginMode === 'admin';

    const theme = isAdminMode
        ? {
            pageBg: 'bg-slate-950',
            glowOne: 'bg-rose-500/10',
            glowTwo: 'bg-orange-400/10',
            shellBorder: 'border-rose-500/15',
            shellBg: 'bg-white/96',
            leftPanel: 'bg-gradient-to-br from-slate-950 via-slate-900 to-rose-900',
            badgeBorder: 'border-rose-400/20',
            badgeBg: 'bg-rose-500/10',
            badgeText: 'text-rose-100',
            eyebrow: 'text-rose-700',
            tabActive: 'bg-white text-rose-700 shadow-sm',
            tabIdle: 'text-slate-600 hover:text-slate-900',
            intro: 'Manage approvals, profiles, and platform access from one secure place.',
            note: 'For administrators only',
            panelKicker: 'Admin Access',
            panelTitle: 'Secure control center',
            panelCopy: 'Sign in to review member requests, moderate profiles, and keep the marriage bureau organized.',
            footerCopy: 'Administrative actions are logged and protected by role-based access.',
            fieldFocus: 'focus:border-rose-600 focus:ring-4 focus:ring-rose-100',
            submitGradient: 'bg-gradient-to-r from-rose-600 to-orange-700 hover:from-rose-500 hover:to-orange-600',
            linkText: 'text-rose-700 hover:text-rose-800',
            helperBorder: 'border-rose-200 bg-rose-50 text-rose-800',
        }
        : {
            pageBg: 'bg-slate-900',
            glowOne: 'bg-cyan-400/10',
            glowTwo: 'bg-indigo-400/10',
            shellBorder: 'border-slate-700',
            shellBg: 'bg-white/96',
            leftPanel: 'bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-800',
            badgeBorder: 'border-white/15',
            badgeBg: 'bg-white/10',
            badgeText: 'text-slate-50',
            eyebrow: 'text-cyan-700',
            tabActive: 'bg-white text-cyan-700 shadow-sm',
            tabIdle: 'text-slate-600 hover:text-slate-900',
            intro: 'Login to continue your journey on SoulSync Marriage Bureau and connect with suitable matches.',
            note: 'For members and match seekers',
            panelKicker: 'Member Access',
            panelTitle: 'Welcome to SoulSync Marriage Bureau.',
            panelCopy: 'Use your regular account to explore profiles, send interests, and chat with confidence.',
            footerCopy: 'Your profile, interests, and messages stay organized in one place.',
            fieldFocus: 'focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100',
            submitGradient: 'bg-gradient-to-r from-cyan-600 to-indigo-700 hover:from-cyan-500 hover:to-indigo-600',
            linkText: 'text-cyan-700 hover:text-cyan-800',
            helperBorder: 'border-cyan-200 bg-cyan-50 text-cyan-800',
        };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/api/users/login', { email, password });
            const isAdminAccount = Boolean(response.data?.user?.isAdmin);

            if (loginMode === 'admin' && !isAdminAccount) {
                setError('This is not an admin account. Switch to User Login.');
                return;
            }

            if (loginMode === 'user' && isAdminAccount) {
                setError('This is an admin account. Switch to Admin Login.');
                return;
            }

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userEmail', response.data?.user?.email || email);
            localStorage.setItem('userName', response.data?.user?.name || '');
            const role = isAdminAccount ? 'admin' : 'user';
            localStorage.setItem('userRole', role);
            if (setIsAuthenticated) {
                setIsAuthenticated(true);
            }
            if (setIsAdmin) {
                setIsAdmin(role === 'admin');
            }
            navigate(role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            if (!err.response) {
                setError('Cannot connect to server. Please start backend on port 5000.');
            } else if (err.response?.status === 403 && err.response?.data?.message?.toLowerCase().includes('approval')) {
                setError('Your account is pending admin approval. Please wait for approval before logging in.');
            } else {
                setError(err.response?.data?.message || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`relative h-screen overflow-hidden ${theme.pageBg}`}>
            <div className={`pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full ${theme.glowOne} blur-3xl`} />
            <div className={`pointer-events-none absolute -right-16 bottom-8 h-80 w-80 rounded-full ${theme.glowTwo} blur-3xl`} />

            <div className="relative mx-auto flex h-full w-full max-w-4xl items-center justify-center p-3 md:p-5">
                <div className={`grid w-full overflow-hidden rounded-3xl border ${theme.shellBorder} ${theme.shellBg} shadow-2xl backdrop-blur md:grid-cols-2`}>
                    <section className={`hidden p-7 text-white md:flex md:flex-col md:justify-between ${theme.leftPanel}`}>
                        <div>
                            <div className={`mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${theme.badgeBorder} ${theme.badgeBg} ${theme.badgeText}`}>
                                <HeartHandshake size={16} />
                                SoulSync Marriage Bureau
                            </div>
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/75">{theme.panelKicker}</p>
                            <h1 className="mt-3 text-2xl font-black leading-tight text-white">{theme.panelTitle}</h1>
                            <p className="mt-4 text-slate-100/90">
                                {theme.panelCopy}
                            </p>
                        </div>
                        <p className="text-sm text-slate-100/80">{theme.footerCopy}</p>
                    </section>

                    <section className="bg-white p-6 sm:p-7">
                        <div className="mb-5">
                            <p className={`text-sm font-semibold uppercase tracking-widest ${theme.eyebrow}`}>Account Access</p>
                            <h2 className="mt-1 text-xl font-extrabold text-slate-900">Login</h2>
                        </div>

                        <div className="mb-5 grid grid-cols-2 rounded-2xl border border-slate-200 bg-slate-100 p-1.5">
                            <button
                                type="button"
                                onClick={() => setLoginMode('user')}
                                className={`rounded-xl px-3 py-2 text-sm font-bold transition ${loginMode === 'user' ? theme.tabActive : theme.tabIdle}`}
                            >
                                User Login
                            </button>
                            <button
                                type="button"
                                onClick={() => setLoginMode('admin')}
                                className={`rounded-xl px-3 py-2 text-sm font-bold transition ${loginMode === 'admin' ? theme.tabActive : theme.tabIdle}`}
                            >
                                Admin Login
                            </button>
                        </div>

                        <p className={`mb-5 rounded-xl border px-4.5 py-3.5 text-sm font-medium ${theme.helperBorder}`}>
                            {loginMode === 'user'
                                ? theme.intro
                                : 'Use the admin account to manage users and approvals from the control panel.'}
                        </p>

                        {error && (
                            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4.5 py-3.5 text-sm font-medium text-rose-700">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4.5">
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className={`w-full rounded-xl border border-slate-300 bg-slate-50 px-4.5 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 ${theme.fieldFocus}`}
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className={`w-full rounded-xl border border-slate-300 bg-slate-50 px-4.5 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 ${theme.fieldFocus}`}
                                    placeholder="Enter your password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4.5 py-3 font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${theme.submitGradient}`}
                            >
                                <LogIn size={18} />
                                {loading ? 'Logging in...' : loginMode === 'admin' ? 'Admin Login' : 'User Login'}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-slate-600">
                            Don&apos;t have an account?{' '}
                            <Link to="/register" className={`font-bold hover:underline ${theme.linkText}`}>
                                Sign up
                            </Link>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}