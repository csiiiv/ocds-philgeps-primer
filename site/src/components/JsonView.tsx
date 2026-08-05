interface JsonViewProps {
  data: unknown;
  label: string;
  collapsed?: boolean;
}

export function JsonView({ data, label, collapsed = false }: JsonViewProps) {
  return (
    <details className="json-view" open={!collapsed}>
      <summary>{label}</summary>
      <pre tabIndex={0} aria-label={`${label} JSON`}>
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </details>
  );
}
