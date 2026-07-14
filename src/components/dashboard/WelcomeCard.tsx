'use client';

import { useEffect, useState } from 'react';

type Props = {
  user: {
    full_name: string;
    major?:    string;
    semester?: string;
  };
};

function useLiveTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function getGreeting(hour: number) {
  if (hour < 12) return 'صباح الخير';
  if (hour < 17) return 'مساء الخير';
  return 'مساء النور';
}

export default function WelcomeCard({ user }: Props) {
  const now = useLiveTime();

  const gregorian = now.toLocaleDateString('ar-SA', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });

  const hijri = now.toLocaleDateString('ar-SA-u-ca-islamic', {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
  });

  const time = now.toLocaleTimeString('ar-SA', {
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const greeting = getGreeting(now.getHours());

  return (
    <div className="bg-primary rounded-2xl p-6 text-primary-foreground">
      <div className="flex items-start justify-between gap-4 flex-wrap">

        {/* اليسار — اسم وتخصص */}
        <div>
          <p className="text-sm opacity-75 mb-1">{greeting}،</p>
          <h1 className="text-2xl font-semibold">{user.full_name}</h1>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {user.major && (
              <span className="text-sm bg-white/15 px-3 py-1 rounded-full">
                {user.major}
              </span>
            )}
            {user.semester && (
              <span className="text-sm bg-white/15 px-3 py-1 rounded-full">
                {user.semester}
              </span>
            )}
          </div>
        </div>

        {/* اليمين — الوقت والتاريخ */}
        <div className="text-left bg-white/10 rounded-xl px-4 py-3 min-w-fit">
          <p className="text-xl font-semibold tracking-wide" dir="ltr">
            {time}
          </p>
          <p className="text-xs opacity-80 mt-1">{gregorian}</p>
          <p className="text-xs opacity-60 mt-0.5">{hijri}</p>
        </div>

      </div>
    </div>
  );
} 