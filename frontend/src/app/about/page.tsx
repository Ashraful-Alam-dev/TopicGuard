"use client"

import type { ComponentType } from "react"
import Link from "next/link"
import {
  BookOpenCheck,
  Code2,
  Cpu,
  Fingerprint,
  Layers,
  Lightbulb,
  Mail,
  Megaphone,
  Phone,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Footer } from "@/components/shared/footer"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { useAuth } from "@/lib/hooks/use-auth"

const techStack = [
  { layer: "Frontend", items: "Next.js, React, TypeScript, Tailwind CSS" },
  { layer: "Backend", items: "NestJS, REST endpoints, cookie-based sessions" },
  { layer: "Database", items: "PostgreSQL" },
  { layer: "Embedding Engine", items: "Xenova Mini LM" },
  { layer: "AI Consultation", items: "Grok API" },
]

const features = [
  {
    icon: Users,
    title: "Classrooms",
    description:
      "Monitors create a classroom and share a join code. Students join with that code — no setup on their end.",
  },
  {
    icon: BookOpenCheck,
    title: "Submission windows",
    description:
      "Monitors open a topic-registration window with a start and close date, so topics only come in when they should.",
  },
  {
    icon: Fingerprint,
    title: "Topic registration",
    description:
      "Students register a topic, solo or as a team, and see immediately whether something close already exists.",
  },
  {
    icon: ScanSearch,
    title: "Similarity detection",
    description:
      "Every new topic is compared against existing ones, with a similarity score and the closest matches surfaced.",
  },
  {
    icon: Sparkles,
    title: "AI consult",
    description:
      "Students can ask for feedback on a working title and get a score, notes on uniqueness, and alternative topics.",
  },
  {
    icon: Megaphone,
    title: "Announcements",
    description:
      "Monitors post updates to the whole classroom, so schedule changes and reminders reach everyone at once.",
  },
]

const useCaseSteps = [
  {
    title: "A monitor sets up the classroom",
    description:
      "A teacher or class monitor creates a classroom and shares the join code with the class.",
  },
  {
    title: "Students join",
    description:
      "Each student joins with the code and lands on a shared dashboard for that classroom.",
  },
  {
    title: "The monitor opens a submission",
    description:
      "The monitor creates a submission window — a title, optional description, and an open/close date — for topic registration.",
  },
  {
    title: "Students register topics",
    description:
      "While the window is open, students submit a topic title, alone or with teammates.",
  },
  {
    title: "TopicGuard checks for overlap",
    description:
      "Each title is compared against everything already registered for that submission, and a similarity score is returned instantly.",
  },
  {
    title: "Everyone adjusts before it's a problem",
    description:
      "Students who land on a near-duplicate can see the closest matches and pick a more distinct angle before the window closes.",
  },
  {
    title: "Immediate feedback of selected topic based on course and submission details",
    description:
      "Instant feedback can be seen which helps to select better ideas or improve the current one.",
  },
]

const developers = [
  {
    name: "Ashraful Alam",
    intro:
      "Software Engineering student at SUST, focused on building practical solutions for real classroom problems through software and AI.",
    email: "ashrafulalam.rma@gmail.com",
    phone: "+8801572915649",
    facebook: "https://www.facebook.com/ashraful.alam.931253",
    github: "https://github.com/Ashraful-Alam-dev",
  },
]

