"use client"

import * as React from "react"

import { ForgotPasswordEmailForm } from "@/components/auth/forgot-password-email-form"
import { ForgotPasswordOtpForm } from "@/components/auth/forgot-password-otp-form"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

type Step =
  | { name: "email" }
  | { name: "otp"; email: string }
  | { name: "reset"; email: string; otp: string }

export function ForgotPasswordFlow() {
  const [step, setStep] = React.useState<Step>({ name: "email" })

  if (step.name === "email") {
    return (
      <ForgotPasswordEmailForm
        onSubmitted={(email) => setStep({ name: "otp", email })}
      />
    )
  }

  if (step.name === "otp") {
    return (
      <ForgotPasswordOtpForm
        email={step.email}
        onVerified={(otp) =>
          setStep({ name: "reset", email: step.email, otp })
        }
        onBack={() => setStep({ name: "email" })}
      />
    )
  }

  return <ResetPasswordForm email={step.email} otp={step.otp} />
}
