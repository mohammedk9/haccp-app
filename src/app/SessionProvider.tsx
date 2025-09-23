// src/app/SessionProvider.tsx
'use client';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';
import type { Session as NextAuthSession } from 'next-auth';

interface Props {
  children: ReactNode;
  session?: NextAuthSession;
}

export function SessionProvider({ children, session }: Props) {
  return <NextAuthSessionProvider session={session}>{children}</NextAuthSessionProvider>;
}


