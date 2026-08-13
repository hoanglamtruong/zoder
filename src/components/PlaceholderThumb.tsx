const GRADIENTS = [
  "from-brand to-brand-light",
  "from-orange-500 to-amber-400",
  "from-rose-500 to-orange-400",
  "from-red-500 to-orange-500",
  "from-amber-500 to-yellow-400",
  "from-orange-600 to-rose-400",
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export default function PlaceholderThumb({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  const gradient = GRADIENTS[hashString(label) % GRADIENTS.length];
  const initial = label.trim().charAt(0).toUpperCase() || "Z";

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br ${gradient} text-white font-bold select-none ${className}`}
    >
      <span className="drop-shadow-sm">{initial}</span>
    </div>
  );
}
