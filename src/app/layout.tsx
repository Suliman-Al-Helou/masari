import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";
import { AuthProvider } from "@/lib/context/AuthContext";
import { ToastProvider } from "@/lib/context/ToastContext";
import AuthGuard from "@/components/auth/AuthGuard";
import QueryProvider from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/lib/context/ThemeContext";
const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-main",
});

export const metadata: Metadata = {
  title: "مساري",
  description: "منصة جامعية عربية",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.variable} font-main`}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <QueryProvider>
                <AuthGuard>
                  <AppLayout>{children}</AppLayout>
                </AuthGuard>
              </QueryProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
