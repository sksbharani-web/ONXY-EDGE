import React, { useState, useEffect } from 'react';
import {
    Zap, Shield, BarChart3, Smartphone, ArrowRight,
    Activity, Globe, Cpu, Leaf, ChevronDown, Play,
    Check, Star, Users, TrendingUp, Clock, Battery
} from 'lucide-react';
import { Logo } from '@/components/Logo';

interface IntroPageProps {
    onGetStarted: () => void;
    onLogin: () => void;
}

export function IntroPage({ onGetStarted, onLogin }: IntroPageProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        setIsVisible(true);
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-rotate features
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature(prev => (prev + 1) % 4);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const features = [
        {
            icon: Zap,
            title: 'Real-Time Monitoring',
            desc: 'Track voltage, current, power & energy consumption live from your IoT sensors with sub-second updates.',
            color: 'from-emerald-500 to-teal-400',
            bgGlow: 'bg-emerald-500/20',
        },
        {
            icon: Shield,
            title: 'Smart Alerts & Safety',
            desc: 'Automatic notifications for voltage fluctuations, overcurrent, and abnormal consumption patterns.',
            color: 'from-purple-500 to-pink-400',
            bgGlow: 'bg-purple-500/20',
        },
        {
            icon: BarChart3,
            title: 'Cost & Carbon Analytics',
            desc: 'Detailed cost breakdowns in ₹, carbon footprint tracking, and AI-powered usage insights.',
            color: 'from-emerald-500 to-teal-400',
            bgGlow: 'bg-emerald-500/20',
        },
        {
            icon: Smartphone,
            title: 'Remote Relay Control',
            desc: 'Turn appliances on/off from anywhere. Schedule automation and integrate with smart home systems.',
            color: 'from-amber-500 to-orange-400',
            bgGlow: 'bg-amber-500/20',
        },
    ];

    const stats = [
        { value: '99.9%', label: 'Uptime', icon: Activity },
        { value: '<1s', label: 'Latency', icon: Clock },
        { value: '50K+', label: 'Readings/Day', icon: TrendingUp },
        { value: '24/7', label: 'Monitoring', icon: Globe },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
            {/* Animated background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950" />
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }} />
                {/* Floating orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
                <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '1s' }} />
            </div>

            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50' : ''}`}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Logo className="w-10 h-10 drop-shadow-lg" />
                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">ONXY EDGE</h1>
                            <p className="text-[10px] text-slate-500 tracking-widest uppercase">IoT Energy Platform</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onLogin}
                            className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors font-medium"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={onGetStarted}
                            className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-400 rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
                <div className="max-w-6xl mx-auto text-center relative z-10">
                    {/* Badge */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span>Powered by ONXY EDGE Hardware</span>
                        <ArrowRight className="w-3 h-3" />
                    </div>

                    {/* Headline */}
                    <h1 className={`text-5xl md:text-7xl font-bold leading-tight mb-6 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400">
                            Smart Energy
                        </span>
                        <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                            Monitoring System
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className={`text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        Monitor, analyze, and optimize your electrical energy consumption in real-time.
                        Enterprise-grade IoT dashboard with AI-powered insights for homes and businesses.
                    </p>

                    {/* CTA Buttons */}
                    <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <button
                            onClick={onGetStarted}
                            className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                            Start Monitoring
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            className="group px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                        >
                            <Play className="w-5 h-5 text-emerald-400" />
                            Watch Demo
                        </button>
                    </div>

                    {/* Live Stats Ticker */}
                    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all group">
                                <stat.icon className="w-4 h-4 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-xs text-slate-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                        <ChevronDown className="w-6 h-6 text-slate-600" />
                    </div>
                </div>

                {/* Animated dashboard preview (decorative) */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl h-96 opacity-20 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent z-10" />
                    <div className="bg-slate-900/50 rounded-t-3xl border border-slate-800/50 p-6 h-full backdrop-blur-sm">
                        <div className="grid grid-cols-5 gap-3 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-16 bg-slate-800/50 rounded-xl animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2 h-40 bg-slate-800/50 rounded-xl animate-pulse" style={{ animationDelay: '0.5s' }} />
                            <div className="h-40 bg-slate-800/50 rounded-xl animate-pulse" style={{ animationDelay: '0.7s' }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-3">Features</p>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Everything you need to
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">manage energy</span>
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">Industrial-grade monitoring meets consumer-friendly design. Built for reliability, designed for clarity.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                onMouseEnter={() => setActiveFeature(index)}
                                className={`group relative p-8 rounded-3xl border transition-all duration-500 cursor-default overflow-hidden ${activeFeature === index
                                    ? 'bg-white/5 border-white/20 scale-[1.02]'
                                    : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'
                                    }`}
                            >
                                {/* Glow effect */}
                                {activeFeature === index && (
                                    <div className={`absolute -top-20 -right-20 w-60 h-60 ${feature.bgGlow} rounded-full blur-3xl transition-opacity duration-500`} />
                                )}

                                <div className="relative z-10">
                                    <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${feature.color} mb-5 shadow-lg`}>
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                                    <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="relative py-32 px-6 bg-slate-900/30">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-3">How It Works</p>
                        <h2 className="text-4xl md:text-5xl font-bold">
                            Setup in <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">3 minutes</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Connect Hardware', desc: 'Plug the ONXY EDGE sensor module into your electrical panel. No wiring changes needed.', icon: Cpu },
                            { step: '02', title: 'Configure Dashboard', desc: 'Sign in and your device auto-connects via Firebase. Real-time data starts flowing instantly.', icon: BarChart3 },
                            { step: '03', title: 'Monitor & Save', desc: 'Track consumption, set alerts, control relays remotely. Start saving on electricity bills.', icon: Leaf },
                        ].map((item, i) => (
                            <div key={i} className="relative group">
                                <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-800/80 transition-all h-full">
                                    <div className="text-5xl font-black text-slate-800 mb-4 group-hover:text-slate-700 transition-colors">{item.step}</div>
                                    <div className="inline-flex p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 mb-4">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2 text-white">{item.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                                </div>
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 text-slate-700">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials / Trust Section */}
            <section className="relative py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">Trusted Solution</p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-12">
                        Built for <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">reliability</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        {[
                            { icon: Shield, title: 'Secure by Design', desc: 'End-to-end encrypted data pipeline with Clerk authentication and Firebase security rules.' },
                            { icon: Activity, title: 'Always Online', desc: 'Firebase Realtime Database ensures sub-second sync even on unstable connections.' },
                            { icon: Battery, title: 'Energy Efficient', desc: 'ONXY EDGE hardware designed for minimal power consumption with maximum accuracy.' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-all">
                                <item.icon className="w-8 h-8 text-amber-400 mb-4 mx-auto" />
                                <h3 className="font-bold mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Social proof */}
                    <div className="flex items-center justify-center gap-8 text-slate-600">
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                        </div>
                        <span className="text-sm">Built with Firebase, React & TypeScript</span>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative py-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/20 rounded-[2rem] p-12 md:p-16 text-center relative overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to start monitoring?</h2>
                            <p className="text-lg text-slate-400 mb-8 max-w-lg mx-auto">
                                Join the smart energy revolution. Set up your ONXY EDGE device and start saving today.
                            </p>
                            <button
                                onClick={onGetStarted}
                                className="group px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                            >
                                Get Started Free
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-800/50 py-8 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Logo className="w-8 h-8 drop-shadow-md" />
                        <span className="font-bold text-sm">ONXY EDGE</span>
                    </div>
                    <p className="text-xs text-slate-600">© 2026 ONXY EDGE IoT Energy Platform.</p>
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                        <span className="hover:text-slate-400 cursor-pointer transition-colors">Privacy</span>
                        <span className="hover:text-slate-400 cursor-pointer transition-colors">Terms</span>
                        <span className="hover:text-slate-400 cursor-pointer transition-colors">Support</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
