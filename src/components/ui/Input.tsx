type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export default function Input({ hasError, className, ...props }: Props) {
  return (
    <input
      className={`
        w-full h-11 bg-background outline-none rounded-sm 
        text-foreground placeholder:text-muted-foreground
        py-2 pr-2 transition-all 
        ${hasError ? "border border-destructive" : "border border-border focus:border-primary"}
        ${className ?? ""}
      `}
      aria-invalid={hasError}
      {...props}
    />
  );
}
