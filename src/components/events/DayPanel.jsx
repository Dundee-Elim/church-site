import { format, isSameDay, parseISO } from 'date-fns';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { navPillSpring } from '@/lib/motion';
import EventCard from './EventCard';

export default function DayPanel({ day, events, onClose }) {
  const dayEvents = events.filter(e => {
    if (!e.date) return false;
    try { return isSameDay(parseISO(e.date), day); } catch { return false; }
  });

  return (
    <AnimatePresence>
      {day && (
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ ...navPillSpring, stiffness: 220, damping: 30 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl font-bold text-white">
              {format(day, 'EEEE, d MMMM')}
            </h3>
            <button type="button" aria-label="Close day panel" onClick={onClose} className="glass-light focus-ring p-1.5 text-white/70 transition-colors hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {dayEvents.length === 0 ? (
            <p className="py-10 text-center text-sm text-white/55">No events on this day.</p>
          ) : (
            <div className="space-y-4">
              {dayEvents.map(e => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
