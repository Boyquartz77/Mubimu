import React from 'react';
import { TimerStatus } from '../types';
import { Play, Pause, Square, RotateCcw, Plus } from 'lucide-react';

interface TimerControlsProps {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onRestart: () => void;
  onAddSeconds: (seconds: number) => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  status,
  onStart,
  onPause,
  onStop,
  onRestart,
  onAddSeconds,
}) => {
  const isRunning = status === 'running';

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto mt-2">
      {/* Primary Action Buttons */}
      <div className="flex items-center justify-center gap-3 w-full">
        {/* Reiniciar / Empezar de nuevo */}
        <button
          type="button"
          onClick={onRestart}
          title="Empezar de nuevo (Reiniciar desde el inicio)"
          className="flex flex-col items-center justify-center w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 shadow-lg active:scale-95 transition-all duration-150 cursor-pointer group"
        >
          <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-amber-400 group-hover:-rotate-45 transition-transform" />
          <span className="text-[10px] sm:text-[11px] font-semibold mt-1">Reiniciar</span>
        </button>

        {/* Iniciar / Pausar (Main Big Button) */}
        {isRunning ? (
          <button
            type="button"
            onClick={onPause}
            title="Pausar el conteo"
            className="flex-1 max-w-[180px] h-16 sm:h-18 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-base sm:text-lg shadow-xl shadow-amber-950/40 border border-amber-300/40 flex items-center justify-center gap-2 active:scale-95 transition-all duration-150 cursor-pointer"
          >
            <Pause className="w-6 h-6 fill-current" />
            <span>Pausar</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onStart}
            title="Iniciar o continuar el conteo"
            className="flex-1 max-w-[180px] h-16 sm:h-18 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-base sm:text-lg shadow-xl shadow-emerald-950/40 border border-emerald-300/40 flex items-center justify-center gap-2 active:scale-95 transition-all duration-150 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-current translate-x-0.5" />
            <span>{status === 'paused' ? 'Continuar' : 'Empezar'}</span>
          </button>
        )}

        {/* Detener (Stop) */}
        <button
          type="button"
          onClick={onStop}
          title="Detener el conteo"
          className="flex flex-col items-center justify-center w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 shadow-lg active:scale-95 transition-all duration-150 cursor-pointer group"
        >
          <Square className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-red-400 transition-colors" />
          <span className="text-[10px] sm:text-[11px] font-semibold mt-1">Detener</span>
        </button>
      </div>

      {/* Quick Time Additions */}
      <div className="flex items-center justify-center gap-2 pt-1">
        <span className="text-xs text-slate-500 mr-1 hidden sm:inline">Añadir tiempo:</span>
        <button
          type="button"
          onClick={() => onAddSeconds(30)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-mono transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3 text-emerald-400" />
          <span>30s</span>
        </button>
        <button
          type="button"
          onClick={() => onAddSeconds(60)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-mono transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3 text-emerald-400" />
          <span>1m</span>
        </button>
        <button
          type="button"
          onClick={() => onAddSeconds(300)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-mono transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3 text-emerald-400" />
          <span>5m</span>
        </button>
      </div>
    </div>
  );
};
