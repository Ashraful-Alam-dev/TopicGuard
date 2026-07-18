import Link from "next/link";
import { ShieldCheckIcon, UsersIcon, KeyRoundIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-6 sm:px-6">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="size-5 text-primary" />
          <span className="font-heading text-base font-bold tracking-tight">
            TopicGuard
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" render={<Link href="/login" />}>
            Sign in
          </Button>
          <Button render={<Link href="/register" />}>Get started</Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <h1 className="max-w-xl text-4xl sm:text-5xl">
          Register project topics without the duplicate chaos
        </h1>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          Classrooms, join codes, and one monitor per class — the foundation
          for keeping every student&apos;s topic unique.
        </p>
        <div className="mt-8 flex gap-3">
          <Button size="lg" render={<Link href="/register" />}>
            Create your account
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/login" />}>
            Sign in
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 text-left sm:grid-cols-2">
          <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
            <KeyRoundIcon className="size-5 shrink-0 text-primary" />
            <div>
              <p className="font-heading font-bold">Join with a code</p>
              <p className="mt-1 text-sm text-muted-foreground">
                An 8-character code gets students into the right classroom in
                seconds.
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
            <UsersIcon className="size-5 shrink-0 text-primary" />
            <div>
              <p className="font-heading font-bold">One monitor, always</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Every classroom has exactly one monitor, and the role
                transfers cleanly when it needs to.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
