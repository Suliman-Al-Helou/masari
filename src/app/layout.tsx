import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";
import { AuthProvider } from "@/lib/context/AuthContext";
import { ToastProvider } from "@/lib/context/ToastContext";

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
      <body className={`${tajawal.variable} font-sans`}>
        <AuthProvider>
          <ToastProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}