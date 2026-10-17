import { AlarmConfig, DailySummary, SessionRecord } from '../types';

const STORAGE_KEY_SESSIONS = 'mubimu_timer_sessions_v1';
const STORAGE_KEY_ALARM = 'mubimu_timer_alarm_v1';
const STORAGE_KEY_LAST_CONFIG = 'mubimu_timer_last_config_v1';

export const DEFAULT_ALARM_CONFIG: AlarmConfig = {
  soundId: 'gentle_chime',
  volume: 0.85,
  repeatCount: 3,
};

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadSavedSessions(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (!raw) return getInitialDemoSessions();
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed loading sessions from localStorage', e);
    return getInitialDemoSessions();
  }
}

export function saveSession(durationSeconds: number, tag = 'Enfoque', note = ''): SessionRecord {
  const sessions = loadSavedSessions();
  const newSession: SessionRecord = {
    id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: Date.now(),
    dateString: getTodayDateString(),
    durationSeconds,
    tag,
    note,
  };
  const updated = [newSession, ...sessions];
  try {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save session to localStorage', e);
  }
  return newSession;
}

export function deleteSession(id: string): SessionRecord[] {
  const sessions = loadSavedSessions().filter((s) => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.warn('Failed to delete session', e);
  }
  return sessions;
}

export function clearAllSessions(): void {
  try {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify([]));
  } catch (e) {
    console.warn('Failed to clear sessions', e);
  }
}

export function loadAlarmConfig(): AlarmConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALARM);
    if (!raw) return DEFAULT_ALARM_CONFIG;
    return { ...DEFAULT_ALARM_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_ALARM_CONFIG;
  }
}

export function saveAlarmConfig(config: AlarmConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_ALARM, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed saving alarm config', e);
  }
}

export function saveLastTimerDuration(seconds: number): void {
  try {
    localStorage.setItem(STORAGE_KEY_LAST_CONFIG, String(seconds));
  } catch (e) {
    // ignore
  }
}

export function loadLastTimerDuration(defaultVal = 1500): number {
  try {
    const val = localStorage.getItem(STORAGE_KEY_LAST_CONFIG);
    if (val && !isNaN(Number(val)) && Number(val) > 0) {
      return Number(val);
    }
  } catch (e) {
    // ignore
  }
  return defaultVal;
}

export function calculateDailyStats(sessions: SessionRecord[]) {
  const todayStr = getTodayDateString();
  const todaySessions = sessions.filter((s) => s.dateString === todayStr);

  const todayTotalSeconds = todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const todaySessionCount = todaySessions.length;

  const totalAllTimeSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalAllTimeCount = sessions.length;

  // Streak calculation (consecutive days with at least 1 session up to today/yesterday)
  const uniqueDates = Array.from(new Set(sessions.map((s) => s.dateString))).sort().reverse();
  let streak = 0;
  if (uniqueDates.length > 0) {
    const checkDate = new Date();
    // If today has sessions, start checking today; otherwise if yesterday has sessions start from yesterday
    const dStr = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    let cursor = new Date(checkDate);
    if (!uniqueDates.includes(dStr(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
    }

    while (uniqueDates.includes(dStr(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  // Last 7 days breakdown
  const last7Days: DailySummary[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;

    const daysSessions = sessions.filter((s) => s.dateString === dateStr);
    const secs = daysSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    last7Days.push({
      dateString: dateStr,
      totalSeconds: secs,
      sessionCount: daysSessions.length,
    });
  }

  return {
    todayTotalSeconds,
    todaySessionCount,
    totalAllTimeSeconds,
    totalAllTimeCount,
    streak,
    last7Days,
  };
}

function getInitialDemoSessions(): SessionRecord[] {
  // A small set of starter records so users see the daily statistics immediately upon opening
  const today = getTodayDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  return [
    {
      id: 'demo-1',
      timestamp: Date.now() - 3600 * 1000 * 2,
      dateString: today,
      durationSeconds: 1500, // 25 min
      tag: 'Estudio',
      note: 'Lectura concentrada',
    },
    {
      id: 'demo-2',
      timestamp: Date.now() - 3600 * 1000 * 4,
      dateString: today,
      durationSeconds: 600, // 10 min
      tag: 'Trabajo',
      note: 'Revisión rápida de pendientes',
    },
    {
      id: 'demo-3',
      timestamp: Date.now() - 3600 * 1000 * 26,
      dateString: yStr,
      durationSeconds: 1800, // 30 min
      tag: 'Programación',
      note: 'Implementación de componentes',
    },
  ];
}