export default function AboutPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" strokeWidth={2.25} />
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              TopicGuard
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {isAuthenticated ? "Dashboard" : "Sign in"}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#0F172A]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 50% at 15% 10%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(50% 40% at 90% 90%, rgba(37,99,235,0.18), transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
            <Badge className="gap-1.5 bg-white/10 text-slate-200">
              <Sparkles className="size-3" />
              About us
            </Badge>
            <h1 className="mt-4 max-w-2xl text-3xl leading-tight font-semibold tracking-tight text-slate-50 sm:text-4xl">
              Every idea checked before it&apos;s claimed twice.
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-400">
              TopicGuard helps classrooms register project topics and catch
              overlapping ideas automatically, instead of discovering the
              duplicate at the eleventh hour.
            </p>
          </div>
        </section>

        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-12 sm:px-6">
          {/* What is TopicGuard */}
          <Card className="p-6">
            <SectionHeading
              icon={ShieldCheck}
              title="What is TopicGuard?"
              eyebrow="Overview"
            />
            <p className="mt-4 leading-7 text-muted-foreground">
              TopicGuard is a classroom tool for registering project or thesis
              topics and catching duplicates before they cause problems. A
              class monitor sets up a classroom and a submission window;
              students register their topic titles; TopicGuard compares each
              new title against everything already submitted and flags close
              matches with a similarity score, so overlap gets resolved while
              there is still time to change the topic.
            </p>
          </Card>

          {/* Why built */}
          <Card className="p-6">
            <SectionHeading
              icon={Lightbulb}
              title="Why TopicGuard was built"
              eyebrow="The problem"
            />
            <p className="mt-4 leading-7 text-muted-foreground">
              Reviewing dozens or hundreds of submitted topics by hand to spot
              overlap doesn&apos;t scale, and duplicates are usually found too
              late — after students have already invested weeks of work.
              TopicGuard moves that check to the moment of registration, so a
              student sees whether their topic already exists while they can
              still pick a different angle, and a monitor no longer has to
              cross-reference every title manually.
            </p>
          </Card>

          {/* Complete system use case */}
          <Card className="p-6">
            <SectionHeading
              icon={Users}
              title="Complete system use case"
              eyebrow="How a classroom uses it, start to finish"
            />
            <div className="mt-5 flex flex-col gap-5">
              {useCaseSteps.map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                      {index + 1}
                    </div>
                    {index < useCaseSteps.length - 1 && (
                      <div className="mt-1 w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className="pb-1">
                    <p className="text-sm font-medium text-foreground">
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Feature overview */}
          <Card className="p-6">
            <SectionHeading
              icon={Layers}
              title="Feature overview"
              eyebrow="What's included"
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-lg border border-border bg-muted/30 p-4"
                >
                  <feature.icon className="size-4 text-primary" />
                  <p className="mt-2.5 text-sm font-medium text-foreground">
                    {feature.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* AI & similarity detection overview */}
          <Card className="p-6">
            <SectionHeading
              icon={ScanSearch}
              title="AI & similarity detection overview"
              eyebrow="How overlap gets caught"
            />
            <p className="mt-4 leading-7 text-muted-foreground">
              When a topic is registered, TopicGuard normalizes the title and
              compares it against every other topic already registered for
              that submission, returning a highest-similarity score and a
              short list of the closest matches. Students can also consult
              the AI assistant before registering — it scores a working
              title for uniqueness and relevance, and suggests alternative
              directions when the topic is too close to something that
              already exists.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">Similarity scoring</Badge>
              <Badge variant="secondary">Duplicate detection</Badge>
              <Badge variant="secondary">AI-assisted feedback</Badge>
              <Badge variant="secondary">Alternative topic suggestions</Badge>
            </div>
          </Card>

          {/* Technology architecture */}
          <Card className="p-6">
            <SectionHeading
              icon={Cpu}
              title="Technology architecture"
              eyebrow="What it's built on"
            />
            <div className="mt-5 flex flex-col gap-0">
              {techStack.map((row, index) => (
                <div key={row.layer}>
                  <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-6">
                    <span className="w-36 shrink-0 text-sm font-medium text-foreground">
                      {row.layer}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {row.items}
                    </span>
                  </div>
                  {index < techStack.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </Card>

          {/* Developer information */}
          <Card className="p-6">
            <SectionHeading
              icon={Code2}
              title="Developer information"
              eyebrow="Who built it"
            />

            <div className="mt-6">
              {developers.map((dev) => (
                <div
                  key={dev.name}
                  className="mx-auto max-w-4xl rounded-xl border border-border bg-card/60 p-6 shadow-sm transition-all hover:border-border/80"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">
                      {dev.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {dev.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">Lead Developer</p>
                    </div>
                  </div>

                  <p className="mt-4 leading-relaxed text-sm text-muted-foreground">
                    {dev.intro}
                  </p>

                  <Separator className="my-5" />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <a
                      href={`mailto:${dev.email}`}
                      className="group flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/60"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-primary shadow-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Mail className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Email</p>
                        <p className="truncate text-sm font-medium text-foreground">{dev.email}</p>
                      </div>
                    </a>

                    <a
                      href={`tel:${dev.phone}`}
                      className="group flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/60"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-primary shadow-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Phone className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Phone</p>
                        <p className="truncate text-sm font-medium text-foreground">{dev.phone}</p>
                      </div>
                    </a>

                    <Link
                      href={dev.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/60"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-primary shadow-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <svg className="size-4 fill-current" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Facebook</p>
                        <p className="truncate text-sm font-medium text-foreground">Ashraful Alam</p>
                      </div>
                    </Link>

                    <Link
                      href={dev.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/60"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-primary shadow-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <svg className="size-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-muted-foreground">GitHub</p>
                        <p className="truncate text-sm font-medium text-foreground">Ashraful-Alam-dev</p>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {!isAuthenticated && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Ready to set up a classroom or join one?
              </p>
              <Link
                href="/login"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Join & Explore
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
}: {
  icon: ComponentType<{ className?: string }>
  eyebrow: string
  title: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent">
        <Icon className="size-5 text-accent-foreground" />
      </div>
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {eyebrow}
        </p>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
    </div>
  )
}