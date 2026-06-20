import { addWeeks, isAfter, parseISO, startOfDay } from 'date-fns';
import { isPublishedContentItem } from '@/lib/siteContentUtils';

const weekdayToIndex = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function alignDateToWeekday(date, weekday) {
  const aligned = new Date(date);
  const targetDay = weekdayToIndex[weekday] ?? 0;

  while (aligned.getDay() !== targetDay) {
    aligned.setDate(aligned.getDate() + 1);
  }

  return aligned;
}

export function generateRecurringEvents(templates, { fromDate = new Date(), maxOccurrencesPerTemplate = 8 } = {}) {
  const today = startOfDay(fromDate);

  return (templates || []).filter(isPublishedContentItem).flatMap((template) => {
    if (!template.startDate) {
      return [];
    }

    let cursor = alignDateToWeekday(parseISO(template.startDate), template.weekday);
    const events = [];

    while (events.length < maxOccurrencesPerTemplate) {
      if (!isAfter(today, cursor)) {
        events.push({
          id: `${template.title}-${cursor.toISOString()}`,
          title: template.title,
          description: template.description,
          date: cursor.toISOString().slice(0, 10),
          time: template.time,
          location: template.location,
          category: template.category,
          is_recurring: true,
          recurring_pattern: template.recurringLabel,
        });
      }

      cursor = addWeeks(cursor, template.intervalWeeks || 1);
    }

    return events;
  });
}

/**
 * Returns one card per published recurring template (no date expansion),
 * plus published special/one-off events. Used by the Events list view so
 * each recurring gathering appears exactly once with its recurrence pattern.
 */
export function buildListViewEvents(eventContent) {
  const recurring = (eventContent.recurringTemplates || [])
    .filter(isPublishedContentItem)
    .map((template) => ({
      id: `template-${template.id || template.title}`,
      title: template.title,
      description: template.description,
      date: '',
      time: template.time,
      location: template.location,
      category: template.category,
      is_recurring: true,
      recurring_pattern: template.recurringLabel || template.weekday,
    }));

  const special = (eventContent.specialEvents || [])
    .filter(isPublishedContentItem)
    .map((event, index) => ({
      id: event.id || `special-${event.title}-${index}`,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      image_url: event.image?.url || '',
      is_recurring: false,
      recurring_pattern: '',
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return [...recurring, ...special];
}

export function buildUpcomingEvents(eventContent, fromDate = new Date()) {
  const recurring = generateRecurringEvents(eventContent.recurringTemplates || [], { fromDate });
  const special = (eventContent.specialEvents || []).filter(isPublishedContentItem).map((event, index) => ({
    id: event.id || `${event.title}-${index}`,
    title: event.title,
    description: event.description,
    date: event.date,
    time: event.time,
    location: event.location,
    category: event.category,
    image_url: event.image?.url || '',
    is_recurring: false,
    recurring_pattern: '',
  }));

  return [...recurring, ...special]
    .sort((left, right) => left.date.localeCompare(right.date))
    .slice(0, 50);
}
