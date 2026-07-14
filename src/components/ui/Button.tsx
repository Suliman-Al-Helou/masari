type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "destructive";
  size?: "sm" | "md" | "lg";
  background?: string;
  isLoading?: boolean;
  children: React.ReactNode;
};

export default function Button({
  className,
  variant,
  background,
  children,
  isLoading,
  disabled,
  size,
  ...props
}: Props) {
  const variants: Record<NonNullable<Props["variant"]>, string> = {
    primary: 
      "bg-primary hover:bg-button-background hover:text-secondary text-secondary transition-all ",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    destructive: "bg-destructive text-white hover:bg-destructive/90",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm", // 👈 أحجام هنا
    md: "px-4 py-2 text-base", // 👈 أحجام هنا
    lg: "px-6 py-3 text-lg", // 👈 أحجام هنا
  };
  return (
    <button
      className={`text-primary text-sm font-semibold hover:text-primary/90 transition-all rounded-sm h-11 
        ${className || ""} 
        ${variant ? variants[variant] : ""} 
        ${size ? sizes[size] : ""} 
               ${background || ""}
          ${isLoading || disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? "جاري التحميل..." : children}
    </button>
  );
}
