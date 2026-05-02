export default function UserNotRegisteredError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background" dir="rtl">
      <div className="max-w-md w-full p-8 bg-card rounded-2xl shadow-lg border border-border">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-warning/10">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">غير مسجل</h1>
          <p className="text-muted-foreground mb-6">
            أنت غير مسجل في هذا التطبيق. تواصل مع المسؤول للحصول على صلاحية الوصول.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}