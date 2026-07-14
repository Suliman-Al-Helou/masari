// Path: src/components/ui/CustomSelect.tsx
// Create this reusable component for every select in the project

"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Check, ChevronDown } from "lucide-react";

export type CustomSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly (string | CustomSelectOption)[];
  placeholder: string;
  ariaLabel?: string;
  disabled?: boolean;
  showPlaceholderOption?: boolean;
  className?: string;
}

// Converts string options to reusable option objects
function normalizeOptions(
  options: readonly (string | CustomSelectOption)[],
): CustomSelectOption[] {
  return options.map((option) =>
    typeof option === "string"
      ? { value: option, label: option }
      : option,
  );
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
  disabled = false,
  showPlaceholderOption = true,
  className = "",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const listboxId = useId();
  const normalizedOptions = normalizeOptions(options);

  const selectedOption = normalizedOptions.find(
    (option) => option.value === value,
  );

  useEffect(() => {
    if (!open) return;

    // Closes the menu when clicking outside
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    // Closes the menu with the Escape key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Selects an option and restores focus
  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);

    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  };

  return (
    <div
      ref={rootRef}
      className={`relative min-w-0 ${className}`}
    >
      {/* Select trigger */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel ?? placeholder}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-11 w-full items-center justify-between gap-3 rounded-xl border px-3 text-sm outline-none transition ${
          open
            ? "border-primary bg-background ring-2 ring-primary/20"
            : "border-border bg-background hover:border-primary/40"
        } ${
          selectedOption
            ? "text-foreground"
            : "text-muted-foreground"
        } disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none`}
      >
        <span className="min-w-0 truncate">
          {selectedOption?.label ?? placeholder}
        </span>

        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          } motion-reduce:transition-none`}
        />
      </button>

      {/* Select options */}
      {open && !disabled && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel ?? placeholder}
          className="absolute start-0 top-[calc(100%+0.375rem)] z-50 min-w-full max-w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card shadow-xl"
        >
          {showPlaceholderOption && (
            <>
              <button
                type="button"
                role="option"
                aria-selected={!value}
                onClick={() => handleSelect("")}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-start text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted ${
                  !value
                    ? "font-medium text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <span>{placeholder}</span>

                {!value && (
                  <Check
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0"
                  />
                )}
              </button>

              <div className="border-t border-border" />
            </>
          )}

          {/* Scrollable options list */}
          <div className="max-h-56 overflow-y-auto overscroll-contain">
            {normalizedOptions.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-start text-sm outline-none transition-colors ${
                    isSelected
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-foreground hover:bg-muted focus-visible:bg-muted"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <span className="min-w-0 whitespace-normal">
                    {option.label}
                  </span>

                  {isSelected && (
                    <Check
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}