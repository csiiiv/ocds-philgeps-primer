import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { Link, Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
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
  if (pathname === "/mapping/solar-pumps") return "Solar-pump mapping lab";
  if (pathname.startsWith("/mapping")) return "Mapping Guide";
  if (pathname.startsWith("/simulation")) return "Procurement replay";
  if (pathname.startsWith("/workshop")) return "Workshop";
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
  const inJourney = location.pathname === "/journey" || location.pathname.startsWith("/journey/");
  const activeSection = inJourney || ["/simulation", "/possible-journeys", "/publication"].some((path) => location.pathname.startsWith(path)) ? "learn"
    : ["/mapping", "/explore"].some((path) => location.pathname.startsWith(path)) ? "map"
    : location.pathname.startsWith("/workshop") ? "workshop" : "reference";
  const navClass = ({ isActive }: { isActive: boolean }) => "nav-link" + (isActive ? " nav-link--active" : "");
  const progressPercent = counts.total > 0 ? (counts.passed / counts.total) * 100 : 0;
  const wideContent = ["/journey", "/possible-journeys", "/publication", "/mapping", "/simulation", "/workshop", "/explore"]
    .some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));

  useLayoutEffect(() => {
    setMobileNavOpen(false);
    if (window.matchMedia("(max-width: 760px)").matches) {
      mainRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);

  // HashRouter owns the browser's fragment. Section fragments live inside
  // the router location (e.g. #/possible-journeys/poc-multi-award#timeline),
  // so the browser cannot scroll to those targets by itself.
  useLayoutEffect(() => {
    if (!location.hash) return;
    let id: string;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ block: "start", behavior: "auto" });
    if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }, [location.pathname, location.hash, location.key]);

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
      <Link className="skip-link" to={{ pathname: location.pathname, search: location.search, hash: "#main-content" }} onClick={(event) => {
        event.preventDefault();
        mainRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
        mainRef.current?.focus({ preventScroll: true });
      }}>Skip to lesson content</Link>
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
          <span className="mobile-header__progress" role="progressbar" aria-label="Station progress" aria-valuemin={0} aria-valuemax={counts.total} aria-valuenow={counts.passed}>
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
          <section className="nav-section" aria-label="Learn OCDS">
            <Link className={`nav-section__title${activeSection === "learn" ? " nav-section__title--active" : ""}`} to="/journey">Learn OCDS</Link>
            {activeSection === "learn" && <div className="nav-section__children">
              <NavLink to="/journey" end className={navClass}>Five-station introduction</NavLink>
              {inJourney && <div className="nav-journey-children">{groupStationsByMacroPhase(STATIONS).map((group) => <div className="nav-group" key={group.phase} style={{ ["--group-rail" as string]: group.rail }}>{group.stations.map((station) => <NavLink key={station.id} to={`/journey/${station.id}`} className={({ isActive }) => "nav-link nav-link--station" + (isActive ? " nav-link--active" : "") + (passed.has(station.id) ? " nav-link--passed" : "")}>
                {passed.has(station.id) && <span className="nav-link__check" aria-hidden="true">✓</span>}{station.title}
              </NavLink>)}</div>)}</div>}
              <NavLink to="/simulation" className={navClass}>Procurement replay</NavLink>
              <NavLink to="/possible-journeys" className={navClass}>Process examples</NavLink>
              <NavLink to="/publication" className={navClass}>Publication &amp; portfolio</NavLink>
            </div>}
          </section>
          <section className="nav-section" aria-label="Map data">
            <Link className={`nav-section__title${activeSection === "map" ? " nav-section__title--active" : ""}`} to="/mapping">Map data</Link>
            {activeSection === "map" && <div className="nav-section__children">
              <NavLink to="/mapping" end className={navClass}>Mapping Guide</NavLink>
              <NavLink to="/explore/fields" className={navClass}>Field Explorer</NavLink>
              <NavLink to="/mapping/solar-pumps" className={navClass}>Solar-pump lab</NavLink>
            </div>}
          </section>
          <section className="nav-section" aria-label="Workshop">
            <Link className={`nav-section__title${activeSection === "workshop" ? " nav-section__title--active" : ""}`} to="/workshop">Workshop</Link>
            {activeSection === "workshop" && <div className="nav-section__children"><Link className="nav-link" to="/workshop#agenda">Learning path</Link><Link className="nav-link" to="/workshop#templates">Templates</Link><Link className="nav-link" to="/workshop#outputs">Outputs</Link></div>}
          </section>
          <section className="nav-section" aria-label="Reference">
            <Link className={`nav-section__title${activeSection === "reference" ? " nav-section__title--active" : ""}`} to="/reference">Reference</Link>
            {activeSection === "reference" && <div className="nav-section__children">
              <NavLink to="/glossary" className={navClass}>Glossary</NavLink><NavLink to="/faq" className={navClass}>FAQ</NavLink><NavLink to="/reference" className={navClass}>Official references</NavLink><NavLink to="/about" className={navClass}>About</NavLink>
            </div>}
          </section>
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
      <main id="main-content" className={`content${wideContent ? " content--wide" : ""}`} ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
