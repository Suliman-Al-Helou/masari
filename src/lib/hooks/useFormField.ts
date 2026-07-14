import { useState } from 'react';

export function useFormField(initialValue = '') {
  const [value, setValue]   = useState(initialValue);
  const [error, setError]   = useState('');
  const [touched, setTouched] = useState(false);

  const validate = (rules: Array<(v: string) => string | null>) => {
      setTouched(true);
    for (const rule of rules) {
      const msg = rule(value);
      if (msg) { setError(msg); return false; }
    }
    setError('');
    return true;
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (touched) setError(''); // امسح الخطأ لما يبدأ يكتب
  };

  const onBlur = () => setTouched(true);

  return { value, error, touched, onChange, onBlur, validate, setError };
}

// Rules جاهزة
export const rules = {
  required: (label: string) => (v: string) =>
    !v.trim() ? `${label} مطلوب` : null,
  email: () => (v: string) =>
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'البريد الإلكتروني غير صحيح' : null,
  minLength: (n: number) => (v: string) =>
    v.length < n ? `يجب أن يكون ${n} أحرف على الأقل` : null,
  match: (other: string, label: string) => (v: string) =>
    v !== other ? `${label} غير متطابق` : null,
};