import { useState } from "react";
import { eventsForJourney, type JourneyEvent } from "../content/journeyTimeline";
import { formatReleaseDate } from "../content/format";

export function JourneyEventTimeline({ journeyId }: { journeyId: string }) {
  const events = eventsForJourney(journeyId);
  const [selectedId, setSelectedId] = useState(events[0]?.id);
  const selected = events.find((event) => event.id === selectedId) ?? events[0];
  return (
    <div className="event-timeline-layout">
      <ol className="event-timeline" aria-label="Observed lifecycle events">
        {events.map((event) => <EventButton key={event.id} event={event} selected={event.id === selected?.id} onSelect={setSelectedId} />)}
      </ol>
      {selected && <aside className="event-evidence" aria-live="polite">
        <p className="eyebrow">Selected event</p><h3>{selected.label}</h3>
        {selected.sequenceIssue && <p className="event-warning">This event appears after a later lifecycle stage when sorted by date. Verify the source chronology.</p>}
        <dl>
          <div><dt>Observed date</dt><dd>{selected.date ? formatReleaseDate(selected.date) : "Not published"}</dd></div>
          <div><dt>Source</dt><dd><code>{selected.sourceField}</code>{selected.sourceLine ? ` · line ${selected.sourceLine}` : ""}<strong>{selected.sourceValue}</strong></dd></div>
          <div><dt>OCDS destination</dt><dd>{selected.ocdsPath ? <><code>{selected.ocdsPath}</code><strong>{selected.ocdsValue}</strong></> : "Retained as source evidence; not mapped by this POC."}</dd></div>
        </dl>
      </aside>}
    </div>
  );
}

function EventButton({ event, selected, onSelect }: { event: JourneyEvent; selected: boolean; onSelect: (id: string) => void }) {
  return <li data-stage={event.stage.toLowerCase()} data-warning={event.sequenceIssue || undefined}>
    <button type="button" aria-pressed={selected} data-active={selected || undefined} onClick={() => onSelect(event.id)}>
      <time dateTime={event.date ?? undefined}>{event.date ? formatReleaseDate(event.date) : "Date not published"}</time><span>{event.stage}</span><strong>{event.label}</strong>{event.sequenceIssue && <b>Check chronology</b>}
    </button>
  </li>;
}
