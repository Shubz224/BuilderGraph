import React, { useEffect, useState } from 'react';

interface SuccessCelebrationProps {
    title?: string;
    message?: string;
    ual?: string;
    onComplete?: () => void;
    autoRedirectSeconds?: number;
}

const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({
    title = 'Profile Created!',
    message = 'Hey Developer, your profile is created!',
    ual,
    onComplete,
    autoRedirectSeconds = 3,
}) => {
    const [countdown, setCountdown] = useState(autoRedirectSeconds);
    const [copied, setCopied] = useState(false);
    const [confetti, setConfetti] = useState<
        Array<{ id: number; x: number; y: number; rotation: number; color: string; delay: number }>
    >([]);

    // Generate confetti particles
    useEffect(() => {
        const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
        const particles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: -10,
            rotation: Math.random() * 360,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 0.5,
        }));
        setConfetti(particles);
    }, []);

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (onComplete) {
            onComplete();
        }
    }, [countdown, onComplete]);

    const copyUAL = () => {
        if (ual) {
            navigator.clipboard.writeText(ual);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-background-elevated z-50 flex items-center justify-center overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
            </div>

            {/* Confetti */}
            {confetti.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute w-3 h-3 rounded"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        backgroundColor: particle.color,
                        transform: `rotate(${particle.rotation}deg)`,
                        animation: `confettiFall ${2 + Math.random() * 2}s ease-out forwards`,
                        animationDelay: `${particle.delay}s`,
                    }}
                />
            ))}

            {/* Content */}
            <div className="relative z-10 text-center space-y-8 px-8 max-w-2xl">
                {/* Success Icon with animation */}
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-2xl opacity-50 animate-pulse" />
                    <div className="relative bg-gradient-to-r from-primary to-accent p-8 rounded-full">
                        <svg
                            className="w-24 h-24 text-white animate-[checkmark_0.6s_ease-out]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                                className="animate-[draw_0.6s_ease-out_forwards]"
                                style={{
                                    strokeDasharray: 24,
                                    strokeDashoffset: 24,
                                }}
                            />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-5xl font-bold text-text-primary animate-[slideUp_0.5s_ease-out]">
                    {title}
                </h1>

                {/* Message */}
                <p className="text-2xl text-text-secondary animate-[slideUp_0.5s_ease-out_0.1s_backwards]">
                    {message}
                </p>

                {/* UAL Display */}
                {ual && (
                    <div className="animate-[slideUp_0.5s_ease-out_0.2s_backwards]">
                        <div className="bg-background-card border border-white/10 rounded-xl p-6 space-y-3">
                            <p className="text-text-secondary text-sm font-medium">Your Universal Asset Locator (UAL)</p>
                            <div className="flex items-center gap-3">
                                <code className="flex-1 bg-background-elevated px-4 py-3 rounded-lg text-accent text-sm font-mono overflow-x-auto">
                                    {ual}
                                </code>
                                <button
                                    onClick={copyUAL}
                                    className="px-4 py-3 rounded-lg bg-primary hover:bg-primary/80 text-white transition-all hover:scale-105 active:scale-95"
                                    title="Copy UAL"
                                >
                                    {copied ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <p className="text-text-muted text-xs">
                                Your profile is now verifiable on the DKG! View it on{' '}
                                <a
                                    href={`https://dkg-testnet.origintrail.io/explore?ual=${encodeURIComponent(ual)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-accent hover:underline"
                                >
                                    DKG Explorer →
                                </a>
                            </p>
                        </div>
                    </div>
                )}

                {/* Countdown */}
                <div className="animate-[slideUp_0.5s_ease-out_0.3s_backwards]">
                    <div className="inline-block px-6 py-3 bg-background-elevated rounded-full border border-white/10">
                        <p className="text-text-secondary">
                            Redirecting to dashboard in{' '}
                            <span className="font-bold text-accent text-xl">{countdown}</span>
                            {' '}second{countdown !== 1 ? 's' : ''}...
                        </p>
                    </div>
                </div>

                {/* Manual redirect button */}
                <button
                    onClick={onComplete}
                    className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 animate-[slideUp_0.5s_ease-out_0.4s_backwards]"
                >
                    Go to Dashboard Now →
                </button>
            </div>

            <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes checkmark {
          0% {
            transform: scale(0) rotate(-45deg);
          }
          50% {
            transform: scale(1.2) rotate(5deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
};

export { SuccessCelebration };
