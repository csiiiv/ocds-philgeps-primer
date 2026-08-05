import type { TeachingCallout } from "../content/stationTeaching";

export function Callout({ callout }: { callout: TeachingCallout }) {
  const cls = "callout" + (callout.variant === "warn" ? " callout--warn" : "");
  return (
    <div className={cls}>
      <span className="callout__title">{callout.title}</span>
      {callout.body}
    </div>
  );
}
