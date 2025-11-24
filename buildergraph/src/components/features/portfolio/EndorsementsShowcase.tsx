import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { Star, Quote, ShieldCheck } from 'lucide-react';

interface Endorsement {
    id: string;
    endorser: string;
    skill: string;
    message: string;
    rating: number;
    stakeAmount: number;
}

interface EndorsementsShowcaseProps {
    endorsements: Endorsement[];
}

const EndorsementsShowcase: React.FC<EndorsementsShowcaseProps> = ({
    endorsements,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % Math.max(endorsements.length, 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [endorsements.length]);

    if (endorsements.length === 0) {
        return null;
    }

    const currentEndorsement = endorsements[currentIndex];

    return (
        <div className="mb-16">
            <h2 className="text-3xl font-bold text-text-primary mb-8 flex items-center gap-3">
                <span className="w-2 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
                Peer Endorsements
            </h2>

            <Card className="relative overflow-hidden border-primary/20">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Quote className="w-32 h-32 text-primary" />
                </div>

                <div className="relative z-10 min-h-[240px] flex flex-col justify-between">
                    {/* Rating Stars */}
                    <div className="flex gap-1 mb-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={`w-5 h-5 ${i < currentEndorsement.rating
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-white/10 fill-white/5'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Message */}
                    <p className="text-xl text-text-primary leading-relaxed mb-8 italic font-light">
                        "{currentEndorsement.message}"
                    </p>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row justify-between items-end gap-4 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                                {currentEndorsement.endorser.charAt(0)}
                            </div>
                            <div>
                                <p className="font-semibold text-text-primary">
                                    {currentEndorsement.endorser}
                                </p>
                                <p className="text-text-secondary text-sm">
                                    Endorsed: <span className="text-accent font-medium">{currentEndorsement.skill}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full border border-accent/20">
                            <ShieldCheck className="w-4 h-4 text-accent" />
                            <span className="text-accent font-semibold text-sm">
                                {currentEndorsement.stakeAmount} TRAC Staked
                            </span>
                        </div>
                    </div>

                    {/* Carousel Indicators */}
                    <div className="flex gap-2 mt-8 justify-center">
                        {endorsements.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`
                  h-1.5 rounded-full transition-all duration-300
                  ${index === currentIndex
                                        ? 'w-8 bg-accent'
                                        : 'w-2 bg-white/20 hover:bg-white/40'
                                    }
                `}
                            />
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export { EndorsementsShowcase };
