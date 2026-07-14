import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
type Props = {
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
  placeholder: string;
  label: string;
};
export default function AutocompleteInput({
  value,
  onChange,
  suggestions,
  placeholder,
  label,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const filtered = suggestions.filter(
    (s) => s.includes(value) || s.toLowerCase().includes(value.toLowerCase()),
  );
  return (
    <div className="flex flex-col gap-1.5 relative" ref={ref}>
      <label className="text-sm font-bold text-foreground">{label}</label>
      <div className="relative flex items-center">
        <Search
          size={14}
          className="absolute right-3 text-muted-foreground pointer-events-none"
        />
        <Input
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="w-full pr-9 pl-8 py-2.5 "
        />
        {value && (
          <Button
            onClick={() => {
              onChange("");
            }}
            className="absolute left-2.5 text-muted-foreground hover:text-foreground"
          >
            <X size={13} />
          </Button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full right-0 left-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
          {filtered.map((s) => (
            <Button
              key={s}
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
              className="w-full px-4 py-2.5 text-right text-sm hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {s}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}