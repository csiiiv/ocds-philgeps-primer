import { Link } from "react-router-dom";
import { DEFAULT_RELEASES } from "../content/releases";
import { formatReleaseDate } from "../content/format";

/**
 * ReleaseTimeline — the visual "release index" of the record.
 *
 * Renders every release as a row on a vertical timeline. In selection mode,
 * clicking a release opens its modal viewer; otherwise it navigates to the
 * release's addressable sub-station.
 *
 * This is the second-most important component in the primer (after the subway):
 * it makes "many releases, one process" visible at a glance.
 */
export function ReleaseTimeline({
  activeReleaseId,
  compact = false,
  onSelect,
}: {
  activeReleaseId?: string;
  compact?: boolean;
  onSelect?: (releaseId: string) => void;
}) {
  return (
    <ol className="release-timeline" data-compact={compact || undefined} aria-label="Releases in this record">
      {DEFAULT_RELEASES.map((r, i) => {
        const isActive = activeReleaseId === r.id;
        return (
          <li key={r.id} className="release-timeline__item">
            <span className="release-timeline__rail" aria-hidden />
            <span className="release-timeline__dot" aria-hidden />
            {onSelect ? (
            <button
              type="button"
              className="release-timeline__card"
              data-release-id={r.id}
              data-active={isActive ? "true" : undefined}
              aria-haspopup="dialog"
              aria-expanded={isActive}
              onClick={() => onSelect(r.id)}
            >
              <span className="release-timeline__row">
                <span className="release-timeline__id">#{r.id}</span>
                <span className="release-timeline__date">{formatReleaseDate(r.date)}</span>
              </span>
              <span className="release-timeline__tags">
                {r.tag.map((t) => (
                  <span key={t} className={`tag tag--${t}`}>
                    {t}
                  </span>
                ))}
              </span>
              <span className="release-timeline__summary">{r.summary}</span>
              <span className="release-timeline__step">
                {isActive ? "Open in viewer" : `View release · ${i + 1} of ${DEFAULT_RELEASES.length}`} <span aria-hidden="true">→</span>
              </span>
            </button>
            ) : (
              <Link
                to={`/journey/4-record/${r.id}`}
                className="release-timeline__card"
                data-active={isActive ? "true" : undefined}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="release-timeline__row">
                  <span className="release-timeline__id">#{r.id}</span>
                  <span className="release-timeline__date">{formatReleaseDate(r.date)}</span>
                </span>
                <span className="release-timeline__tags">
                  {r.tag.map((t) => <span key={t} className={`tag tag--${t}`}>{t}</span>)}
                </span>
                <span className="release-timeline__summary">{r.summary}</span>
                <span className="release-timeline__step">
                  {isActive ? "Currently open" : `Open release · ${i + 1} of ${DEFAULT_RELEASES.length}`} <span aria-hidden="true">→</span>
                </span>
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}
