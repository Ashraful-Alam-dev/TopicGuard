import Link from "next/link";
import { Info, ShieldCheck } from "lucide-react";

import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthBrandPanel />

      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between px-6 pt-6 sm:px-10">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground lg:hidden"
          >
            <ShieldCheck className="size-5 text-primary" strokeWidth={2.25} />
            <span className="text-[15px] font-semibold tracking-tight">
              TopicGuard
            </span>
          </Link>
          <div className="lg:ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 sm:px-10">
          <div className="w-full max-w-sm">
            {/* Free-tier backend sleeps when idle, so the very first request can time out */}
            <Alert className="mb-4">
              <Info />
              <AlertDescription>
                <AlertDescription>
  The server may take a few seconds to start. If your request fails, please wait a few seconds and try again.
</AlertDescription>
              </AlertDescription>
            </Alert>
            {children}
          </div>

          <Link href="/about" className="w-full max-w-sm">
            <Button variant="outline" size="sm" className="w-full">
              About TopicGuard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
