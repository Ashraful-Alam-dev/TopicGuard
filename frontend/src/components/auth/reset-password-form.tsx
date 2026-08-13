"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Loader2, Lock } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi } from "@/lib/api/auth"
import { getApiErrorMessage } from "@/lib/api/client"
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validation/auth"

export function ResetPasswordForm({
  email,
  otp,
}: {
  email: string
  otp: string
}) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const mutation = useMutation({
    mutationFn: (values: ResetPasswordFormValues) =>
      authApi.resetPassword({
        email,
        otp,
        newPassword: values.newPassword,
      }),
    onSuccess: () => {
      toast.success("Password reset. Sign in with your new password")
      router.push("/login")
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Set a new password
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Choose a new password for {email}.
        </p>
      </div>

      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="newPassword">New password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="pl-8"
              aria-invalid={!!errors.newPassword}
              {...register("newPassword")}
            />
          </div>
          {errors.newPassword ? (
            <p className="text-xs text-destructive">
              {errors.newPassword.message}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              At least 6 characters, with a letter and a number.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="pl-8"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="mt-2 w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
          Reset password
        </Button>
      </form>
    </div>
  )
}
