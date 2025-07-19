// app/providers.tsx
'use client';

// import { ThemeProvider } from 'next-themes';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { SessionProvider } from 'next-auth/react';
import ChatProvider from '@/providers/ChatProvider';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  // Anything that must be created on client (e.g. new QueryClient())
  // const [queryClient] = useState(() => new QueryClient());

  return (
		<ChatProvider>
			{children}
		</ChatProvider>
  );
}
