import React, { useState, useEffect } from 'react';
import { useSignIn, useSignUp } from '@clerk/clerk-react';
import {
    Mail, Lock, AlertCircle, ArrowRight,
    Loader2, Github, Check, User, ArrowLeft,
    Shield, Activity, BarChart3, Wifi, Eye, EyeOff, Zap
} from 'lucide-react';
import { Logo } from '@/components/Logo';

interface LoginPageProps {
    onBack: () => void;
}

type AuthMode = 'signIn' | 'signUp';

export function LoginPage({ onBack }: LoginPageProps) {
    const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
    const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();

    const [isVisible, setIsVisible] = useState(false);
    const [authMode, setAuthMode] = useState<AuthMode>('signIn');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSignInLoaded || !signIn) return;
        setIsLoading(true);
        setError('');

        try {
            const result = await signIn.create({
                identifier: email,
                password: password,
            });

            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                // App.tsx useEffect will detect user and navigate to dashboard
            } else {
                console.log('Sign-in requires further steps:', result);
                setError('Additional verification required. Please check your email.');
            }
        } catch (err: any) {
            console.error('Sign-in error:', err);
            const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Sign in failed. Please check your credentials.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSignUpLoaded || !signUp) return;
        setIsLoading(true);
        setError('');

        try {
            await signUp.create({
                emailAddress: email,
                password: password,
                firstName: firstName || undefined,
            });

            // Send email verification
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setPendingVerification(true);
        } catch (err: any) {
            console.error('Sign-up error:', err);
            const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Sign up failed. Please try again.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSignUpLoaded || !signUp) return;
        setIsLoading(true);
        setError('');

        try {
            const result = await signUp.attemptEmailAddressVerification({
                code: verificationCode,
            });

            if (result.status === 'complete') {
                await setSignUpActive({ session: result.createdSessionId });
            } else {
                setError('Verification incomplete. Please try again.');
            }
        } catch (err: any) {
            console.error('Verification error:', err);
            const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Invalid verification code.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuth = async (provider: 'oauth_google' | 'oauth_github' | 'oauth_microsoft') => {
        if (!isSignInLoaded || !signIn) return;
        setError('');
        try {
            await signIn.authenticateWithRedirect({
                strategy: provider,
                redirectUrl: '/sso-callback',
                redirectUrlComplete: '/',
            });
        } catch (err: any) {
            console.error('OAuth error:', err);
            setError('OAuth sign-in failed. Please try email/password.');
        }
    };

    const switchMode = () => {
        setAuthMode(prev => prev === 'signIn' ? 'signUp' : 'signIn');
        setError('');
        setPendingVerification(false);
        setVerificationCode('');
    };

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Left Panel — Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-slate-950 to-cyan-600/20" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />

                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }} />

                <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
                <div className="absolute bottom-40 right-20 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '2s' }} />

                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 mr-2">
                            <ArrowLeft className="w-4 h-4 text-slate-400" />
                        </button>
                        <div className="relative">
                            <Logo className="w-12 h-12 drop-shadow-xl" />
                            <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white tracking-tight">ONXY EDGE</h1>
                            <p className="text-[10px] text-slate-500 tracking-widest uppercase">IoT Energy Platform</p>
                        </div>
                    </div>

                    {/* Main message */}
                    <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <div>
                            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                                Welcome to the future of
                                <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                                    energy management
                                </span>
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                                Sign in to access your real-time energy dashboard, control devices, and optimize your power consumption.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {[
                                { icon: Activity, text: 'Real-time voltage, current & power monitoring' },
                                { icon: Shield, text: 'Smart alerts for anomalies and safety' },
                                { icon: BarChart3, text: 'Cost analytics with ₹ breakdown' },
                                { icon: Wifi, text: 'Remote relay control from anywhere' },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center gap-3 text-slate-400 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                                    style={{ transitionDelay: `${600 + i * 150}ms` }}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                        <item.icon className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <span className="text-sm">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom stats */}
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-xl font-bold text-white">230V</p>
                            <p className="text-[10px] text-slate-600 uppercase">Live Voltage</p>
                        </div>
                        <div className="w-px h-8 bg-slate-800" />
                        <div className="text-center">
                            <p className="text-xl font-bold text-emerald-400">Online</p>
                            <p className="text-[10px] text-slate-600 uppercase">System Status</p>
                        </div>
                        <div className="w-px h-8 bg-slate-800" />
                        <div className="text-center">
                            <p className="text-xl font-bold text-blue-400">0.4W</p>
                            <p className="text-[10px] text-slate-600 uppercase">Current Power</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel — Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950" />

                {/* Mobile back button */}
                <button
                    onClick={onBack}
                    className="lg:hidden absolute top-6 left-6 z-20 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                >
                    <ArrowLeft className="w-4 h-4 text-slate-400" />
                </button>

                {/* Mobile logo */}
                <div className="lg:hidden absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                    <Logo className="w-10 h-10 drop-shadow-md" />
                    <span className="font-bold text-white">ONXY EDGE</span>
                </div>

                <div className={`relative z-10 w-full max-w-md transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    {/* Card */}
                    <div className="bg-slate-900/80 border border-slate-800 shadow-2xl shadow-black/50 backdrop-blur-xl rounded-2xl p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                <Logo className="w-16 h-16 drop-shadow-2xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1">
                                {pendingVerification ? 'Verify Email' : authMode === 'signIn' ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="text-sm text-slate-400">
                                {pendingVerification
                                    ? 'Enter the code sent to your email'
                                    : authMode === 'signIn'
                                        ? 'Sign in to your ONXY EDGE dashboard'
                                        : 'Start monitoring your energy usage'}
                            </p>
                        </div>

                        {/* Error display */}
                        {error && (
                            <div className="mb-5 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-rose-400 leading-relaxed">{error}</p>
                            </div>
                        )}

                        {/* Verification form */}
                        {pendingVerification ? (
                            <form onSubmit={handleVerification} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Verification Code</label>
                                    <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        placeholder="Enter 6-digit code"
                                        className="w-full px-4 py-3 bg-slate-800/70 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-center text-lg tracking-widest"
                                        maxLength={6}
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading || verificationCode.length < 6}
                                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                                </button>
                            </form>
                        ) : (
                            <>
                                {/* OAuth buttons */}
                                <div className="space-y-3 mb-6">
                                    <button
                                        onClick={() => handleOAuth('oauth_google')}
                                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all font-medium text-sm"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Continue with Google
                                    </button>
                                    <button
                                        onClick={() => handleOAuth('oauth_microsoft')}
                                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all font-medium text-sm"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 21 21">
                                            <path fill="#f35325" d="M0 0h10v10H0z" />
                                            <path fill="#81bc06" d="M11 0h10v10H11z" />
                                            <path fill="#05a6f0" d="M0 11h10v10H0z" />
                                            <path fill="#ffba08" d="M11 11h10v10H11z" />
                                        </svg>
                                        Continue with Microsoft
                                    </button>
                                    <button
                                        onClick={() => handleOAuth('oauth_github')}
                                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all font-medium text-sm"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                        Continue with GitHub
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex-1 h-px bg-slate-800" />
                                    <span className="text-xs text-slate-600 font-medium">or continue with email</span>
                                    <div className="flex-1 h-px bg-slate-800" />
                                </div>

                                {/* Sign in / Sign up form */}
                                <form onSubmit={authMode === 'signIn' ? handleSignIn : handleSignUp} className="space-y-4">
                                    {authMode === 'signUp' && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                <input
                                                    type="text"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    placeholder="Your name"
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/70 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                required
                                                className="w-full pl-10 pr-4 py-3 bg-slate-800/70 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                className="w-full pl-10 pr-12 py-3 bg-slate-800/70 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading || !email || !password}
                                        className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        {isLoading
                                            ? (authMode === 'signIn' ? 'Signing in...' : 'Creating account...')
                                            : (authMode === 'signIn' ? 'Sign In' : 'Create Account')}
                                    </button>
                                </form>

                                {/* Toggle sign in / sign up */}
                                <div className="mt-6 text-center">
                                    <p className="text-sm text-slate-500">
                                        {authMode === 'signIn' ? "Don't have an account?" : 'Already have an account?'}
                                        <button
                                            onClick={switchMode}
                                            className="text-blue-400 hover:text-blue-300 font-medium ml-1 transition-colors"
                                        >
                                            {authMode === 'signIn' ? 'Sign up' : 'Sign in'}
                                        </button>
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Bottom info */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-600">Protected by enterprise-grade encryption</p>
                        <div className="flex items-center justify-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-[10px] text-slate-600">
                                <Shield className="w-3 h-3" />
                                <span>256-bit SSL</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-600">
                                <Zap className="w-3 h-3" />
                                <span>Firebase Secured</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
