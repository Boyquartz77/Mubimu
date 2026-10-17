import React, { useState, useEffect } from 'react';
import { TimerStatus } from '../types';

interface EmojiAvatarProps {
  status: TimerStatus;
  remainingSeconds: number;
  totalDurationSeconds: number;
  isAngryMubimu: boolean;
  isFinishedJustNow: boolean; // true during the 5s window right after finishing
  isPostFinishedRestored: boolean; // true after 5s have passed (normal face)
  onTapEmoji: () => void;
}

export const EmojiAvatar: React.FC<EmojiAvatarProps> = ({
  status,
  remainingSeconds,
  totalDurationSeconds,
  isAngryMubimu,
  isFinishedJustNow,
  isPostFinishedRestored,
  onTapEmoji,
}) => {
  const [clickScale, setClickScale] = useState(false);

  const handleClick = () => {
    setClickScale(true);
    setTimeout(() => setClickScale(false), 200);
    onTapEmoji();
  };

  // Calculate frustration progress
  let ratio = 1;
  if (totalDurationSeconds > 0) {
    ratio = Math.max(0, Math.min(1, remainingSeconds / totalDurationSeconds));
  }

  // Determine current emotion state
  let currentEmoji = '😊';
  let moodLabel = 'Tranquilo';
  let moodDescription = 'Todo bajo control';
  let auraColor = 'from-emerald-500/20 via-teal-500/10 to-transparent';
  let borderColor = 'border-emerald-500/30';
  let shakeClass = '';
  let scaleEffect = 'scale-100';

  if (isAngryMubimu) {
    currentEmoji = '😡';
    moodLabel = '¡MUBIMU!';
    moodDescription = '¡No me toques! 💢';
    auraColor = 'from-red-600/50 via-rose-500/30 to-amber-500/20';
    borderColor = 'border-red-500';
    shakeClass = 'animate-bounce';
    scaleEffect = 'scale-110';
  } else if (isFinishedJustNow) {
    currentEmoji = '🚨';
    moodLabel = '¡TIEMPO AGOTADO!';
    moodDescription = '¡Alarma activada! Sonando...';
    auraColor = 'from-amber-500/60 via-red-500/40 to-transparent';
    borderColor = 'border-amber-400';
    shakeClass = 'animate-pulse';
    scaleEffect = 'scale-110';
  } else if (isPostFinishedRestored) {
    currentEmoji = '🥰';
    moodLabel = '¡Misión Cumplida!';
    moodDescription = 'Completado con éxito';
    auraColor = 'from-amber-400/30 via-emerald-400/20 to-transparent';
    borderColor = 'border-amber-400/40';
    shakeClass = '';
    scaleEffect = 'scale-105';
  } else if (status === 'idle') {
    currentEmoji = '😊';
    moodLabel = 'Listo para empezar';
    moodDescription = 'Configura el tiempo y presiona Iniciar';
    auraColor = 'from-sky-500/20 via-indigo-500/10 to-transparent';
    borderColor = 'border-sky-500/30';
  } else {
    // Running or paused
    if (ratio > 0.75) {
      currentEmoji = '😊';
      moodLabel = 'Relajado';
      moodDescription = 'El tiempo recién comienza';
      auraColor = 'from-emerald-500/25 via-teal-500/15 to-transparent';
      borderColor = 'border-emerald-500/40';
    } else if (ratio > 0.5) {
      currentEmoji = '🤨';
      moodLabel = 'Atento';
      moodDescription = 'El reloj no se detiene...';
      auraColor = 'from-yellow-500/25 via-amber-500/15 to-transparent';
      borderColor = 'border-yellow-500/40';
    } else if (ratio > 0.25) {
      currentEmoji = '😰';
      moodLabel = 'Estresado';
      moodDescription = '¡Queda menos de la mitad!';
      auraColor = 'from-orange-500/30 via-amber-600/20 to-transparent';
      borderColor = 'border-orange-500/50';
      shakeClass = 'hover:animate-pulse';
    } else if (ratio > 0.1) {
      currentEmoji = '😫';
      moodLabel = '¡Muy Frustrado!';
      moodDescription = '¡Acelera, queda poquísimo tiempo!';
      auraColor = 'from-rose-500/40 via-red-500/25 to-transparent';
      borderColor = 'border-rose-500/70';
      shakeClass = 'animate-pulse';
    } else {
      currentEmoji = '🤯';
      moodLabel = '¡PÁNICO TOTAL!';
      moodDescription = '¡¡¡SE ACABA EL TIEMPOOOO!!!';
      auraColor = 'from-red-600/60 via-purple-600/40 to-transparent';
      borderColor = 'border-red-500';
      shakeClass = 'animate-bounce';
      scaleEffect = 'scale-105';
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-2">
      {/* Speech bubble for "mubimu" or status */}
      {isAngryMubimu && (
        <div className="absolute -top-14 z-30 animate-bounce">
          <div className="relative bg-gradient-to-r from-red-600 to-amber-600 text-white font-extrabold text-base md:text-lg px-4 py-2 rounded-2xl shadow-xl shadow-red-950/60 border border-amber-300 flex items-center gap-1.5 whitespace-nowrap">
            <span>🗣️</span>
            <span>¡MUBIMU!</span>
            <span className="text-xl">💢</span>
            {/* Bubble arrow pointing down */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-amber-600"></div>
          </div>
        </div>
      )}

      {/* Floating hints when idle */}
      {status === 'idle' && !isAngryMubimu && (
        <div className="absolute -top-7 text-xs font-medium text-slate-400 bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 px-3 py-1 rounded-full shadow-sm">
          💡 Tócame para escucharme
        </div>
      )}

      {/* Glowing aura background */}
      <div
        className={`absolute w-56 h-56 md:w-64 md:h-64 rounded-full bg-gradient-radial ${auraColor} blur-2xl transition-all duration-700 pointer-events-none`}
      />

      {/* Circular emoji container */}
      <button
        onClick={handleClick}
        type="button"
        title="Toca para decir mubimu y enojarse"
        aria-label="Tocar emoji"
        className={`relative z-10 w-44 h-44 md:w-56 md:h-56 rounded-full bg-slate-900/90 border-4 ${borderColor} backdrop-blur-xl shadow-2xl flex items-center justify-center cursor-pointer transition-all duration-300 transform active:scale-95 hover:scale-105 ${clickScale ? 'scale-90 ring-4 ring-red-400' : ''} ${scaleEffect} ${shakeClass}`}
      >
        {/* Visual sweat drops or effects according to frustration */}
        {ratio <= 0.25 && status === 'running' && !isAngryMubimu && (
          <div className="absolute -top-2 right-4 text-2xl md:text-3xl animate-bounce">
            💦
          </div>
        )}
        {ratio <= 0.1 && status === 'running' && !isAngryMubimu && (
          <div className="absolute -top-3 left-4 text-2xl md:text-3xl animate-pulse">
            🔥
          </div>
        )}
        {isAngryMubimu && (
          <>
            <div className="absolute -top-3 right-6 text-2xl animate-pulse">💢</div>
            <div className="absolute top-4 left-4 text-2xl animate-bounce">😤</div>
          </>
        )}
        {isPostFinishedRestored && (
          <div className="absolute -top-3 -right-2 text-2xl animate-spin">✨</div>
        )}

        {/* Big Emoji Character */}
        <span
          className="text-7xl md:text-8xl filter drop-shadow-lg transition-transform duration-200 select-none"
          role="img"
          aria-label={moodLabel}
        >
          {currentEmoji}
        </span>
      </button>

      {/* Mood tag and description */}
      <div className="mt-4 text-center z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs md:text-sm font-bold tracking-wide uppercase bg-slate-900/80 border border-slate-700/80 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span className="text-slate-200">{moodLabel}</span>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-xs h-4">
          {moodDescription}
        </p>
      </div>
    </div>
  );
};
