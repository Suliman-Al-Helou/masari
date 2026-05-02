// components/layout/TopBar.tsx
import { Menu, Bell, Settings } from 'lucide-react';

interface TopBarProps {
  user: { full_name: string };
  onMenuToggle: () => void;
  onLogout: () => void;   // ← أضف هذا
}

export default function TopBar({ user, onMenuToggle }: TopBarProps) {
  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
    : '؟';

  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">

        {/* Right side - menu + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors"
          >
            
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <h2 className="text-lg font-bold text-foreground hidden sm:block">
            لوحة المتعلم
          </h2>
        </div>

        {/* Left side - actions */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </button>
          <button className="p-2 rounded-xl hover:bg-muted transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-2 pr-2 border-r border-border">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-bold">
                {initials}
              </span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}