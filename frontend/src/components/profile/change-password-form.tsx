"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Lock } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getApiErrorMessage } from "@/lib/api/client"
import { useChangePassword } from "@/lib/hooks/use-users"
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/lib/validation/auth"

export function ChangePasswordForm() {
  const changePassword = useChangePassword()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  })

  function onSubmit(values: ChangePasswordFormValues) {
    changePassword.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          toast.success("Password changed")
          reset()
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    )
  }

  return (
    <Card className="px-4">
      <CardHeader className="px-0">
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          Update the password you use to sign in.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="currentPassword">Current password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="pl-8"
                aria-invalid={!!errors.currentPassword}
                {...register("currentPassword")}
              />
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-destructive">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

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

          <div>
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Update password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
