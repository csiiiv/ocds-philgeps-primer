import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { Layout } from "./components/Layout";
import { JourneyHub } from "./pages/JourneyHub";
import { StationPage } from "./pages/StationPage";
import { ReleasePage } from "./pages/ReleasePage";
import { NotFound } from "./pages/NotFound";
import { PossibleJourneysPage } from "./pages/PossibleJourneysPage";
import { PossibleJourneyDetailPage } from "./pages/PossibleJourneyDetailPage";
import { JourneyComparisonPage } from "./pages/JourneyComparisonPage";
import { PublicationPage } from "./pages/PublicationPage";
import { FieldExplorerPage } from "./pages/FieldExplorerPage";
import { GlossaryPage } from "./pages/GlossaryPage";
import { SearchPage } from "./pages/SearchPage";
import { AboutPage } from "./pages/AboutPage";
import { ReferencePage } from "./pages/ReferencePage";

/**
 * Canonical routes live under `/journey`, `/possible-journeys`, `/publication`,
 * `/explore/fields`, `/glossary`, `/reference`, `/about`, and `/search`.
 *
 * Alias redirects keep older bookmarks working:
 * - `/stations` and `/stations/:id` → `/journey` and `/journey/:id`
 * - `/trace` → `/explore/fields`
 *
 * More-specific journey release routes are declared before the parametric
 * station route so `/journey/4-record/:releaseId` is never swallowed.
 */
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/journey" replace />} />

        {/* Alias redirects (legacy / alternate paths) */}
        <Route path="/stations" element={<Navigate to="/journey" replace />} />
        <Route path="/stations/:stationId" element={<LegacyStationRedirect />} />
        <Route path="/trace" element={<Navigate to="/explore/fields" replace />} />
        <Route path="/explore" element={<Navigate to="/explore/fields" replace />} />

        <Route path="/journey" element={<JourneyHub />} />
        <Route path="/journey/4-record/:releaseId" element={<ReleasePage />} />
        <Route path="/journey/:stationId" element={<StationPage />} />

        <Route path="/possible-journeys" element={<PossibleJourneysPage />} />
        <Route path="/possible-journeys/compare" element={<JourneyComparisonPage />} />
        <Route path="/possible-journeys/:journeyId" element={<PossibleJourneyDetailPage />} />

        <Route path="/publication" element={<PublicationPage />} />
        <Route path="/explore/fields" element={<FieldExplorerPage />} />
        <Route path="/glossary" element={<GlossaryPage />} />
        <Route path="/reference" element={<ReferencePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function LegacyStationRedirect() {
  const { stationId } = useParams();
  return <Navigate to={stationId ? `/journey/${stationId}` : "/journey"} replace />;
}
