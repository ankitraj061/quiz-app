'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
}

export const Timer = ({ duration, onTimeUp }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isWarning = timeLeft <= 60;
  const isDanger = timeLeft <= 30;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-soft ${
        isDanger
          ? 'bg-destructive text-destructive-foreground'
          : isWarning
          ? 'bg-warning text-warning-foreground'
          : 'bg-primary text-primary-foreground'
      }`}
    >
      <Clock className="h-5 w-5" />
      <span className="text-lg">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};
