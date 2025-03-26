"use client";

import { ClerkProvider } from "@clerk/nextjs";
import React from "react";
import { ThemeProvider } from "./ThemeProvider";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

interface ProviderProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient();

export default function Providers({ children }: ProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ClerkProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </ClerkProvider>
    </QueryClientProvider>
  );
}
