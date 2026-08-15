"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { KeyRound, Loader2, MailQuestion } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi } from "@/lib/api/auth"
import { getApiErrorMessage } from "@/lib/api/client"
import { useResendCooldown } from "@/lib/hooks/use-resend-cooldown"
import { otpSchema, type OtpFormValues } from "@/lib/validation/auth"

export function ForgotPasswordOtpForm({
  email,
  onVerified,
  onBack,
}: {
  email: string
  onVerified: (otp: string) => void
  onBack: () => void
}) {
  const cooldown = useResendCooldown()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
  })

  const verifyMutation = useMutation({
    mutationFn: (values: OtpFormValues) =>
      authApi.verifyForgotPasswordOtp({ email, otp: values.otp }),
    onSuccess: (_data, variables) => {
      toast.success("Code verified")
      onVerified(variables.otp)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  // The backend doesn't expose a dedicated resend endpoint for this flow —
  // re-requesting a code goes through the same forgot-password endpoint.
  const resendMutation = useMutation({
    mutationFn: () => authApi.forgotPassword({ email }),
    onSuccess: () => {
      toast.success("A new code has been sent")
      cooldown.start()
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex size-11 items-center justify-center rounded-full bg-accent">
          <KeyRound className="size-5 text-accent-foreground" />
        </div>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
          Enter your code
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter the 6-digit code we sent to{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
      </div>

      <Alert>
        <MailQuestion />
        <AlertDescription>
          If you do not receive the email within a few minutes, please check
          your Spam folder. If you still do not receive it, please contact
          us.
        </AlertDescription>
      </Alert>

      <form
        onSubmit={handleSubmit((values) => verifyMutation.mutate(values))}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="otp" className="sr-only">
            Verification code
          </Label>
          <Input
            id="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            className="text-center font-mono text-lg tracking-[0.3em]"
            aria-invalid={!!errors.otp}
            {...register("otp")}
          />
          {errors.otp && (
            <p className="text-center text-xs text-destructive">
              {errors.otp.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={verifyMutation.isPending}
        >
          {verifyMutation.isPending && (
            <Loader2 className="size-4 animate-spin" />
          )}
          Verify code
        </Button>
      </form>

      <div className="flex flex-col items-center gap-3">
        <p className="text-center text-sm text-muted-foreground">
          Didn&apos;t get a code?{" "}
          <button
            type="button"
            onClick={() => resendMutation.mutate()}
            disabled={cooldown.isActive || resendMutation.isPending}
            className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
          >
            {resendMutation.isPending
              ? "Sending..."
              : cooldown.isActive
                ? `Resend in ${cooldown.secondsLeft}s`
                : "Resend code"}
          </button>
        </p>

        <button
          type="button"
          onClick={onBack}
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Use a different email
        </button>
      </div>
    </div>
  )
}
