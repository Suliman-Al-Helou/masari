import type { AdminDoctor } from "@/types/admin";

type DoctorExtended = AdminDoctor;

// ─── حوار تأكيد الحذف ────────────────────────────────────────────────────────
export function DeleteConfirm({
  doctor,
  onConfirm,
  onCancel,
  loading,
}: {
  doctor: DoctorExtended;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div
      style={{
        minHeight: 320,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      className="fixed inset-0 z-50"
    >
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              تأكيد الحذف
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              هذا الإجراء لا يمكن التراجع عنه
            </p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-xl px-4 py-3 mb-4">
          <p className="text-sm font-medium text-foreground">{doctor.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {doctor.university} · {doctor.major}
          </p>
        </div>

        <p className="text-xs text-destructive mb-5">
          سيتم حذف الدكتور وجميع تقييماته نهائياً.
        </p>

        <div className="flex gap-2.5">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {loading ? "جاري الحذف..." : "حذف نهائياً"}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-muted transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}