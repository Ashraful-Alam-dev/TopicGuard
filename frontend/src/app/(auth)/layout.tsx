import Link from "next/link";
import { ShieldCheckIcon } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-1 flex-col items-center justify-center bg-background px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <ShieldCheckIcon className="size-6 text-primary" />
        <span className="font-heading text-xl font-bold tracking-tight">
          TopicGuard
        </span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
