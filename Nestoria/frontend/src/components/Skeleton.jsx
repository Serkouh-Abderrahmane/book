export function SkeletonCard({ count = 4 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="skeleton skeleton-card" style={{ width: 280, flexShrink: 0, borderRadius: 'var(--radius-lg)' }} />
  ));
}

export function SkeletonText({ lines = 3, width = '80%' }) {
  return Array.from({ length: lines }).map((_, i) => (
    <div key={i} className="skeleton skeleton-text" style={{ width: i === lines - 1 ? '50%' : width }} />
  ));
}

export function SkeletonDetail() {
  return (
    <div className="container-wide" style={{ paddingTop: 24 }}>
      <div className="skeleton" style={{ height: 320, borderRadius: 'var(--radius-xl)', marginBottom: 32 }} />
      <div className="skeleton" style={{ height: 28, width: '60%', borderRadius: 8, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 16, width: '40%', borderRadius: 8, marginBottom: 32 }} />
      <div className="skeleton" style={{ height: 120, borderRadius: 12 }} />
    </div>
  );
}
