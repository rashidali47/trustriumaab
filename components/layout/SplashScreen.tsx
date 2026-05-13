
import React, { useContext } from 'react';
import { motion } from 'motion/react';
import { AppContext } from '../../contexts/AppContext';

const SplashScreen: React.FC = () => {
  const { theme } = useContext(AppContext);
  const isDark = theme === 'dark';

  const colors = {
    blue: '#3B82F6',
    orange: '#f36b24',
    green: '#22c55e',
    red: '#ef4444',
    lightBlue: '#60A5FA',
  };

  // Animation settings
  const dotCount = 5;
  const jumpHeight = 15; // Short jumps
  const startX = -200;
  const endX = 200;
  const yOffset = 20; // Positioned below the logo

  // Generate a jumping path from left to right
  const generateLinearPath = (delay: number) => {
    const numSteps = 15; // Number of jumps across the screen
    const x = [];
    const y = [];
    const s = [];

    for (let i = 0; i <= numSteps; i++) {
      const progress = i / numSteps;
      const currentX = startX + (endX - startX) * progress;
      
      // Landing point
      x.push(currentX);
      y.push(yOffset);
      s.push(1);

      if (i < numSteps) {
        // Peak of jump (midway to next landing)
        const midX = startX + (endX - startX) * (progress + 0.5 / numSteps);
        x.push(midX);
        y.push(yOffset - jumpHeight);
        s.push(1.2);
      }
    }

    return { x, y, s, delay };
  };

  const dots = [
    { color: colors.blue, ...generateLinearPath(0) },
    { color: colors.orange, ...generateLinearPath(0.2) },
    { color: colors.green, ...generateLinearPath(0.4) },
    { color: colors.red, ...generateLinearPath(0.6) },
    { color: colors.lightBlue, ...generateLinearPath(0.8) },
  ];

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-colors duration-500 ${isDark ? 'bg-brand-gray-950' : 'bg-white'}`}>
      <div className="relative flex flex-col items-center justify-center">
        
        {/* Central Logo */}
        <div className="relative z-10 mb-8">
          <img 
            src="https://raw.githubusercontent.com/Trustrium/Logos/refs/heads/main/splashscreen.png" 
            alt="Trustrium Logo" 
            className="w-[400px] h-[150px] object-contain"
          />
        </div>

        {/* Dancing Dots Container */}
        <div className="relative h-12 w-full flex items-center justify-center">
          {dots.map((dot, index) => (
            <motion.div
              key={index}
              className={`absolute w-4 h-4 rounded-full ${isDark ? 'shadow-lg' : 'shadow-md'}`}
              style={{ 
                backgroundColor: dot.color,
                backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent)',
                left: '50%',
                top: '50%',
                marginLeft: '-8px',
                marginTop: '-8px'
              }}
              animate={{ 
                x: dot.x, 
                y: dot.y, 
                scale: dot.s,
                opacity: [0, 1, 1, 0] 
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                delay: dot.delay,
                times: [0, 0.1, 0.9, 1],
                ease: "easeInOut" 
              }}
            />
          ))}
        </div>

        {/* Background Ambient Glow */}
        <div className={`absolute inset-0 rounded-full blur-3xl -z-10 transition-opacity duration-500 ${isDark ? 'bg-brand-blue/5 opacity-100' : 'bg-brand-blue/10 opacity-50'}`}></div>
      </div>
    </div>
  );
};

export default SplashScreen;












