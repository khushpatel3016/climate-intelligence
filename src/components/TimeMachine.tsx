import React from 'react';
import { motion } from 'motion/react';
import { History, Clock, FastForward } from 'lucide-react';
import { cn } from '../lib/utils';

interface TimeMachineProps {
  currentPeriod: 'past' | 'present' | 'future';
  onPeriodChange: (period: 'past' | 'present' | 'future') => void;
}

export const TimeMachine: React.FC<TimeMachineProps> = ({ currentPeriod, onPeriodChange }) => {
  const periods = [
    { id: 'past', label: '1900-1950', icon: History, color: 'text-blue-400' },
    { id: 'present', label: 'Current Era', icon: Clock, color: 'text-emerald-400' },
    { id: 'future', label: '2050 Projection', icon: FastForward, color: 'text-orange-400' },
  ] as const;

  return (
    <div className="flex items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-2xl">
      {periods.map((period) => {
        const Icon = period.icon;
        const isActive = currentPeriod === period.id;
        
        return (
          <button
            key={period.id}
            onClick={() => onPeriodChange(period.id)}
            className={cn(
              "relative flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 group",
              isActive ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-period"
                className="absolute inset-0 bg-white/5 rounded-xl border border-white/10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon size={16} className={cn("z-10", isActive ? period.color : "opacity-50")} />
            <span className="text-xs font-mono uppercase tracking-widest z-10">{period.label}</span>
          </button>
        );
      })}
    </div>
  );
};
