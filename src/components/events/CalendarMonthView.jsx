import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay,
  format, parseISO, isToday,
} from 'date-fns';

const CATEGORY_DOT = {
  service:   'bg-blue-400',
  youth:     'bg-green-400',
  prayer:    'bg-purple-400',
  community: 'bg-yellow-400',
  special:   'bg-red-400',
};

function getEventsForDay(events, day) {
  return events.filter(e => {
    if (!e.date) return false;
    try { return isSameDay(parseISO(e.date), day); } catch { return false; }
  });
}

export default function CalendarMonthView({ events, onDaySelect, selectedDay }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const weeks = [];
  let day = calStart;
  while (day <= calEnd) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
        <button
          type="button"
          aria-label="Show previous month"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="glass-light focus-ring flex h-11 w-11 items-center justify-center text-white/70 transition-colors hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="px-3 text-center font-display text-lg font-bold text-white sm:text-xl">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          type="button"
          aria-label="Show next month"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="glass-light focus-ring flex h-11 w-11 items-center justify-center text-white/70 transition-colors hover:text-white"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="scroll-fade-x">
        <div className="overflow-x-auto">
          <div className="min-w-[42rem] sm:min-w-0">
            <div className="grid grid-cols-7 border-b border-white/10">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="py-2 text-center text-xs font-medium text-white/55 uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="divide-y divide-white/5">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 divide-x divide-white/5">
                  {week.map((d, di) => {
                    const dayEvents = getEventsForDay(events, d);
                    const inMonth = isSameMonth(d, currentMonth);
                    const today = isToday(d);
                    const selected = selectedDay && isSameDay(d, selectedDay);

                    return (
                      <button
                        type="button"
                        aria-label={`Show events for ${format(d, 'EEEE, d MMMM')}`}
                        key={di}
                        onClick={() => onDaySelect(d)}
                        className={`focus-ring min-h-[80px] p-2 text-left transition-colors
                          ${inMonth ? 'hover:bg-white/5' : 'opacity-30'}
                          ${selected ? 'bg-blue-500/20' : ''}
                        `}
                      >
                        <div className={`
                          w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1
                          ${today ? 'bg-primary text-white' : 'text-white/70'}
                        `}>
                          {format(d, 'd')}
                        </div>
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 3).map((e, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${CATEGORY_DOT[e.category] || 'bg-white/40'}`} />
                              <span className="text-white/70 text-xs truncate leading-tight">{e.title}</span>
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-white/55 text-xs">+{dayEvents.length - 3} more</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
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
