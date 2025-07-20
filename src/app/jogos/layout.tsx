'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { StudentProgressProvider } from '@/contexts/StudentProgressContext';

export default function JogosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <StudentProgressProvider>
        {children}
      </StudentProgressProvider>
    </AuthProvider>
  );
}
