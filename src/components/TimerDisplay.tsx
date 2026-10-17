import React from 'react';
import { TimerStatus } from '../types';

interface TimerDisplayProps {
  remainingSeconds: number;
  totalDurationSeconds: number;
  status: TimerStatus;
  onOpenTimeSelector: () => void;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  remainingSeconds,
  totalDurationSeconds,
  status,
  onOpenTimeSelector,
}) => {
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  const percentage =
    totalDurationSeconds > 0
      ? Math.max(0, Math.min(100, Math.round((remainingSeconds / totalDurationSeconds) * 100)))
      : 100;

  // Frustration accent colors
  let progressColor = 'bg-emerald-500';
  let textColor = 'text-white';
  let badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

  if (percentage <= 10) {
    progressColor = 'bg-red-600 animate-pulse';
    textColor = 'text-red-400';
    badgeColor = 'text-red-400 bg-red-500/20 border-red-500/40 animate-pulse';
  } else if (percentage <= 25) {
    progressColor = 'bg-orange-500';
    textColor = 'text-orange-400';
    badgeColor = 'text-orange-400 bg-orange-500/20 border-orange-500/40';
  } else if (percentage <= 50) {
    progressColor = 'bg-yellow-500';
    textColor = 'text-yellow-300';
    badgeColor = 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30';
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto my-3">
      {/* Time Display Button / Container */}
      <button
        type="button"
        onClick={() => {
          if (status === 'idle' || status === 'paused') {
            onOpenTimeSelector();
          }
        }}
        disabled={status === 'running'}
        className={`group relative flex flex-col items-center px-6 py-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md transition-all duration-200 ${
          status !== 'running'
            ? 'cursor-pointer hover:border-amber-400/50 hover:bg-slate-800/80 active:scale-98'
            : 'cursor-default'
        }`}
        title={status !== 'running' ? 'Haz clic para cambiar el tiempo' : 'Temporizador en curso'}
      >
        {/* Main numeric digits */}
        <div className="flex items-baseline font-mono tracking-tight text-5xl sm:text-6xl md:text-7xl font-extrabold select-none">
          {hours > 0 && (
            <>
              <span className={textColor}>{pad(hours)}</span>
              <span className="text-slate-500 mx-1 animate-pulse">:</span>
            </>
          )}
          <span className={textColor}>{pad(minutes)}</span>
          <span className="text-slate-500 mx-1 animate-pulse">:</span>
          <span className={textColor}>{pad(seconds)}</span>
        </div>

        {/* Edit hint when idle/paused */}
        {status !== 'running' && (
          <div className="mt-2 text-xs text-amber-400/90 font-medium flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            <span>Personalizar tiempo</span>
          </div>
        )}
      </button>

      {/* Progress bar */}
      <div className="w-full mt-4 px-2">
        <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-1.5">
          <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${badgeColor}`}>
            {percentage}% restante
          </span>
          <span className="text-slate-500">
            Total: {Math.floor(totalDurationSeconds / 60)}m {totalDurationSeconds % 60}s
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
          <div
            className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
