'use client';

import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDuration, type DurationParts } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface TotalTimeDisplayProps {
  totalSeconds: number;
}

const AnimatedCounter: FC<{ value: number; label: string }> = ({ value, label }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const DURATION = 500; // ms
    const FRAMES_PER_SECOND = 60;
    const totalFrames = (DURATION / 1000) * FRAMES_PER_SECOND;
    let frame = 0;
    
    const startValue = prevValueRef.current;
    const endValue = value;
    const diff = endValue - startValue;

    if (diff === 0) {
      setDisplayValue(endValue); // No change, just set
      return;
    }

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const currentValue = startValue + diff * progress;
      
      setDisplayValue(Math.round(currentValue));

      if (frame === totalFrames) {
        clearInterval(counter);
        setDisplayValue(endValue); // Ensure final value is exact
        prevValueRef.current = endValue;
      }
    }, DURATION / totalFrames);

    return () => {
      clearInterval(counter);
      prevValueRef.current = endValue; // Store the target value if effect cleans up early
    };
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl md:text-5xl font-bold text-primary tabular-nums">
        {String(displayValue).padStart(2, '0')}
      </span>
      <span className="text-xs text-muted-foreground uppercase">{label}</span>
    </div>
  );
};

const TotalTimeDisplay: FC<TotalTimeDisplayProps> = ({ totalSeconds }) => {
  const [durationParts, setDurationParts] = useState<DurationParts>(formatDuration(totalSeconds));

  useEffect(() => {
    setDurationParts(formatDuration(totalSeconds));
  }, [totalSeconds]);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-semibold text-center flex items-center justify-center gap-2">
          <Clock className="h-7 w-7 text-accent" />
          Total BingeTime
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <AnimatedCounter value={durationParts.days} label="Days" />
          <AnimatedCounter value={durationParts.hours} label="Hours" />
          <AnimatedCounter value={durationParts.minutes} label="Minutes" />
          <AnimatedCounter value={durationParts.seconds} label="Seconds" />
        </div>
        {totalSeconds === 0 && (
          <p className="text-center text-muted-foreground mt-6">
            Start adding movies and shows to see your total watch time!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TotalTimeDisplay;
