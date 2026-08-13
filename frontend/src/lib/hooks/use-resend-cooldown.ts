"use client";

import * as React from "react";

const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Tracks a countdown (in seconds) for OTP "resend" actions. Call `start()`
 * right after a successful send to begin the cooldown; `isActive` gates the
 * resend button until it reaches 0.
 */
export function useResendCooldown(seconds = RESEND_COOLDOWN_SECONDS) {
  const [secondsLeft, setSecondsLeft] = React.useState(seconds);

  React.useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const start = React.useCallback(() => setSecondsLeft(seconds), [seconds]);

  return { secondsLeft, isActive: secondsLeft > 0, start };
}
