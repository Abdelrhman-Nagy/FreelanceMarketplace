import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

export function ProgressRing({ 
  value, 
  size = 120, 
  strokeWidth = 8, 
  className,
  children 
}: ProgressRingProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    const duration = 1500; // Animation duration in ms
    const steps = 60; // Number of animation steps
    const stepValue = value / steps;
    const stepTime = duration / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setAnimatedValue(Math.min(stepValue * currentStep, value));
      
      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [value, isVisible]);

  // Color based on completion percentage
  const getStrokeColor = (percentage: number) => {
    if (percentage >= 80) return "#10b981"; // green-500
    if (percentage >= 60) return "#f59e0b"; // amber-500
    if (percentage >= 40) return "#ef4444"; // red-500
    return "#6b7280"; // gray-500
  };

  const strokeColor = getStrokeColor(animatedValue);

  const shouldPulse = animatedValue < 50;

  const getProgressMessage = (percentage: number) => {
    if (percentage >= 90) return "Excellent! Your profile is almost complete.";
    if (percentage >= 70) return "Great progress! Just a few more details needed.";
    if (percentage >= 50) return "Good start! Complete your profile to attract more opportunities.";
    return "Complete your profile to get started and stand out to clients.";
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "relative inline-flex items-center justify-center cursor-pointer transition-transform hover:scale-105",
          shouldPulse && "animate-pulse",
          className
        )}>
          <svg
            width={size}
            height={size}
            className="transform -rotate-90 drop-shadow-sm"
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
              style={{
                filter: `drop-shadow(0 0 6px ${strokeColor}40)`,
              }}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {children || (
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(animatedValue)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Complete
                </div>
              </div>
            )}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs text-center">{getProgressMessage(animatedValue)}</p>
      </TooltipContent>
    </Tooltip>
  );
}