export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

export type FrustrationLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface SessionRecord {
  id: string;
  timestamp: number; // Date.now()
  dateString: string; // YYYY-MM-DD
  durationSeconds: number;
  tag: string;
  note?: string;
}

export type AlarmSoundId = 
  | 'digital_beep' 
  | 'gentle_chime' 
  | 'retro_arcade' 
  | 'urgent_siren' 
  | 'mubimu_party' 
  | 'cosmic_gong' 
  | 'custom_audio';

export interface AlarmConfig {
  soundId: AlarmSoundId;
  volume: number; // 0 to 1
  repeatCount: number; // how many times to repeat
  customAudioUrl?: string;
  customAudioName?: string;
}

export interface DailySummary {
  dateString: string;
  totalSeconds: number;
  sessionCount: number;
}
