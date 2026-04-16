import React from 'react';
import { Link } from 'react-router-dom';
import { User, Search, Heart, Sparkles, ArrowRight, MessageSquareText } from 'lucide-react';

export default function Dashboard() {
    const userName = localStorage.getItem('userName') || 'Member';

    const navigationCards = [
        {
            title: 'Profile',
            description: 'View and refine your marriage profile',
            icon: User,
            path: '/profile',
            accent: 'from-cyan-500 to-sky-500',
        },
        {
            title: 'Search Matches',
            description: 'Find suitable bride or groom profiles',
            icon: Search,
            path: '/search',
            accent: 'from-emerald-500 to-teal-500',
        },
        {
            title: 'Interests',
            description: 'Track and respond to marriage interests',
            icon: Heart,
            path: '/interests',
            accent: 'from-orange-500 to-rose-500',
        },
        {
            title: 'Messages',
            description: 'Chat securely with your matches',
            icon: MessageSquareText,
            path: '/messages',
            accent: 'from-indigo-500 to-cyan-500',
        },
    ];

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
            <div className="pointer-events-none absolute left-0 top-10 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-36 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur md:p-7">
                    <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/90">
                        <Sparkles size={14} />
                        SoulSync Marriage Bureau
                    </p>
                    <h1 className="mt-3 text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
                        Welcome to SoulSync Marriage Bureau, {userName}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
                        Start your journey toward a meaningful marriage connection. Your profile, matches, interests, and messages are all in one place.
                    </p>
                </div>
            </div>

            <div className="relative mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {navigationCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Link
                                key={card.title}
                                to={card.path}
                                className="group rounded-3xl border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/15"
                            >
                                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} shadow-lg transition group-hover:scale-110`}>
                                    <Icon className="text-white" size={20} />
                                </div>

                                <h3 className="text-xl font-bold text-white">
                                    {card.title}
                                </h3>
                                <p className="mt-2 text-slate-200">
                                    {card.description}
                                </p>

                                <div className="mt-4 inline-flex items-center gap-2 font-semibold text-cyan-200 transition group-hover:gap-3 group-hover:text-cyan-100">
                                    Open
                                    <ArrowRight size={18} />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-6 rounded-3xl border border-white/15 bg-white/10 p-5 text-sm text-slate-200 shadow-xl backdrop-blur md:p-6">
                    Keep your profile complete to receive better curated proposals and more relevant interest requests.
                </div>
            </div>
        </div>
    );
}