type Props = {
  options: string[];
  value: string;
  onChange: (v: string) => void;
};

export default function ChipsRow({
  options,
  value,
  onChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${value === o ? "bg-primary border-primary text-white" : "border-border bg-background text-foreground hover:border-primary hover:text-primary"}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}