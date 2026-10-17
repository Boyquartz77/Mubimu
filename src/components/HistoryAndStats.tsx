import React, { useState } from 'react';
import { SessionRecord } from '../types';
import { calculateDailyStats, deleteSession, clearAllSessions } from '../utils/storage';
import { BarChart3, Calendar, Clock, Flame, Trash2, Download, Award, ChevronDown, ChevronUp } from 'lucide-react';

interface HistoryAndStatsProps {
  sessions: SessionRecord[];
  onSessionsChange: (updated: SessionRecord[]) => void;
}

export const HistoryAndStats: React.FC<HistoryAndStatsProps> = ({
  sessions,
  onSessionsChange,
}) => {
  const [filterTag, setFilterTag] = useState<string>('todos');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const stats = calculateDailyStats(sessions);

  const formatDuration = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs > 0 ? `${secs}s` : ''}`;
    }
    return `${secs}s`;
  };

  const formatClockTime = (timestamp: number): string => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('¿Deseas eliminar este registro de sesión?')) {
      const updated = deleteSession(id);
      onSessionsChange(updated);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro de que deseas borrar todo el historial de sesiones?')) {
      clearAllSessions();
      onSessionsChange([]);
    }
  };

  const handleExportCSV = () => {
    if (sessions.length === 0) return;
    const headers = ['ID,Fecha,Hora,Duracion_Segundos,Etiqueta,Nota'];
    const rows = sessions.map((s) => {
      const timeStr = formatClockTime(s.timestamp);
      return `"${s.id}","${s.dateString}","${timeStr}",${s.durationSeconds},"${s.tag || ''}","${s.note || ''}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mubimu_historial_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tags = Array.from(new Set(sessions.map((s) => s.tag).filter(Boolean)));
  const filteredSessions = filterTag === 'todos' ? sessions : sessions.filter((s) => s.tag === filterTag);

  // Find max seconds for bar chart scaling
  const maxDaySeconds = Math.max(...stats.last7Days.map((d) => d.totalSeconds), 1800);

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl backdrop-blur-xl overflow-hidden transition-all">
      {/* Header bar */}
      <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-400/25 flex items-center justify-center text-amber-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Historial & Estadísticas Diarias</span>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                {sessions.length} completadas
              </span>
            </h3>
            <p className="text-xs text-slate-400">Progreso diario de enfoque y sesiones registradas</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {sessions.length > 0 && (
            <button
              type="button"
              onClick={handleExportCSV}
              title="Exportar como CSV"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Daily Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Stat 1: Tiempo Hoy */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>Tiempo Hoy</span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="font-mono text-xl sm:text-2xl font-extrabold text-emerald-400">
                {formatDuration(stats.todayTotalSeconds)}
              </div>
              <span className="text-[11px] text-slate-500 mt-1">Hoy en la app</span>
            </div>

            {/* Stat 2: Sesiones Hoy */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>Sesiones Hoy</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div className="font-mono text-xl sm:text-2xl font-extrabold text-amber-400">
                {stats.todaySessionCount}
              </div>
              <span className="text-[11px] text-slate-500 mt-1">Metas alcanzadas</span>
            </div>

            {/* Stat 3: Racha de días */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>Racha</span>
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <div className="font-mono text-xl sm:text-2xl font-extrabold text-orange-400 flex items-center gap-1">
                <span>{stats.streak}</span>
                <span className="text-sm font-normal text-slate-400">días</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1">Días consecutivos</span>
            </div>

            {/* Stat 4: Tiempo Histórico Total */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>Total Histórico</span>
                <Calendar className="w-4 h-4 text-sky-400" />
              </div>
              <div className="font-mono text-xl sm:text-2xl font-extrabold text-sky-400">
                {formatDuration(stats.totalAllTimeSeconds)}
              </div>
              <span className="text-[11px] text-slate-500 mt-1">{stats.totalAllTimeCount} sesiones en total</span>
            </div>
          </div>

          {/* 7-Day Visual Bar Chart */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>Actividad de los últimos 7 días</span>
              </h4>
              <span className="text-[11px] text-slate-400">Minutos por día</span>
            </div>

            <div className="flex items-end justify-between gap-2 sm:gap-4 h-32 pt-4 px-2">
              {stats.last7Days.map((day, idx) => {
                const heightPercent = Math.max(8, Math.round((day.totalSeconds / maxDaySeconds) * 100));
                const isToday = idx === stats.last7Days.length - 1;
                const dateObj = new Date(day.dateString + 'T00:00:00');
                const dayName = dateObj.toLocaleDateString([], { weekday: 'short' });

                return (
                  <div key={day.dateString} className="flex-1 flex flex-col items-center h-full justify-end group">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded border border-slate-700 mb-1 whitespace-nowrap pointer-events-none">
                      {formatDuration(day.totalSeconds)} ({day.sessionCount})
                    </div>

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[36px] rounded-t-lg transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-md shadow-amber-500/20'
                          : day.totalSeconds > 0
                          ? 'bg-gradient-to-t from-teal-700 to-teal-500'
                          : 'bg-slate-800/60'
                      }`}
                    />

                    {/* Day label */}
                    <div className="mt-2 text-[11px] font-medium text-slate-400 uppercase text-center">
                      <span className={isToday ? 'text-amber-400 font-bold' : ''}>{dayName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Session Log */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Registro de Sesiones
                </h4>
                {filteredSessions.length > 0 && (
                  <span className="text-[11px] text-slate-500">
                    ({filteredSessions.length})
                  </span>
                )}
              </div>

              {/* Tag filters & clear all */}
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setFilterTag('todos')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      filterTag === 'todos'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Todos
                  </button>
                  {tags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFilterTag(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        filterTag === t
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {sessions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    title="Borrar todo el historial"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors ml-auto cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            {filteredSessions.length === 0 ? (
              <div className="text-center py-8 bg-slate-950/40 rounded-2xl border border-slate-800/60">
                <p className="text-sm text-slate-400">No hay sesiones registradas aún.</p>
                <p className="text-xs text-slate-500 mt-1">¡Inicia el contador y completa tu primera sesión!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono font-bold">
                        ✓
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">
                            {formatDuration(session.durationSeconds)}
                          </span>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-amber-300">
                            {session.tag}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{session.dateString}</span>
                          <span>•</span>
                          <span>{formatClockTime(session.timestamp)}</span>
                          {session.note && (
                            <>
                              <span>•</span>
                              <span className="italic text-slate-400 truncate max-w-[150px]">{session.note}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(session.id)}
                      title="Eliminar registro"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
