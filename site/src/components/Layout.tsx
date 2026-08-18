import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { STATIONS, type MacroPhase, type Station } from "../content/stations";
import { useStationProgress } from "../context/StationProgress";

/**
 * Group stations into consecutive runs that share a macro-phase. The sidebar
 * renders each group with its own colour-coded vertical rail (mirroring the
 * subway diagram's Events / Releases / Analytics segments) so the three-phase
 * structure stays visible without text labels.
 */
function groupStationsByMacroPhase(stations: Station[]): Array<{ phase: MacroPhase; rail: string; stations: Station[] }> {
  const groups: Array<{ phase: MacroPhase; rail: string; stations: Station[] }> = [];
  for (const station of stations) {
    const rail = MACRO_PHASE_RAIL[station.macroPhase];
    const last = groups[groups.length - 1];
    if (last && last.phase === station.macroPhase) {
      last.stations.push(station);
    } else {
      groups.push({ phase: station.macroPhase, rail, stations: [station] });
    }
  }
  return groups;
}

const MACRO_PHASE_RAIL: Record<MacroPhase, string> = {
  Events: "var(--rail-events)",
  Releases: "var(--rail-released)",
  Analytics: "var(--rail-analyzed)",
};

function getPageLabel(pathname: string) {
  const station = STATIONS.find((item) => pathname === `/journey/${item.id}` || pathname.startsWith(`/journey/${item.id}/`));
  if (station) return `Station ${station.index} of ${STATIONS.length} · ${station.title}`;
  if (pathname === "/journey") return "The journey";
  if (pathname.startsWith("/possible-journeys")) return "Possible Journeys";
  if (pathname.startsWith("/publication")) return "Publication & Portfolio";
  if (pathname.startsWith("/explore")) return "Field Explorer";
  if (pathname.startsWith("/glossary")) return "Glossary";
  if (pathname.startsWith("/reference")) return "Reference index";
  if (pathname.startsWith("/faq")) return "FAQ";
  if (pathname.startsWith("/about")) return "About";
  if (pathname.startsWith("/search")) return "Search";
  return "OCDS Primer";
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { counts, passed, reset, isAvailable } = useStationProgress();
  const showProgress = isAvailable && counts.passed > 0;
  const pageLabel = getPageLabel(location.pathname);
  const progressPercent = counts.total > 0 ? (counts.passed / counts.total) * 100 : 0;

  useLayoutEffect(() => {
    setMobileNavOpen(false);
    if (window.matchMedia("(max-width: 760px)").matches) {
      mainRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key === "Tab") {
        const focusable = Array.from(sidebarRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled])',
        ) ?? []);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileNavOpen]);

  const closeMobileNav = () => {
    setMobileNavOpen(false);
    menuButtonRef.current?.focus();
  };
  const submitSearch = (event: FormEvent) => { event.preventDefault(); if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`); };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to lesson content</a>
      <header className="mobile-header">
        <NavLink className="mobile-header__brand" to="/journey" aria-label="OCDS Primer home">
          <strong>OCDS</strong><span>Primer</span>
        </NavLink>
        <span className="mobile-header__page">{pageLabel}</span>
        <button
          ref={menuButtonRef}
          type="button"
          className="mobile-header__menu"
          aria-expanded={mobileNavOpen}
          aria-controls="primary-navigation"
          onClick={() => setMobileNavOpen(true)}
        >
          <span aria-hidden="true">☰</span> Menu
        </button>
        {isAvailable && (
          <span className="mobile-header__progress" aria-label={`${counts.passed} of ${counts.total} stations passed`}>
            <span style={{ width: `${progressPercent}%` }} />
          </span>
        )}
      </header>
      <button
        type="button"
        className={`mobile-nav-scrim${mobileNavOpen ? " mobile-nav-scrim--open" : ""}`}
        aria-label="Close navigation menu"
        tabIndex={mobileNavOpen ? 0 : -1}
        onClick={closeMobileNav}
      />
      <aside ref={sidebarRef} id="primary-navigation" className={`sidebar${mobileNavOpen ? " sidebar--open" : ""}`}>
        <div className="sidebar-drawer-header">
          <span>Navigate the primer</span>
          <button ref={closeButtonRef} type="button" onClick={closeMobileNav} aria-label="Close navigation menu">×</button>
        </div>
        <div className="brand">
          <span className="brand-mark">OCDS</span>
          <span className="brand-sub">Primer</span>
        </div>
        <nav className="nav">
          <form className="sidebar-search" role="search" onSubmit={submitSearch}><label htmlFor="sidebar-search">Search primer</label><div><input id="sidebar-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" /><button type="submit" aria-label="Submit search">→</button></div></form>
          <NavLink to="/journey" end className="nav-link nav-link--hub">
            The journey
          </NavLink>
          <div className="nav-journey-children">
            {groupStationsByMacroPhase(STATIONS).map((group) => (
              <div
                className="nav-group"
                key={group.phase}
                style={{ ["--group-rail" as string]: group.rail }}
              >
                {group.stations.map((s) => (
                  <NavLink
                    key={s.id}
                    to={`/journey/${s.id}`}
                    className={({ isActive }) =>
                      "nav-link nav-link--station" + (isActive ? " nav-link--active" : "") + (passed.has(s.id) ? " nav-link--passed" : "")
                    }
                  >
                    {passed.has(s.id) && <span className="nav-link__check" aria-hidden="true">✓</span>}
                    {s.title}
                  </NavLink>
                ))}
              </div>
            ))}
          </div>
          <NavLink to="/possible-journeys" className={({ isActive }) => "nav-link nav-link--chapter" + (isActive ? " nav-link--active" : "")}>
            Possible Journeys
          </NavLink>
          <NavLink to="/publication" className={({ isActive }) => "nav-link nav-link--chapter" + (isActive ? " nav-link--active" : "")}>
            Publication &amp; Portfolio
          </NavLink>
          <NavLink to="/explore/fields" className={({ isActive }) => "nav-link nav-link--chapter" + (isActive ? " nav-link--active" : "")}>
            Field Explorer
          </NavLink>
          <NavLink to="/glossary" className={({ isActive }) => "nav-link nav-link--chapter" + (isActive ? " nav-link--active" : "")}>
            Glossary
          </NavLink>
          <NavLink to="/reference" className={({ isActive }) => "nav-link nav-link--chapter" + (isActive ? " nav-link--active" : "")}>
            Reference index
          </NavLink>
          <NavLink to="/faq" className={({ isActive }) => "nav-link nav-link--chapter" + (isActive ? " nav-link--active" : "")}>
            FAQ
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => "nav-link nav-link--chapter" + (isActive ? " nav-link--active" : "")}>
            About
          </NavLink>
        </nav>
        <div className="sidebar-foot">
          {showProgress ? (
            <p className="sidebar-progress">
              <span>{counts.passed} of {counts.total} stations passed</span>
              <button type="button" className="sidebar-progress__reset" onClick={() => { if (window.confirm("Clear recorded progress for all stations?")) reset(); }}>Reset</button>
            </p>
          ) : (
            <p className="muted">
              Pass each station's knowledge check to track your progress.
            </p>
          )}
          <p className="muted">
            The first journey uses clearly labelled synthetic data.
          </p>
        </div>
      </aside>
      <main id="main-content" className="content" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
