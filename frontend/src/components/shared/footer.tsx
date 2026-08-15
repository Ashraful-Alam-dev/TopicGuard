import { ShieldCheck } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-1.5 px-4 py-6 text-center text-sm text-muted-foreground sm:px-6">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="size-4 text-primary" strokeWidth={2.25} />
          <span className="font-medium text-foreground">TopicGuard</span>
        </div>
        <p className="text-xs text-muted-foreground/80">
          Duplicate topics, caught early · &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
