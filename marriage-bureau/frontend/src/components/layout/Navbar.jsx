import React, { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const isAdmin = localStorage.getItem('userRole') === 'admin';
    const links = isAdmin
        ? [{ to: '/admin', label: 'Admin' }]
        : [
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/profile', label: 'Profile' },
            { to: '/search', label: 'Search' },
            { to: '/interests', label: 'Interests' },
            { to: '/messages', label: 'Messages' },
        ];

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        navigate('/login');
        window.location.reload();
    };

    return (
        <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-12 items-center justify-between">
                    <div className="flex-shrink-0">
                        <Link to={isAdmin ? '/admin' : '/dashboard'} className="bg-gradient-to-r from-cyan-300 to-orange-300 bg-clip-text text-base font-black text-transparent sm:text-lg">
                            SoulSync Marriage Bureau
                        </Link>
                    </div>

                    <div className="hidden items-center space-x-2 md:flex">
                        {links.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${location.pathname === item.to
                                    ? 'bg-white/15 text-white'
                                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:block">
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:from-rose-600 hover:to-orange-600"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>

                    <div className="md:hidden">
                        <button onClick={toggleMenu} className="text-slate-100">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="border-t border-white/10 bg-slate-900 md:hidden">
                    <div className="space-y-1 px-3 pb-3 pt-2">
                        {links.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsOpen(false)}
                                className={`block rounded-md px-3 py-2 text-sm ${location.pathname === item.to
                                    ? 'bg-white/15 text-white'
                                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="mt-1 w-full rounded-md bg-gradient-to-r from-rose-500 to-orange-500 px-3 py-2 text-left text-sm font-semibold text-white"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;