"use client";

import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { SettingsProvider } from "@/contexts/settings-context";
import { AppProvider } from "@/contexts/app-context";
import { LanguageProvider } from "@/contexts/language-context";
import { GlobalModals } from "@/components/global-modals";
import { AppLayout } from "@/components/app-layout";
import { LoginForm } from "@/components/auth/login-form";

function AppContent() {
  const { isAuthenticated, hasAccounts } = useAuth();

  // If no accounts exist, go directly to the app (settings will be accessible)
  if (!hasAccounts || isAuthenticated) {
    return (
      <>
        <AppLayout />
        <GlobalModals />
      </>
    );
  }

  // If accounts exist but user is not authenticated, show login
  return <LoginForm />;
}

export default function Home() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SettingsProvider>
          <AppProvider>
            <AppContent />
            <Toaster
              position="top-right"
              expand={true}
              richColors
              closeButton
              toastOptions={{
                duration: 4000,
              }}
            />
          </AppProvider>
        </SettingsProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
