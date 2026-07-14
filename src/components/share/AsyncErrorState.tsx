import { RefreshCw } from "lucide-react";

interface AsyncErrorStateProps {
  title: string;
  description?: string;
  onRetry: () => void | Promise<unknown>;
  isRetrying?: boolean;
  retryLabel?: string;
  className?: string;
}

export default function AsyncErrorState({
  title,
  description,
  onRetry,
  isRetrying = false,
  retryLabel = "إعادة المحاولة",
  className = "",
}: AsyncErrorStateProps) {
  return (
    <div
      role="alert"
      aria-busy={isRetrying}
      className={`flex min-h-48 flex-col items-center justify-center text-center ${className}`}
    >
      <p className="font-medium text-foreground">{title}</p>

      {description && (
        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      )}

      <button
        type="button"
        onClick={() => void onRetry()}
        disabled={isRetrying}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground outline-none transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
      >
        <RefreshCw
          aria-hidden="true"
          className={`h-4 w-4 ${
            isRetrying ? "animate-spin" : ""
          } motion-reduce:animate-none`}
        />

        {isRetrying ? "جارٍ المحاولة..." : retryLabel}
      </button>
    </div>
  );
}