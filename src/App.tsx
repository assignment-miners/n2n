import React, { useState } from 'react';
import { useTimer, TimerMode } from './hooks/useTimer';

const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

const MODE_COLORS: Record<TimerMode, { bg: string; ring: string; text: string; btn: string; btnHover: string }> = {
  focus: {
    bg: 'from-rose-50 to-orange-50',
    ring: 'stroke-rose-500',
    text: 'text-rose-600',
    btn: 'bg-rose-500',
    btnHover: 'hover:bg-rose-600',
  },
  shortBreak: {
    bg: 'from-emerald-50 to-teal-50',
    ring: 'stroke-emerald-500',
    text: 'text-emerald-600',
    btn: 'bg-emerald-500',
    btnHover: 'hover:bg-emerald-600',
  },
  longBreak: {
    bg: 'from-blue-50 to-indigo-50',
    ring: 'stroke-blue-500',
    text: 'text-blue-600',
    btn: 'bg-blue-500',
    btnHover: 'hover:bg-blue-600',
  },
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function CircularProgress({ timeLeft, totalTime, mode }: { timeLeft: number; totalTime: number; mode: TimerMode }) {
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative w-72 h-72 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
        <circle
          cx="140"
          cy="140"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        <circle
          cx="140"
          cy="140"
          r={radius}
          fill="none"
          className={MODE_COLORS[mode].ring}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl font-mono font-bold text-gray-800 tracking-tight">
          {formatTime(timeLeft)}
        </span>
        <span className={`text-sm font-medium mt-2 uppercase tracking-wider ${MODE_COLORS[mode].text}`}>
          {MODE_LABELS[mode]}
        </span>
      </div>
    </div>
  );
}

function ModeSelector({ mode, onSwitch }: { mode: TimerMode; onSwitch: (m: TimerMode) => void }) {
  const modes: TimerMode[] = ['focus', 'shortBreak', 'longBreak'];
  return (
    <div className="flex gap-2 justify-center mb-8">
      {modes.map((m) => (
        <button
          key={m}
          onClick={() => onSwitch(m)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            mode === m
              ? `${MODE_COLORS[m].btn} text-white shadow-md`
              : 'bg-white/70 text-gray-600 hover:bg-white hover:shadow-sm'
          }`}
        >
          {MODE_LABELS[m]}
        </button>
      ))}
    </div>
  );
}

function Controls({
  isRunning,
  onStart,
  onPause,
  onReset,
  mode,
}: {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  mode: TimerMode;
}) {
  return (
    <div className="flex gap-4 justify-center mt-8">
      <button
        onClick={isRunning ? onPause : onStart}
        className={`px-8 py-3 rounded-full text-white font-semibold text-lg shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${MODE_COLORS[mode].btn} ${MODE_COLORS[mode].btnHover}`}
      >
        {isRunning ? (
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Pause
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Start
          </span>
        )}
      </button>
      <button
        onClick={onReset}
        className="px-6 py-3 rounded-full bg-white text-gray-600 font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 border border-gray-200"
      >
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset
        </span>
      </button>
    </div>
  );
}

function StatsPanel({
  todayStats,
  allTimeStats,
}: {
  todayStats: { completedPomodoros: number; totalFocusMinutes: number };
  allTimeStats: { totalPomodoros: number; totalFocusMinutes: number };
}) {
  return (
    <div className="mt-10 grid grid-cols-2 gap-4 max-w-md mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Today</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{todayStats.completedPomodoros}</p>
          <p className="text-xs text-gray-500 mt-1">pomodoros</p>
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Focus Time</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{todayStats.totalFocusMinutes}</p>
          <p className="text-xs text-gray-500 mt-1">minutes today</p>
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">All Time</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{allTimeStats.totalPomodoros}</p>
          <p className="text-xs text-gray-500 mt-1">total pomodoros</p>
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Focus</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{Math.round(allTimeStats.totalFocusMinutes / 60 * 10) / 10}</p>
          <p className="text-xs text-gray-500 mt-1">hours total</p>
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({
  settings,
  onUpdate,
  isOpen,
  onToggle,
}: {
  settings: { focus: number; shortBreak: number; longBreak: number; longBreakInterval: number };
  onUpdate: (s: Partial<{ focus: number; shortBreak: number; longBreak: number; longBreakInterval: number }>) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mt-8 max-w-md mx-auto">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 mx-auto text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {isOpen ? 'Hide Settings' : 'Custom Durations'}
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="mt-4 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Focus (min)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={settings.focus}
                onChange={(e) => onUpdate({ focus: Math.max(1, Math.min(120, Number(e.target.value))) })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Short Break (min)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.shortBreak}
                onChange={(e) => onUpdate({ shortBreak: Math.max(1, Math.min(30, Number(e.target.value))) })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Long Break (min)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.longBreak}
                onChange={(e) => onUpdate({ longBreak: Math.max(1, Math.min(60, Number(e.target.value))) })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Long Break After
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={settings.longBreakInterval}
                onChange={(e) => onUpdate({ longBreakInterval: Math.max(2, Math.min(10, Number(e.target.value))) })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const {
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
  } = useTimer();

  const [settingsOpen, setSettingsOpen] = useState(false);

  const totalTime = mode === 'focus' ? settings.focus * 60 : mode === 'shortBreak' ? settings.shortBreak * 60 : settings.longBreak * 60;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${MODE_COLORS[mode].bg} transition-all duration-700`}>
      <div className="max-w-lg mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <span className="text-3xl">🍅</span>
            Pomodoro Focus
          </h1>
          <p className="text-sm text-gray-500 mt-1">Stay focused, one pomodoro at a time</p>
        </header>

        {/* Mode Selector */}
        <ModeSelector mode={mode} onSwitch={switchMode} />

        {/* Timer */}
        <CircularProgress timeLeft={timeLeft} totalTime={totalTime} mode={mode} />

        {/* Controls */}
        <Controls
          isRunning={isRunning}
          onStart={start}
          onPause={pause}
          onReset={reset}
          mode={mode}
        />

        {/* Stats */}
        <StatsPanel todayStats={todayStats} allTimeStats={allTimeStats} />

        {/* Settings */}
        <SettingsPanel
          settings={settings}
          onUpdate={updateSettings}
          isOpen={settingsOpen}
          onToggle={() => setSettingsOpen(!settingsOpen)}
        />

        {/* Footer */}
        <footer className="text-center mt-10 text-xs text-gray-400">
          <p>Data saved locally in your browser</p>
        </footer>
      </div>
    </div>
  );
}
