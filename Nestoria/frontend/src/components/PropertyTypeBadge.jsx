export default function PropertyTypeBadge({ type }) {
  if (!type) return null;

  return (
    <div
      aria-hidden={false}
      className="property-type-badge"
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        background: 'var(--primary)',
        color: 'white',
        padding: '6px 10px',
        borderRadius: 999,
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '0.02em',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        whiteSpace: 'nowrap',
        zIndex: 10,
      }}
    >
      {type}
    </div>
  );
}
