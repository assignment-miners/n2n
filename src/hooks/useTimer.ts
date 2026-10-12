import { useState, useEffect, useRef } from 'react';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface TimerSettings {
  focus: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
}

export interface FocusSession {
  date: string;
  completedAt: string;
  duration: number;
}

export interface TodayStats {
  date: string;
  completedPomodoros: number;
  totalFocusMinutes: number;
  sessions: FocusSession[];
}

const DEFAULT_SETTINGS: TimerSettings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
};

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function loadSettings(): TimerSettings {
  try {
    const saved = localStorage.getItem('pomodoro-settings');
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_SETTINGS;
}

function loadTodayStats(): TodayStats {
  try {
    const saved = localStorage.getItem('pomodoro-stats');
    if (saved) {
      const stats: TodayStats = JSON.parse(saved);
      if (stats.date === getTodayKey()) return stats;
    }
  } catch {}
  return { date: getTodayKey(), completedPomodoros: 0, totalFocusMinutes: 0, sessions: [] };
}

function loadAllTimeStats(): { totalPomodoros: number; totalFocusMinutes: number } {
  try {
    const saved = localStorage.getItem('pomodoro-alltime');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { totalPomodoros: 0, totalFocusMinutes: 0 };
}

export function useTimer() {
  const [settings, setSettings] = useState<TimerSettings>(loadSettings);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [todayStats, setTodayStats] = useState<TodayStats>(loadTodayStats);
  const [allTimeStats, setAllTimeStats] = useState(loadAllTimeStats);
  const intervalRef = useRef<number | null>(null);
  const pomodorosSinceLongBreak = useRef(0);
  const onCompleteRef = useRef<() => void>(() => {});

  // Save settings
  useEffect(() => {
    localStorage.setItem('pomodoro-settings', JSON.stringify(settings));
  }, [settings]);

  // Save stats
  useEffect(() => {
    localStorage.setItem('pomodoro-stats', JSON.stringify(todayStats));
  }, [todayStats]);

  useEffect(() => {
    localStorage.setItem('pomodoro-alltime', JSON.stringify(allTimeStats));
  }, [allTimeStats]);

  // Keep completion handler ref up to date
  onCompleteRef.current = () => {
    setIsRunning(false);

    if (mode === 'focus') {
      pomodorosSinceLongBreak.current += 1;
      const session: FocusSession = {
        date: getTodayKey(),
        completedAt: new Date().toISOString(),
        duration: settings.focus,
      };
      setTodayStats((prev) => ({
        ...prev,
        completedPomodoros: prev.completedPomodoros + 1,
        totalFocusMinutes: prev.totalFocusMinutes + settings.focus,
        sessions: [...prev.sessions, session],
      }));
      setAllTimeStats((prev) => ({
        totalPomodoros: prev.totalPomodoros + 1,
        totalFocusMinutes: prev.totalFocusMinutes + settings.focus,
      }));

      // Auto switch to break
      if (pomodorosSinceLongBreak.current >= settings.longBreakInterval) {
        pomodorosSinceLongBreak.current = 0;
        setMode('longBreak');
        setTimeLeft(settings.longBreak * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(settings.shortBreak * 60);
      }
    } else {
      // Break complete, switch to focus
      setMode('focus');
      setTimeLeft(settings.focus * 60);
    }
  };

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            onCompleteRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    const duration = mode === 'focus' ? settings.focus : mode === 'shortBreak' ? settings.shortBreak : settings.longBreak;
    setTimeLeft(duration * 60);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    const duration = newMode === 'focus' ? settings.focus : newMode === 'shortBreak' ? settings.shortBreak : settings.longBreak;
    setTimeLeft(duration * 60);
  };

  const updateSettings = (newSettings: Partial<TimerSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      // If not running, update time to match new setting
      if (!isRunning) {
        if (mode === 'focus') setTimeLeft(updated.focus * 60);
        else if (mode === 'shortBreak') setTimeLeft(updated.shortBreak * 60);
        else setTimeLeft(updated.longBreak * 60);
      }
      return updated;
    });
  };

  return {
    mode,
    timeLeft,
    isRunning,
    settings,
    todayStats,
    allTimeStats,
    start,
    pause,
    reset,
    switchMode,
    updateSettings,
  };
}
