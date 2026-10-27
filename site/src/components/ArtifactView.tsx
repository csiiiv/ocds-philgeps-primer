import { JsonView } from "./JsonView";

export function downloadJson(data: unknown, filename: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2) + "\n"], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ArtifactView({ data, label, filename }: { data: unknown; label: string; filename: string }) {
  return <div className="artifact-view"><JsonView data={data} label={label} collapsed /><button type="button" className="lesson-button" onClick={() => downloadJson(data, filename)}>Download {label}</button></div>;
}
