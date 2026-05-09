'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, LogOut, ChevronRight, GraduationCap } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants/navigation';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

export default function Sidebar({ isOpen, onToggle, onLogout }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay للموبايل */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-full bg-primary z-50 transition-all duration-300 ease-in-out flex flex-col
          lg:translate-x-0
          ${isOpen ? 'translate-x-0 w-64' : 'translate-x-full w-64'}
          ${isOpen ? 'lg:w-64' : 'lg:w-20'}
        `}
      >
        <div className="flex flex-col h-full p-4">

          {/* Header */}
          <div className={`flex items-center h-12 mb-8 ${isOpen ? 'justify-between' : 'lg:justify-center'}`}>
            {/* Logo */}
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h1 className={`text-xl font-bold text-white transition-all duration-300 whitespace-nowrap
                ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 lg:hidden'}
              `}>
                مساري
              </h1>
            </div>

            {/* زر الإغلاق — موبايل */}
            <button onClick={onToggle} className="lg:hidden text-white/70 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>

            {/* زر الإغلاق — ديسكتوب */}
            <button
              onClick={onToggle}
              className={`hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white
                ${isOpen ? '' : 'rotate-180'}
              `}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
                  title={!isOpen ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                    }
                    ${!isOpen ? 'lg:justify-center' : ''}
                  `}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden
                    ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 lg:hidden'}
                  `}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* تسجيل الخروج */}
          <button
            onClick={onLogout}
            title={!isOpen ? 'تسجيل الخروج' : undefined}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all
              ${!isOpen ? 'lg:justify-center' : ''}
            `}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden
              ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 lg:hidden'}
            `}>
              تسجيل الخروج
            </span>
          </button>

        </div>
      </aside>
    </>
  );
}