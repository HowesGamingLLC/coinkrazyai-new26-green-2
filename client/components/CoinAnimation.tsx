import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins } from 'lucide-react';

interface Coin {
  id: number;
  x: number;
  y: number;
}

export const CoinAnimation: React.FC<{ trigger: boolean }> = ({ trigger }) => {
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    if (trigger) {
      const newCoins = Array.from({ length: 20 }).map((_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100 - 50,
        y: Math.random() * -100 - 50,
      }));
      setCoins(newCoins);
      
      const timer = setTimeout(() => {
        setCoins([]);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
      <AnimatePresence>
        {coins.map((coin) => (
          <motion.div
            key={coin.id}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
            animate={{ 
              opacity: 0, 
              scale: 1.5, 
              x: coin.x * 5, 
              y: coin.y * 5,
              rotate: 360
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute"
          >
            <Coins className="text-yellow-400 w-8 h-8 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
