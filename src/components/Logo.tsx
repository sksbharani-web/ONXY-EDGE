import React from 'react';

export function Logo({ className = "w-10 h-10" }: { className?: string }) {
    return (
        <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <defs>
                <linearGradient id="onxy-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563EB" /> {/* Blue 600 */}
                    <stop offset="100%" stopColor="#1E40AF" /> {/* Blue 800 */}
                </linearGradient>
                <linearGradient id="onxy-grad-dark" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E293B" /> {/* Slate 800 */}
                    <stop offset="100%" stopColor="#0F172A" /> {/* Slate 900 */}
                </linearGradient>
                <filter id="onxy-shadow" x="-10%" y="-10%" width="120%" height="130%">
                    <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.15" />
                </filter>
            </defs>

            {/* Base sharp geometric shape representing 'Edge' and stability */}
            <g filter="url(#onxy-shadow)">
                <path d="M100 256 L256 100 L412 256 L256 412 Z" fill="url(#onxy-grad-dark)" />
                <path d="M100 256 L256 100 L412 256 L256 412 Z" stroke="#334155" strokeWidth="8" strokeOpacity="0.5" />
            </g>

            {/* Inset energy core shape representing 'ONXY' power */}
            <path d="M160 256 L256 160 L352 256 L256 352 Z" fill="url(#onxy-grad-primary)" />

            {/* Sharp cut 'Edge' overlay */}
            <path d="M256 160 L352 256 L256 352 L256 160 Z" fill="#ffffff" opacity="0.1" />

            {/* Abstract clean 'lightning' or data flow */}
            <path d="M265 190 L210 265 L255 265 L245 325 L305 245 L255 245 L265 190 Z" fill="#ffffff" />
        </svg>
    );
}
