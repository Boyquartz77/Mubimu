import React, { useState } from 'react';
import { X, Clock, Check, Sparkles } from 'lucide-react';

interface TimeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTime: (totalSeconds: number, tag: string) => void;
  currentDurationSeconds: number;
  currentTag: string;
}

const PRESET_OPTIONS = [
  { label: '1 min', seconds: 60, icon: '⚡' },
  { label: '3 min', seconds: 180, icon: '☕' },
  { label: '5 min', seconds: 300, icon: '🎯' },
  { label: '10 min', seconds: 600, icon: '🔥' },
  { label: '15 min', seconds: 900, icon: '💡' },
  { label: '25 min (Pomodoro)', seconds: 1500, icon: '🍅' },
  { label: '45 min', seconds: 2700, icon: '📚' },
  { label: '60 min (1 hora)', seconds: 3600, icon: '⏳' },
];

const TAG_OPTIONS = [
  'Estudio',
  'Trabajo',
  'Pomodoro',
  'Lectura',
  'Ejercicio',
  'Meditación',
  'Programación',
  'Libre',
];

export const TimeConfigModal: React.FC<TimeConfigModalProps> = ({
  isOpen,
  onClose,
  onSaveTime,
  currentDurationSeconds,
  currentTag,
}) => {
  const [hours, setHours] = useState(Math.floor(currentDurationSeconds / 3600));
  const [minutes, setMinutes] = useState(Math.floor((currentDurationSeconds % 3600) / 60));
  const [seconds, setSeconds] = useState(currentDurationSeconds % 60);
  const [selectedTag, setSelectedTag] = useState(currentTag || 'Estudio');

  if (!isOpen) return null;

  const handleApplyPreset = (presetSecs: number) => {
    setHours(Math.floor(presetSecs / 3600));
    setMinutes(Math.floor((presetSecs % 3600) / 60));
    setSeconds(presetSecs % 60);
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const total = hours * 3600 + minutes * 60 + seconds;
    if (total <= 0) {
      alert('Por favor selecciona una duración mayor a 0 segundos.');
      return;
    }
    onSaveTime(total, selectedTag);
    onClose();
  };

  const adjustValue = (type: 'h' | 'm' | 's', delta: number) => {
    if (type === 'h') setHours((prev) => Math.max(0, Math.min(23, prev + delta)));
    if (type === 'm') setMinutes((prev) => Math.max(0, Math.min(59, prev + delta)));
    if (type === 's') setSeconds((prev) => Math.max(0, Math.min(59, prev + delta)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Configurar Contrarreloj</h2>
              <p className="text-xs text-slate-400">Ajusta la duración exacta de tu sesión</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="space-y-6 mt-5">
          {/* Custom Time Spinners / Inputs */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Duración personalizada
            </label>
            <div className="flex items-center justify-center gap-3 sm:gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => adjustValue('h', 1)}
                  className="w-10 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold flex items-center justify-center transition-colors cursor-pointer"
                >
                  ▲
                </button>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                  className="w-16 h-14 bg-transparent text-center font-mono text-3xl font-bold text-amber-400 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 uppercase font-medium">Horas</span>
                <button
                  type="button"
                  onClick={() => adjustValue('h', -1)}
                  className="w-10 h-8 mt-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold flex items-center justify-center transition-colors cursor-pointer"
                >
                  ▼
                </button>
              </div>

              <span className="text-2xl font-bold text-slate-600 mb-6">:</span>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => adjustValue('m', 1)}
                  className="w-10 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold flex items-center justify-center transition-colors cursor-pointer"
                >
                  ▲
                </button>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-16 h-14 bg-transparent text-center font-mono text-3xl font-bold text-amber-400 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 uppercase font-medium">Minutos</span>
                <button
                  type="button"
                  onClick={() => adjustValue('m', -1)}
                  className="w-10 h-8 mt-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold flex items-center justify-center transition-colors cursor-pointer"
                >
                  ▼
                </button>
              </div>

              <span className="text-2xl font-bold text-slate-600 mb-6">:</span>

              {/* Seconds */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => adjustValue('s', 5)}
                  className="w-10 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold flex items-center justify-center transition-colors cursor-pointer"
                >
                  ▲
                </button>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-16 h-14 bg-transparent text-center font-mono text-3xl font-bold text-amber-400 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 uppercase font-medium">Segundos</span>
                <button
                  type="button"
                  onClick={() => adjustValue('s', -5)}
                  className="w-10 h-8 mt-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold flex items-center justify-center transition-colors cursor-pointer"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Tiempos Rápidos Populares</span>
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_OPTIONS.map((item) => (
                <button
                  key={item.seconds}
                  type="button"
                  onClick={() => handleApplyPreset(item.seconds)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 hover:border-amber-400/40 text-xs font-medium text-slate-200 transition-all cursor-pointer text-center"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Activity Tag */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Etiqueta de Actividad
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TAG_OPTIONS.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950/40'
                        : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-950/50 cursor-pointer active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Establecer Tiempo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
