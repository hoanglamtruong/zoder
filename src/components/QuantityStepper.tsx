export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}) {
  function clamp(next: number) {
    if (next < min) return min;
    if (max !== undefined && next > max) return max;
    return next;
  }

  return (
    <div className="inline-flex items-center rounded-lg border border-neutral-300 overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        className="h-9 w-9 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent"
        disabled={value <= min}
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const parsed = Number(e.target.value.replace(/\D/g, ""));
          if (!Number.isNaN(parsed) && e.target.value !== "") onChange(clamp(parsed));
        }}
        className="h-9 w-12 border-x border-neutral-300 text-center text-sm outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        className="h-9 w-9 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent"
        disabled={max !== undefined && value >= max}
      >
        +
      </button>
    </div>
  );
}
