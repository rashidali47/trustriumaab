import React, { useEffect } from 'react';

export const RewardAnimation: React.FC<{ amount: number; unit: string; onAnimationEnd: () => void }> = ({ amount, unit, onAnimationEnd }) => {
    const particles = Array.from({ length: 20 }); 

    useEffect(() => {
        const timer = setTimeout(onAnimationEnd, 2000); // Animation duration
        return () => clearTimeout(timer);
    }, [onAnimationEnd]);

    const formattedAmount = unit === '$RIUM' ? amount.toFixed(4) : amount.toFixed(2);

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden">
            {particles.map((_, i) => (
                <div
                    key={i}
                    className="absolute bottom-0 animate-reward-fly-up"
                    style={{
                        animationDelay: `${Math.random() * 0.5}s`,
                        left: `${Math.random() * 100}%`,
                    }}
                >
                    <div 
                        className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center text-amber-800 font-bold shadow-lg"
                        style={{
                            transform: `scale(${Math.random() * 0.5 + 0.5}) rotate(${Math.random() * 360}deg)`,
                        }}
                    >
                        {unit === '$RIUM' ? 'R' : 'T'}
                    </div>
                </div>
            ))}
            <div 
                className="absolute text-4xl font-bold animate-reward-text-pop"
                style={{ 
                    textShadow: '0 0 15px rgba(255, 223, 77, 0.8)',
                    color: '#FFDF4D',
                }}
            >
                +{formattedAmount} {unit}
            </div>
        </div>
    );
};
