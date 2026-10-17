import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Bell, Play, Square, Upload, Check, X, Music } from 'lucide-react';
import { AlarmConfig, AlarmSoundId } from '../types';
import { playAlarmSound, stopCurrentAlarm } from '../utils/audio';

interface AlarmSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AlarmConfig;
  onSaveConfig: (newConfig: AlarmConfig) => void;
}

interface SoundOption {
  id: AlarmSoundId;
  name: string;
  description: string;
  icon: string;
}

const SOUND_OPTIONS: SoundOption[] = [
  {
    id: 'gentle_chime',
    name: 'Campanadas Zen',
    description: 'Tonos relajantes y armónicos tipo vibráfono',
    icon: '🔔',
  },
  {
    id: 'digital_beep',
    name: 'Beep Digital Clásico',
    description: 'Ritmo digital nostálgico de reloj despertador',
    icon: '⏱️',
  },
  {
    id: 'retro_arcade',
    name: 'Alerta Arcade 8-Bit',
    description: 'Melodía rápida y alegre de juego clásico',
    icon: '👾',
  },
  {
    id: 'urgent_siren',
    name: 'Sirena de Emergencia',
    description: 'Tono oscilante de máxima urgencia',
    icon: '🚨',
  },
  {
    id: 'mubimu_party',
    name: 'Mubimu Fiesta',
    description: 'Melodía traviesa y animada con onda Mubimu',
    icon: '🎉',
  },
  {
    id: 'cosmic_gong',
    name: 'Gong Cósmico',
    description: 'Resonancia profunda estilo cuenco tibetano',
    icon: '🪐',
  },
  {
    id: 'custom_audio',
    name: 'Subir Sonido Propio',
    description: 'Sube un archivo de audio (MP3, WAV, OGG)',
    icon: '🎵',
  },
];

export const AlarmSettingsModal: React.FC<AlarmSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [selectedId, setSelectedId] = useState<AlarmSoundId>(config.soundId);
  const [volume, setVolume] = useState<number>(config.volume);
  const [repeatCount, setRepeatCount] = useState<number>(config.repeatCount || 3);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | undefined>(config.customAudioUrl);
  const [customAudioName, setCustomAudioName] = useState<string | undefined>(config.customAudioName);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop sound if modal closes
  useEffect(() => {
    return () => {
      stopCurrentAlarm();
    };
  }, []);

  if (!isOpen) return null;

  const handleTestSound = () => {
    if (isPlayingPreview) {
      stopCurrentAlarm();
      setIsPlayingPreview(false);
      return;
    }

    const testConfig: AlarmConfig = {
      soundId: selectedId,
      volume,
      repeatCount: 1, // play once for preview
      customAudioUrl,
      customAudioName,
    };

    setIsPlayingPreview(true);
    playAlarmSound(testConfig, () => {
      setIsPlayingPreview(false);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('Por favor selecciona un archivo de audio válido (MP3, WAV, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomAudioUrl(dataUrl);
      setCustomAudioName(file.name);
      setSelectedId('custom_audio');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    stopCurrentAlarm();
    setIsPlayingPreview(false);
    onSaveConfig({
      soundId: selectedId,
      volume,
      repeatCount,
      customAudioUrl,
      customAudioName,
    });
    onClose();
  };

  const handleCancel = () => {
    stopCurrentAlarm();
    setIsPlayingPreview(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Personalizar Alarma Sonora</h2>
              <p className="text-xs text-slate-400">Elige el sonido que sonará al terminar el tiempo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 mt-5">
          {/* Sounds list */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Tonos y Melodías Disponibles
            </label>
            <div className="space-y-2">
              {SOUND_OPTIONS.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedId(item.id);
                      if (isPlayingPreview) {
                        stopCurrentAlarm();
                        setIsPlayingPreview(false);
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-400/60 ring-1 ring-amber-400/40'
                        : 'bg-slate-850 bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
                            {item.name}
                          </span>
                          {item.id === 'custom_audio' && customAudioName && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full truncate max-w-[120px]">
                              {customAudioName}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-xs font-bold shadow">
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom File Upload Button if custom_audio is selected */}
          {selectedId === 'custom_audio' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-dashed border-amber-500/40 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{customAudioName ? 'Cambiar archivo de audio' : 'Seleccionar archivo de audio'}</span>
              </button>
              <p className="text-[11px] text-slate-500 mt-2">
                Compatible con MP3, WAV, OGG y AAC.
              </p>
            </div>
          )}

          {/* Volume Control & Test Sound */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                {volume > 0 ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                <span>Volumen de Alarma</span>
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {Math.round(volume * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Repetitions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-xs text-slate-400">Repeticiones del tono:</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 5].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setRepeatCount(cnt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      repeatCount === cnt
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cnt}x
                  </button>
                ))}
              </div>
            </div>

            {/* Test sound button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTestSound}
                className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  isPlayingPreview
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {isPlayingPreview ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    <span>Detener prueba</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-amber-400" />
                    <span>Probar sonido seleccionado</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-950/50 cursor-pointer active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
