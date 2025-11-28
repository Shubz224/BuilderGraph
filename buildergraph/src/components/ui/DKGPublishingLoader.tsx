import React, { useEffect, useState } from 'react';

interface DKGPublishingLoaderProps {
    message?: string;
    progress?: number;
}

const DKGPublishingLoader: React.FC<DKGPublishingLoaderProps> = ({
    message = 'Publishing to Decentralized Knowledge Graph',
    progress = 0
}) => {
    const [dots, setDots] = useState('');
    const [nodes, setNodes] = useState<{ x: number; y: number; id: number }[]>([]);

    // Animated dots
    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Generate random nodes for network visualization
    useEffect(() => {
        const generateNodes = () => {
            const nodeCount = 12;
            const newNodes = Array.from({ length: nodeCount }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
            }));
            setNodes(newNodes);
        };

        generateNodes();
    }, []);

    return (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="relative w-full max-w-2xl px-8">
                {/* Network Visualization */}
                <div className="relative h-80 mb-12">
                    {/* Glow effect */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                    </div>

                    {/* DKG Network Nodes */}
                    <div className="relative h-full">
                        {nodes.map((node, index) => (
                            <React.Fragment key={node.id}>
                                {/* Connection lines */}
                                {index < nodes.length - 1 && (
                                    <svg
                                        className="absolute inset-0 pointer-events-none"
                                        style={{ zIndex: 0 }}
                                    >
                                        <line
                                            x1={`${node.x}%`}
                                            y1={`${node.y}%`}
                                            x2={`${nodes[index + 1].x}%`}
                                            y2={`${nodes[index + 1].y}%`}
                                            stroke="url(#gradient)"
                                            strokeWidth="1"
                                            opacity="0.3"
                                            className="animate-pulse"
                                            style={{
                                                animationDelay: `${index * 0.1}s`,
                                                animationDuration: '2s',
                                            }}
                                        />
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#8b5cf6" />
                                                <stop offset="100%" stopColor="#06b6d4" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                )}

                                {/* Node */}
                                <div
                                    className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/50 animate-pulse"
                                    style={{
                                        left: `${node.x}%`,
                                        top: `${node.y}%`,
                                        transform: 'translate(-50%, -50%)',
                                        animationDelay: `${index * 0.15}s`,
                                        animationDuration: `${2 + Math.random()}s`,
                                    }}
                                >
                                    <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                                </div>
                            </React.Fragment>
                        ))}

                        {/* Central node - larger */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[gradient_3s_linear_infinite] shadow-2xl shadow-primary/50 flex items-center justify-center">
                                    <svg
                                        className="w-8 h-8 text-white animate-spin"
                                        style={{ animationDuration: '3s' }}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                </div>
                                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Text Content */}
                <div className="text-center space-y-6">
                    <h2 className="text-3xl font-bold text-text-primary">
                        {message}
                        <span className="inline-block w-8 text-left">{dots}</span>
                    </h2>

                    <p className="text-text-secondary text-lg">
                        Your data is being published to the OriginTrail DKG
                    </p>

                    {/* Progress indicator */}
                    {progress > 0 && (
                        <div className="max-w-md mx-auto">
                            <div className="h-2 bg-background-elevated rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-text-muted text-sm mt-2">{Math.round(progress)}% complete</p>
                        </div>
                    )}

                    {/* Status messages */}
                    <div className="space-y-2 text-sm text-text-secondary">
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                            <span>Creating Knowledge Asset...</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary/50" />
                            <span>Generating UAL...</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary/50" />
                            <span>Publishing to network...</span>
                        </div>
                    </div>

                    <p className="text-text-muted text-sm italic">
                        This usually takes 30-60 seconds
                    </p>
                </div>
            </div>

            {/* Particle effects overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-accent/30"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `float ${3 + Math.random() * 3}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 2}s`,
                        }}
                    />
                ))}
            </div>

            <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
          50% { transform: translateY(-30px) translateX(10px); opacity: 0.5; }
        }
      `}</style>
        </div>
    );
};

export { DKGPublishingLoader };
