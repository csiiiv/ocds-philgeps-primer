export interface ViewChoice { id: string; label: string }

export function ViewTabs({ id, label, items, value, onChange }: {
  id: string; label: string; items: ViewChoice[]; value: string; onChange: (value: string) => void;
}) {
  return <div className="workspace-tabs" role="tablist" aria-label={label}>
    {items.map((item, index) => <button key={item.id} id={`${id}-tab-${item.id}`} type="button" role="tab"
      aria-selected={value === item.id} aria-controls={`${id}-panel-${item.id}`} tabIndex={value === item.id ? 0 : -1}
      onClick={() => onChange(item.id)} onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
        onChange(items[next].id);
        document.getElementById(`${id}-tab-${items[next].id}`)?.focus();
      }}>{item.label}</button>)}
  </div>;
}
