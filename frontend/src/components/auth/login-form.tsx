"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Lock, Mail } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi } from "@/lib/api/auth"
import { getApiErrorMessage } from "@/lib/api/client"
import { AUTH_QUERY_KEY } from "@/lib/hooks/use-auth"
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, data.user)
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}`)
      router.push(searchParams.get("next") ?? "/dashboard")
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Sign in
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter your details to access your classrooms.
        </p>
      </div>

      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@school.edu"
              className="pl-8"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="pl-8"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
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
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}
