import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TimerStatus, AlarmConfig, SessionRecord } from './types';
import { EmojiAvatar } from './components/EmojiAvatar';
import { TimerDisplay } from './components/TimerDisplay';
import { TimerControls } from './components/TimerControls';
import { TimeConfigModal } from './components/TimeConfigModal';
import { AlarmSettingsModal } from './components/AlarmSettingsModal';
import { HistoryAndStats } from './components/HistoryAndStats';
import { SuccessNotification } from './components/SuccessNotification';
import { playMubimuSound, playAlarmSound, stopCurrentAlarm } from './utils/audio';
import {
  loadSavedSessions,
  saveSession,
  loadAlarmConfig,
  saveAlarmConfig,
  loadLastTimerDuration,
  saveLastTimerDuration,
} from './utils/storage';
import { Bell, Clock, Volume2, Sparkles, HelpCircle } from 'lucide-react';

export default function App() {
  // Timer settings
  const [totalDurationSeconds, setTotalDurationSeconds] = useState<number>(() => loadLastTimerDuration(1500));
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => loadLastTimerDuration(1500));
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [currentTag, setCurrentTag] = useState<string>('Estudio');

  // Emoji touch state (mubimu + angry for 2 seconds)
  const [isAngryMubimu, setIsAngryMubimu] = useState<boolean>(false);
  const angryTimeoutRef = useRef<number | null>(null);

  // Post-finish 5-second states
  const [isFinishedJustNow, setIsFinishedJustNow] = useState<boolean>(false);
  const [isPostFinishedRestored, setIsPostFinishedRestored] = useState<boolean>(false);
  const [postFinishCountdown, setPostFinishCountdown] = useState<number>(5);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  // Modals
  const [isTimeModalOpen, setIsTimeModalOpen] = useState<boolean>(false);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Saved Data
  const [alarmConfig, setAlarmConfig] = useState<AlarmConfig>(loadAlarmConfig);
  const [sessions, setSessions] = useState<SessionRecord[]>(loadSavedSessions);

  // Refs for accurate timing
  const timerIntervalRef = useRef<number | null>(null);
  const postFinishIntervalRef = useRef<number | null>(null);
  const targetEndTimeRef = useRef<number | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (postFinishIntervalRef.current) clearInterval(postFinishIntervalRef.current);
      if (angryTimeoutRef.current) clearTimeout(angryTimeoutRef.current);
      stopCurrentAlarm();
    };
  }, []);

  /**
   * Tap Emoji Handler:
   * "Y que al tocarlo diga mubimu y ponga cara enojada por dos segundos."
   */
  const handleEmojiTap = useCallback(() => {
    // Play sound and voice
    playMubimuSound(alarmConfig.volume);

    // Set angry face
    setIsAngryMubimu(true);

    if (angryTimeoutRef.current) {
      clearTimeout(angryTimeoutRef.current);
    }

    // Reset back to normal/timer state after exactly 2 seconds
    angryTimeoutRef.current = window.setTimeout(() => {
      setIsAngryMubimu(false);
      angryTimeoutRef.current = null;
    }, 2000);
  }, [alarmConfig.volume]);

  /**
   * Finish Handler:
   * When countdown hits 0s:
   * 1. Rings alarm
   * 2. Sets isFinishedJustNow = true (alarm emoji)
   * 3. Counts 5 seconds
   * 4. After 5 seconds: restores normal emoji face, stops alarm, shows success notification, saves session to history
   */
  const handleTimerFinish = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setStatus('finished');
    setRemainingSeconds(0);
    setIsFinishedJustNow(true);
    setIsPostFinishedRestored(false);
    setPostFinishCountdown(5);

    // Play configured alarm sound
    playAlarmSound(alarmConfig);

    // Start 5-second countdown to restore normal emoji and show success
    let remainingPostSecs = 5;
    if (postFinishIntervalRef.current) clearInterval(postFinishIntervalRef.current);

    postFinishIntervalRef.current = window.setInterval(() => {
      remainingPostSecs -= 1;
      setPostFinishCountdown(remainingPostSecs);

      if (remainingPostSecs <= 0) {
        if (postFinishIntervalRef.current) {
          clearInterval(postFinishIntervalRef.current);
          postFinishIntervalRef.current = null;
        }

        // Stop alarm sound
        stopCurrentAlarm();

        // 5 seconds elapsed: restore normal face!
        setIsFinishedJustNow(false);
        setIsPostFinishedRestored(true);

        // Show success notification
        setShowSuccessToast(true);

        // Save session to history & daily stats
        const newRecord = saveSession(totalDurationSeconds, currentTag);
        setSessions((prev) => [newRecord, ...prev.filter((s) => s.id !== newRecord.id)]);
      }
    }, 1000);
  }, [alarmConfig, totalDurationSeconds, currentTag]);

  /**
   * Start Timer
   */
  const handleStart = () => {
    if (status === 'finished') {
      // If was finished, reset to duration first
      setRemainingSeconds(totalDurationSeconds);
      setIsPostFinishedRestored(false);
      setIsFinishedJustNow(false);
      setShowSuccessToast(false);
    }

    setStatus('running');
    setIsPostFinishedRestored(false);
    setIsFinishedJustNow(false);

    // Use timestamp offset for accurate ticks
    targetEndTimeRef.current = Date.now() + (remainingSeconds > 0 ? remainingSeconds : totalDurationSeconds) * 1000;

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = window.setInterval(() => {
      if (!targetEndTimeRef.current) return;
      const msLeft = targetEndTimeRef.current - Date.now();
      const secsLeft = Math.max(0, Math.ceil(msLeft / 1000));

      setRemainingSeconds(secsLeft);

      if (secsLeft <= 0) {
        handleTimerFinish();
      }
    }, 250);
  };

  /**
   * Pause Timer
   */
  const handlePause = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setStatus('paused');
  };

  /**
   * Stop Timer
   * Returns counter back to initial duration and stops all sounds
   */
  const handleStop = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (postFinishIntervalRef.current) {
      clearInterval(postFinishIntervalRef.current);
      postFinishIntervalRef.current = null;
    }
    stopCurrentAlarm();
    setStatus('idle');
    setRemainingSeconds(totalDurationSeconds);
    setIsFinishedJustNow(false);
    setIsPostFinishedRestored(false);
    setShowSuccessToast(false);
  };

  /**
   * Restart Timer (Empezar de nuevo)
   */
  const handleRestart = () => {
    handleStop();
    setRemainingSeconds(totalDurationSeconds);
    // Automatically trigger start
    setTimeout(() => {
      targetEndTimeRef.current = Date.now() + totalDurationSeconds * 1000;
      setStatus('running');
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      timerIntervalRef.current = window.setInterval(() => {
        if (!targetEndTimeRef.current) return;
        const msLeft = targetEndTimeRef.current - Date.now();
        const secsLeft = Math.max(0, Math.ceil(msLeft / 1000));

        setRemainingSeconds(secsLeft);

        if (secsLeft <= 0) {
          handleTimerFinish();
        }
      }, 250);
    }, 50);
  };

  /**
   * Add extra seconds on the fly
   */
  const handleAddSeconds = (extraSecs: number) => {
    const updated = remainingSeconds + extraSecs;
    const updatedTotal = totalDurationSeconds + extraSecs;
    setRemainingSeconds(updated);
    setTotalDurationSeconds(updatedTotal);

    if (status === 'running') {
      targetEndTimeRef.current = (targetEndTimeRef.current || Date.now()) + extraSecs * 1000;
    }
  };

  /**
   * Save configured time from modal
   */
  const handleSaveConfiguredTime = (newTotalSeconds: number, tag: string) => {
    handleStop();
    setTotalDurationSeconds(newTotalSeconds);
    setRemainingSeconds(newTotalSeconds);
    setCurrentTag(tag);
    saveLastTimerDuration(newTotalSeconds);
  };

  /**
   * Save alarm settings
   */
  const handleSaveAlarmConfig = (newConfig: AlarmConfig) => {
    setAlarmConfig(newConfig);
    saveAlarmConfig(newConfig);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (status === 'running') handlePause();
        else handleStart();
      } else if (e.key === 'r' || e.key === 'R') {
        handleRestart();
      } else if (e.key === 's' || e.key === 'S') {
        handleStop();
      } else if (e.key === 'm' || e.key === 'M') {
        handleEmojiTap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, remainingSeconds, totalDurationSeconds, handleEmojiTap]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Navigation Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between pb-4 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleEmojiTap}
            className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            title="¡Tócame para decir mubimu!"
          >
            😜
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              Mubimu Timer
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Emoji interactivo contrarreloj con frustración progresiva
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Tag Pill */}
          <button
            type="button"
            onClick={() => setIsTimeModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium transition-colors cursor-pointer"
            title="Cambiar categoría"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>{currentTag}</span>
          </button>

          {/* Alarm Config Button */}
          <button
            type="button"
            onClick={() => setIsAlarmModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            title="Personalizar sonido de alarma"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Alarma</span>
          </button>

          {/* Time Picker Button */}
          <button
            type="button"
            onClick={() => setIsTimeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            title="Configurar tiempo del temporizador"
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Ajustar tiempo</span>
          </button>

          {/* Help Tooltip */}
          <button
            type="button"
            onClick={() => setIsHelpOpen(!isHelpOpen)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title="Información y atajos"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Help info banner if opened */}
      {isHelpOpen && (
        <div className="w-full max-w-4xl mt-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-start justify-between gap-3 animate-fadeIn">
          <div className="space-y-1">
            <p className="font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>¿Cómo funciona Mubimu Timer?</span>
            </p>
            <p>
              • <strong>Toca el emoji</strong> en cualquier momento: gritará <em>"¡MUBIMU!"</em> y se pondrá enojado por 2 segundos.
            </p>
            <p>
              • A medida que el tiempo se agote, el emoji se frustrará más y más hasta entrar en pánico extremo.
            </p>
            <p>
              • Al finalizar, sonará tu alarma y tras <strong>5 segundos</strong> volverá a su cara normal con una notificación de éxito.
            </p>
            <p className="text-slate-400 pt-1">
              Atajos de teclado: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px] text-amber-300">Espacio</kbd> Iniciar/Pausar • <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px] text-amber-300">R</kbd> Reiniciar • <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px] text-amber-300">S</kbd> Detener • <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px] text-amber-300">M</kbd> Mubimu
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsHelpOpen(false)}
            className="text-slate-500 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* CENTER STAGE: Emoji Avatar and Monospace Counter */}
      <main className="w-full flex-1 flex flex-col items-center justify-center py-6 sm:py-10">
        {/* Post-finish 5s counter banner */}
        {isFinishedJustNow && (
          <div className="mb-3 px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-mono font-bold flex items-center gap-2 animate-pulse">
            <span>⏰ ¡Tiempo terminado! Restableciendo en {postFinishCountdown}s...</span>
            <button
              type="button"
              onClick={() => {
                stopCurrentAlarm();
                setIsFinishedJustNow(false);
                setIsPostFinishedRestored(true);
                setShowSuccessToast(true);
              }}
              className="underline text-amber-300 hover:text-white cursor-pointer ml-1"
            >
              Silenciar ya
            </button>
          </div>
        )}

        {/* 1. Emoji in the center of the screen */}
        <EmojiAvatar
          status={status}
          remainingSeconds={remainingSeconds}
          totalDurationSeconds={totalDurationSeconds}
          isAngryMubimu={isAngryMubimu}
          isFinishedJustNow={isFinishedJustNow}
          isPostFinishedRestored={isPostFinishedRestored}
          onTapEmoji={handleEmojiTap}
        />

        {/* 2. Counter below the emoji */}
        <TimerDisplay
          remainingSeconds={remainingSeconds}
          totalDurationSeconds={totalDurationSeconds}
          status={status}
          onOpenTimeSelector={() => setIsTimeModalOpen(true)}
        />

        {/* 3. Action Buttons (Play/Pause, Stop, Restart, Add Time) */}
        <TimerControls
          status={status}
          onStart={handleStart}
          onPause={handlePause}
          onStop={handleStop}
          onRestart={handleRestart}
          onAddSeconds={handleAddSeconds}
        />
      </main>

      {/* 4. Daily History & Statistics Section */}
      <section className="w-full max-w-4xl">
        <HistoryAndStats
          sessions={sessions}
          onSessionsChange={(updated) => setSessions(updated)}
        />
      </section>

      {/* Footer */}
      <footer className="w-full max-w-4xl text-center py-6 text-xs text-slate-500 border-t border-slate-900 mt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span>Hecho para máxima concentración con humor</span>
          <span>•</span>
          <span className="text-amber-400 font-semibold">Mubimu Timer</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span>Sonido: {alarmConfig.soundId.replace('_', ' ')}</span>
          <span>•</span>
          <span>Volumen: {Math.round(alarmConfig.volume * 100)}%</span>
        </div>
      </footer>

      {/* MODALS & NOTIFICATIONS */}
      <TimeConfigModal
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        onSaveTime={handleSaveConfiguredTime}
        currentDurationSeconds={totalDurationSeconds}
        currentTag={currentTag}
      />

      <AlarmSettingsModal
        isOpen={isAlarmModalOpen}
        onClose={() => setIsAlarmModalOpen(false)}
        config={alarmConfig}
        onSaveConfig={handleSaveAlarmConfig}
      />

      <SuccessNotification
        isVisible={showSuccessToast}
        durationSeconds={totalDurationSeconds}
        tag={currentTag}
        onDismiss={() => setShowSuccessToast(false)}
        onRestartSame={() => {
          setShowSuccessToast(false);
          handleRestart();
        }}
      />
    </div>
  );
}
