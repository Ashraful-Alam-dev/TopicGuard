"use client"

import Link from "next/link"
import { ArrowLeft, Crown, GraduationCap, Mail, User as UserIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ChangePasswordForm } from "@/components/profile/change-password-form"
import { useProfile } from "@/lib/hooks/use-users"
import { getInitials } from "@/lib/utils-format"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function ProfilePage() {
  const { data: profile, isLoading, isError } = useProfile()

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        back
      </Link>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : isError || !profile ? (
        <EmptyState
          icon={UserIcon}
          title="Couldn't load your profile"
          description="Something went wrong. Please try again."
        />
      ) : (
        <>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Profile
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your account details and password.
            </p>
          </div>

          <Card className="px-4">
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-foreground">
                  {profile.name}
                </p>
                <p className="flex items-center gap-1.5 truncate text-base text-muted-foreground">
                  <Mail className="size-4 shrink-0" />
                  {profile.email}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 py-4">
                <Crown className="size-4 text-warning" />
                <p className="text-lg font-semibold text-foreground">
                  {profile.classroomsAsMonitor}
                </p>
                <p className="text-xs text-muted-foreground">
                  Classrooms as Monitor
                </p>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 py-4">
                <GraduationCap className="size-4 text-muted-foreground" />
                <p className="text-lg font-semibold text-foreground">
                  {profile.classroomsAsStudent}
                </p>
                <p className="text-xs text-muted-foreground">
                  Classrooms as Student
                </p>
              </div>
            </div>
          </Card>

          <ChangePasswordForm />
        </>
      )}
    </div>
  )
}
