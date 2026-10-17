import React, { useEffect } from 'react';
import { CheckCircle2, Sparkles, X, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SuccessNotificationProps {
  isVisible: boolean;
  durationSeconds: number;
  tag: string;
  onDismiss: () => void;
  onRestartSame: () => void;
}

export const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  isVisible,
  durationSeconds,
  tag,
  onDismiss,
  onRestartSame,
}) => {
  useEffect(() => {
    if (isVisible) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'],
        });
      } catch (e) {
        // canvas-confetti fallback
      }
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const timeText = minutes > 0 ? `${minutes} min ${seconds > 0 ? `${seconds}s` : ''}` : `${seconds}s`;

  return (
    <div className="fixed top-6 right-6 left-6 sm:left-auto sm:w-96 z-50 animate-bounce">
      <div className="bg-slate-900/95 border-2 border-emerald-500/80 rounded-2xl shadow-2xl shadow-emerald-950/60 p-4 backdrop-blur-xl flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm">¡Completado con Éxito!</span>
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Sesión de <span className="font-semibold text-amber-400">{timeText}</span> ({tag}) guardada en el historial.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
          <button
            type="button"
            onClick={onRestartSame}
            className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Repetir sesión</span>
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
