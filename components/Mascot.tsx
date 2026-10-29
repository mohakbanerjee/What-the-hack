export function Mascot({ className = "" }: { className?: string }) {
  return (
    <div className={`mascot-halo ${className}`}>
      <div className="mascot" aria-hidden="true">
        <span className="brain">🧠</span>
        <span className="shades">😎</span>
      </div>
    </div>
  );
}
