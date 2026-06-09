import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfWeek, endOfWeek, addDays, addWeeks, subWeeks,
  format, parseISO, isSameDay, isToday,
} from 'date-fns';

const CATEGORY_COLORS = {
  service:   'bg-blue-500/30 border-blue-400/50 text-blue-200',
  youth:     'bg-green-500/30 border-green-400/50 text-green-200',
  prayer:    'bg-purple-500/30 border-purple-400/50 text-purple-200',
  community: 'bg-yellow-500/30 border-yellow-400/50 text-yellow-200',
  special:   'bg-red-500/30 border-red-400/50 text-red-200',
};

export default function CalendarWeekView({ events, currentWeek, setCurrentWeek, onDaySelect }) {
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function eventsForDay(day) {
    return events.filter(e => {
      if (!e.date) return false;
      try { return isSameDay(parseISO(e.date), day); } catch { return false; }
    });
  }

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
        <button
          type="button"
          aria-label="Show previous week"
          onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
          className="glass-light focus-ring flex h-11 w-11 items-center justify-center text-white/70 transition-colors hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="px-3 text-center font-display text-base font-bold text-white sm:text-lg">
          {format(weekStart, 'd MMM')} – {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'd MMM yyyy')}
        </h2>
        <button
          type="button"
          aria-label="Show next week"
          onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
          className="glass-light focus-ring flex h-11 w-11 items-center justify-center text-white/70 transition-colors hover:text-white"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Week columns */}
      <div className="scroll-fade-x">
        <div className="overflow-x-auto">
          <div className="grid min-h-[300px] min-w-[42rem] grid-cols-7 divide-x divide-white/10 sm:min-w-0">
            {days.map((day, i) => {
              const dayEvents = eventsForDay(day);
              const today = isToday(day);
              return (
                <button
                  type="button"
                  aria-label={`Show events for ${format(day, 'EEEE, d MMMM')}`}
                  key={i}
                  onClick={() => onDaySelect(day)}
                  className="focus-ring flex flex-col p-2 text-left transition-colors hover:bg-white/5 sm:p-3"
                >
                  {/* Day header */}
                  <div className="text-center mb-2">
                    <div className="text-white/55 text-xs uppercase tracking-wider">{format(day, 'EEE')}</div>
                    <div className={`
                      mt-1 w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm font-semibold
                      ${today ? 'bg-primary text-white' : 'text-white/80'}
                    `}>
                      {format(day, 'd')}
                    </div>
                  </div>

                  {/* Events */}
                  <div className="flex-1 space-y-1">
                    {dayEvents.map((e, ei) => (
                      <div
                        key={ei}
                        className={`rounded-[1rem] px-2.5 py-1.5 border-l-2 text-xs font-medium truncate ${CATEGORY_COLORS[e.category] || 'bg-white/10 border-white/30 text-white/60'}`}
                      >
                        <div className="truncate">{e.title}</div>
                        {e.time && <div className="opacity-70 text-xs">{e.time}</div>}
                      </div>
                    ))}
                    {dayEvents.length === 0 && (
                      <div className="text-white/20 text-xs text-center mt-2">—</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="scroll-hint" aria-hidden="true">
        <span>Swipe to see more days</span>
        <ChevronRight className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}
