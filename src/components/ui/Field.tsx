// components/auth/Field.tsx

type Props = {
  label: string;
  error: string;
  touched: boolean;
  hint?: React.ReactNode; // اختياري — لزر "نسيت كلمة المرور؟"
  children: React.ReactNode; // الـ input نفسه
};

export default function Field({
  label,
  error,
  touched,
  hint,
  children,
}: Props) {
  return (
    <div className="">
      <div className="">
        <label>{label}</label>
        <span className="text-primary text-[13px] pr-1">{hint}</span>
      </div>
      {children}
      {touched && error && <span className="">⚠ {error}</span>}
    </div>
  );
}
