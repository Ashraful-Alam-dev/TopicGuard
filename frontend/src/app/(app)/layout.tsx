import { AppHeader } from "@/components/shared/app-header";
import { AuthGuard } from "@/components/shared/auth-guard";
import { Footer } from "@/components/shared/footer";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-background">
        <AppHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
