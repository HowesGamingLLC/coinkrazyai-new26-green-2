import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Games = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-2xl mx-auto">
      <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4">
        <span className="text-4xl">🎮</span>
      </div>
      <h1 className="text-4xl font-bold tracking-tight">Game Library Coming Soon</h1>
      <p className="text-xl text-muted-foreground">
        Explore our comprehensive collection of premium games.
      </p>
      <div className="bg-muted p-6 rounded-xl border border-border w-full">
        <p className="text-sm font-medium mb-4 italic">
          "I am currently working on this module. Please continue prompting me to fill in the contents of this page if you want it next!" - LuckyAI
        </p>
        <Button onClick={() => navigate('/')}>Return to Lobby</Button>
      </div>
    </div>
  );
};

export default Games;
