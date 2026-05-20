type LoadingPanelProps = {
  message?: string;
};

export function LoadingPanel({ message }: LoadingPanelProps) {
  return (
    <div className="loading-panel" role="status" aria-label={message ?? "Loading"} aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      {message ? <span>{message}</span> : null}
    </div>
  );
}

export function LoadingPage({ message }: LoadingPanelProps) {
  return (
    <main className="dashboard-page">
      <section className="dashboard-shell">
        <LoadingPanel message={message} />
      </section>
    </main>
  );
}
