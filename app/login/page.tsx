"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  MessageCircle,
  Palette,
  QrCode,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";

import { apiRequest, ApiError } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

type AuthMethod = "email" | "phone";
type AuthMode = "register" | "login";

type Step =
  | "choices"
  | "identifier"
  | "details"
  | "otp";

type IdentifyResponse = {
  success?: boolean;
  message?: string;
  code?: string;
  data?: {
    exists: boolean;
    method: "email" | "phone";
    email?: string;
    phone?: string;
  };
};

type AuthResponse = {
  success?: boolean;
  message?: string;
  code?: string;

  accessToken?: string;
  refreshToken?: string;

  user?: {
    id: string;
    fullName: string;
    email?: string | null;
    phone?: string | null;
    role?: string;
  };

  data?: {
    accessToken?: string;
    refreshToken?: string;

    user?: {
      id: string;
      fullName: string;
      email?: string | null;
      phone?: string | null;
      role?: string;
    };
  };
};

/*
|--------------------------------------------------------------------------
| FEATURE ITEM
|--------------------------------------------------------------------------
*/

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#2F6BFF]">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-white/45">
          {description}
        </p>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| LOGIN PAGE
|--------------------------------------------------------------------------
*/

export default function LoginPage() {
  const [step, setStep] =
    useState<Step>("choices");

  const [method, setMethod] =
    useState<AuthMethod>("email");

  const [authMode, setAuthMode] =
    useState<AuthMode | null>(null);

  const [identifier, setIdentifier] =
    useState("");

  const [fullName, setFullName] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [resendSeconds, setResendSeconds] =
    useState(0);

  /*
  |--------------------------------------------------------------------------
  | HELPERS
  |--------------------------------------------------------------------------
  */

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function getErrorMessage(
    err: unknown
  ) {
    if (err instanceof ApiError) {
      return err.message;
    }

    if (err instanceof Error) {
      return err.message;
    }

    return "Something went wrong. Please try again.";
  }

  function startResendTimer() {
    setResendSeconds(60);

    const interval =
      window.setInterval(() => {
        setResendSeconds((current) => {
          if (current <= 1) {
            window.clearInterval(interval);
            return 0;
          }

          return current - 1;
        });
      }, 1000);
  }

  function goToDashboard() {
    window.location.href = "/dashboard";
  }

  /*
  |--------------------------------------------------------------------------
  | CHOOSE EMAIL
  |--------------------------------------------------------------------------
  */

  function chooseEmail() {
    clearMessages();

    setMethod("email");
    setIdentifier("");
    setAuthMode(null);
    setStep("identifier");
  }

  /*
  |--------------------------------------------------------------------------
  | CHOOSE WHATSAPP
  |--------------------------------------------------------------------------
  */

  function chooseWhatsapp() {
    clearMessages();

    setMethod("phone");
    setIdentifier("");
    setAuthMode(null);
    setStep("identifier");
  }

  /*
  |--------------------------------------------------------------------------
  | IDENTIFY ACCOUNT
  |--------------------------------------------------------------------------
  */

  async function identifyAccount(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    clearMessages();

    const value =
      identifier.trim();

    if (!value) {
      setError(
        method === "email"
          ? "Please enter your email address."
          : "Please enter your WhatsApp number."
      );

      return;
    }

    if (
      method === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        value
      )
    ) {
      setError(
        "Please enter a valid email address."
      );

      return;
    }

    if (
      method === "phone" &&
      !/^\+[1-9]\d{6,14}$/.test(
        value
      )
    ) {
      setError(
        "Enter your phone number in international format, e.g. +919876543210."
      );

      return;
    }

    setLoading(true);

    try {
      const payload =
        method === "email"
          ? {
              email:
                value.toLowerCase(),
            }
          : {
              phone: value,
            };

      const response =
        await apiRequest<IdentifyResponse>(
          "/auth/identify",
          {
            method: "POST",
            body: JSON.stringify(
              payload
            ),
          }
        );

      if (!response.data) {
        throw new Error(
          "Unable to identify this account."
        );
      }

      const exists =
        response.data.exists;

      const detectedMode: AuthMode =
        exists
          ? "login"
          : "register";

      setAuthMode(
        detectedMode
      );

      /*
       * Existing account
       * → send login OTP immediately.
       */

      if (detectedMode === "login") {
        await sendOtp(
          "login"
        );

        return;
      }

      /*
       * New account
       * → ask for name before sending
       * registration OTP.
       */

      setStep("details");

      setSuccess(
        "We couldn't find an account. Let's create one."
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | SEND OTP
  |--------------------------------------------------------------------------
  */

  async function sendOtp(
    requestedMode?: AuthMode
  ) {
    const mode: AuthMode =
      requestedMode ??
      authMode ??
      "login";

    clearMessages();

    const value =
      identifier.trim();

    if (!value) {
      throw new Error(
        "Email or phone number is required."
      );
    }

    if (method === "email") {
      const response =
        await apiRequest<AuthResponse>(
          "/auth/email/send-otp",
          {
            method: "POST",
            body: JSON.stringify({
              email:
                value.toLowerCase(),
              mode,
            }),
          }
        );

      setSuccess(
        response.message ||
          "OTP sent to your email address."
      );
    } else {
      const response =
        await apiRequest<AuthResponse>(
          "/auth/whatsapp/send-otp",
          {
            method: "POST",
            body: JSON.stringify({
              phone: value,
              mode,
            }),
          }
        );

      setSuccess(
        response.message ||
          "OTP sent via WhatsApp."
      );
    }

    setAuthMode(mode);
    setOtp("");
    setStep("otp");

    startResendTimer();
  }

  /*
  |--------------------------------------------------------------------------
  | CREATE ACCOUNT → SEND OTP
  |--------------------------------------------------------------------------
  */

  async function continueRegistration(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    clearMessages();

    const name =
      fullName.trim();

    if (name.length < 3) {
      setError(
        "Full name must be at least 3 characters."
      );

      return;
    }

    setLoading(true);

    try {
      setAuthMode("register");

      await sendOtp(
        "register"
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | VERIFY OTP
  |--------------------------------------------------------------------------
  */

  async function verifyOtp(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    clearMessages();

    if (!authMode) {
      setError(
        "Authentication session expired. Please start again."
      );

      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError(
        "Please enter the 6-digit OTP."
      );

      return;
    }

    setLoading(true);

    try {
      let response: AuthResponse;

      if (method === "email") {
        response =
          await apiRequest<AuthResponse>(
            "/auth/email/verify-otp",
            {
              method: "POST",
              body: JSON.stringify({
                email:
                  identifier
                    .trim()
                    .toLowerCase(),

                otp:
                  otp.trim(),

                mode:
                  authMode,

                ...(authMode ===
                "register"
                  ? {
                      fullName:
                        fullName.trim(),
                    }
                  : {}),
              }),
            }
          );
      } else {
        response =
          await apiRequest<AuthResponse>(
            "/auth/whatsapp/verify-otp",
            {
              method: "POST",
              body: JSON.stringify({
                phone:
                  identifier.trim(),

                otp:
                  otp.trim(),

                mode:
                  authMode,

                ...(authMode ===
                "register"
                  ? {
                      fullName:
                        fullName.trim(),
                    }
                  : {}),
              }),
            }
          );
      }

      /*
       * Your existing auth.ts handles:
       * accessToken
       * refreshToken
       * user
       */

      saveSession(response);

      setSuccess(
        authMode === "register"
          ? "Account created successfully."
          : "Login successful."
      );

      setTimeout(
        goToDashboard,
        500
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | RESEND OTP
  |--------------------------------------------------------------------------
  */

  async function resendOtp() {
    if (
      resendSeconds > 0 ||
      loading ||
      !authMode
    ) {
      return;
    }

    setLoading(true);

    try {
      await sendOtp(
        authMode
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | GOOGLE
  |--------------------------------------------------------------------------
  */

  async function handleGoogleSuccess(
    idToken: string
  ) {
    clearMessages();

    setGoogleLoading(true);

    try {
      /*
       * First try Google login.
       *
       * Existing account:
       * → login immediately.
       *
       * New account:
       * → backend returns ACCOUNT_NOT_FOUND.
       * → automatically try registration.
       */

      try {
        const response =
          await apiRequest<AuthResponse>(
            "/auth/google",
            {
              method: "POST",
              body: JSON.stringify({
                idToken,
                mode: "login",
              }),
            }
          );

        saveSession(response);

        goToDashboard();

        return;
      } catch (err) {
        if (
          !(
            err instanceof ApiError
          ) ||
          err.code !==
            "ACCOUNT_NOT_FOUND"
        ) {
          throw err;
        }
      }

      /*
       * New Google account.
       */

      const registerResponse =
        await apiRequest<AuthResponse>(
          "/auth/google",
          {
            method: "POST",
            body: JSON.stringify({
              idToken,
              mode: "register",
            }),
          }
        );

      saveSession(
        registerResponse
      );

      goToDashboard();
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | BACK
  |--------------------------------------------------------------------------
  */

  function goBack() {
    clearMessages();

    if (step === "otp") {
      setOtp("");

      if (
        authMode ===
        "register"
      ) {
        setStep("details");
      } else {
        setStep("identifier");
      }

      return;
    }

    if (step === "details") {
      setFullName("");
      setAuthMode(null);
      setStep("identifier");

      return;
    }

    if (step === "identifier") {
      setIdentifier("");
      setStep("choices");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-[#F6F8FC] text-[#0B0D0C]">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">

        {/* ==========================================================
            LEFT SIDE
        ========================================================== */}

        <section className="relative hidden overflow-hidden bg-[#080B12] lg:flex">

          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#2F6BFF]/20 blur-[130px]" />

          <div className="absolute -bottom-32 -right-32 h-[450px] w-[450px] rounded-full bg-[#2F6BFF]/15 blur-[130px]" />

          <div className="relative z-10 flex w-full flex-col px-14 py-12 xl:px-20">

            <Link
              href="/"
              className="flex w-fit items-center gap-3"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2F6BFF] text-white shadow-lg shadow-[#2F6BFF]/20">
                <QrCode
                  size={23}
                  strokeWidth={2.3}
                />
              </span>

              <span className="text-xl font-bold tracking-tight text-white">
                TapQR
              </span>
            </Link>

            <div className="my-auto max-w-xl py-12">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2F6BFF]/30 bg-[#2F6BFF]/10 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-[#2F6BFF]" />

                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8EADFF]">
                  Welcome to TapQR
                </span>
              </div>

              <h1 className="text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-white xl:text-6xl">
                Your digital
                <br />
                presence.
                <br />

                <span className="text-[#2F6BFF]">
                  One QR.
                </span>
              </h1>

              <p className="mt-7 max-w-lg text-base leading-7 text-white/50">
                Sign in to manage your TapQR
                profile, QR codes, catalog and
                analytics from one place.
              </p>

              <div className="mt-10 grid gap-6 sm:grid-cols-2">

                <FeatureItem
                  icon={<Zap size={18} />}
                  title="Dynamic QR codes"
                  description="Update what your QR connects to without replacing the QR itself."
                />

                <FeatureItem
                  icon={<BarChart3 size={18} />}
                  title="QR analytics"
                  description="Understand scans and see how people interact with your profile."
                />

                <FeatureItem
                  icon={<Palette size={18} />}
                  title="Custom branding"
                  description="Create a QR experience that feels like your brand."
                />

                <FeatureItem
                  icon={<Users size={18} />}
                  title="Multiple profiles"
                  description="Manage profiles for teams, agents and business staff."
                />

              </div>

              <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.035] p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2F6BFF]/10 text-[#7FA0FF]">
                    <ShieldCheck size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Secure sign in
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                      Email and WhatsApp use secure
                      one-time verification codes.
                    </p>
                  </div>

                </div>

              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-white/25">
                © 2026 TapQR
              </p>

              <p className="text-xs text-white/25">
                One scan. Everything.
              </p>
            </div>

          </div>
        </section>

        {/* ==========================================================
            RIGHT SIDE
        ========================================================== */}

        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-10">

          <div className="w-full max-w-[470px]">

            {/* Mobile logo */}

            <div className="mb-10 lg:hidden">
              <Link
                href="/"
                className="flex items-center gap-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2F6BFF] text-white">
                  <QrCode size={21} />
                </span>

                <span className="text-xl font-bold">
                  TapQR
                </span>
              </Link>
            </div>

            {/* =====================================================
                CHOICES
            ===================================================== */}

            {step === "choices" && (
              <>
                <div>

                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
                    <QrCode size={24} />
                  </div>

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2F6BFF]">
                    Welcome back
                  </p>

                  <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-[44px]">
                    Sign in to TapQR.
                  </h2>

                  <p className="mt-4 max-w-md text-sm leading-6 text-black/45">
                    Access your digital profile,
                    QR codes and business tools.
                  </p>

                </div>

                <div className="mt-9 space-y-3">

                  {/* Google */}

                  <div className="w-full">
                    <GoogleAuthButton
                      onSuccess={
                        handleGoogleSuccess
                      }
                      onError={(message) => {
                        setError(
                          message ||
                            "Google sign-in failed."
                        );
                      }}
                    />
                  </div>

                  {/* WhatsApp */}

                  <button
                    type="button"
                    onClick={
                      chooseWhatsapp
                    }
                    disabled={
                      loading ||
                      googleLoading
                    }
                    className="group flex w-full items-center gap-4 rounded-2xl border border-black/10 bg-white px-5 py-4 text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
                      <MessageCircle
                        size={21}
                        strokeWidth={2.2}
                      />
                    </span>

                    <span className="flex-1 text-left">
                      Continue with WhatsApp

                      <span className="mt-0.5 block text-xs font-normal text-black/35">
                        Login or create account
                        with OTP
                      </span>
                    </span>

                    <ArrowRight
                      size={17}
                      className="text-black/30 transition-transform group-hover:translate-x-1"
                    />
                  </button>

                  {/* Divider */}

                  <div className="flex items-center gap-4 py-3">

                    <div className="h-px flex-1 bg-black/8" />

                    <span className="text-[11px] font-medium uppercase tracking-wider text-black/30">
                      or
                    </span>

                    <div className="h-px flex-1 bg-black/8" />

                  </div>

                  {/* Email */}

                  <button
                    type="button"
                    onClick={
                      chooseEmail
                    }
                    disabled={
                      loading ||
                      googleLoading
                    }
                    className="group flex w-full items-center gap-4 rounded-2xl bg-[#080B12] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-base font-bold">
                      @
                    </span>

                    <span className="flex-1 text-left">
                      Continue with Email

                      <span className="mt-0.5 block text-xs font-normal text-white/35">
                        Login or create account
                        with OTP
                      </span>
                    </span>

                    <ArrowRight
                      size={17}
                      className="text-white/40 transition-transform group-hover:translate-x-1"
                    />
                  </button>

                </div>

                {error && (
                  <div
                    role="alert"
                    className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {error}
                  </div>
                )}

                {success && (
                  <div
                    role="status"
                    className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                  >
                    {success}
                  </div>
                )}

                <div className="mt-8 rounded-2xl border border-black/6 bg-white/60 p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2F6BFF]/10 text-[#2F6BFF]">
                      <ShieldCheck size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold">
                        Secure sign in
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-black/40">
                        Google, Email OTP and WhatsApp
                        OTP provide secure passwordless
                        access.
                      </p>
                    </div>

                  </div>

                </div>
              </>
            )}

            {/* =====================================================
                IDENTIFIER
            ===================================================== */}

            {step === "identifier" && (
              <>
                <button
                  type="button"
                  onClick={goBack}
                  disabled={loading}
                  className="mb-8 flex items-center gap-2 text-sm font-medium text-black/45 transition hover:text-black"
                >
                  <ArrowLeft size={16} />
                  Back to login options
                </button>

                <div>

                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
                    {method === "email"
                      ? "@"
                      : (
                        <MessageCircle
                          size={24}
                        />
                      )}
                  </div>

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2F6BFF]">
                    {method === "email"
                      ? "Email authentication"
                      : "WhatsApp authentication"}
                  </p>

                  <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                    Continue to TapQR.
                  </h2>

                  <p className="mt-4 text-sm leading-6 text-black/45">
                    Enter your{" "}
                    {method === "email"
                      ? "email address"
                      : "WhatsApp number"}{" "}
                    and we'll automatically
                    determine whether you need to
                    sign in or create an account.
                  </p>

                </div>

                <form
                  onSubmit={
                    identifyAccount
                  }
                  className="mt-8 space-y-5"
                >

                  <div>
                    <label
                      htmlFor="identifier"
                      className="mb-2 block text-sm font-semibold"
                    >
                      {method === "email"
                        ? "Email address"
                        : "WhatsApp number"}
                    </label>

                    <input
                      id="identifier"
                      type={
                        method === "email"
                          ? "email"
                          : "tel"
                      }
                      autoComplete={
                        method === "email"
                          ? "email"
                          : "tel"
                      }
                      value={
                        identifier
                      }
                      onChange={(event) =>
                        setIdentifier(
                          event.target.value
                        )
                      }
                      placeholder={
                        method === "email"
                          ? "you@example.com"
                          : "+919876543210"
                      }
                      disabled={loading}
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10 disabled:opacity-60"
                    />
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {error}
                    </div>
                  )}

                  {success && (
                    <div
                      role="status"
                      className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                    >
                      {success}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2F6BFF] px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-[#2F6BFF]/20 transition hover:-translate-y-0.5 hover:bg-[#245BE0] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Checking account...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>

                </form>
              </>
            )}

            {/* =====================================================
                REGISTRATION DETAILS
            ===================================================== */}

            {step === "details" && (
              <>
                <button
                  type="button"
                  onClick={goBack}
                  disabled={loading}
                  className="mb-8 flex items-center gap-2 text-sm font-medium text-black/45 transition hover:text-black"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <div>

                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
                    <Users size={24} />
                  </div>

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2F6BFF]">
                    Create account
                  </p>

                  <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                    Welcome to TapQR.
                  </h2>

                  <p className="mt-4 text-sm leading-6 text-black/45">
                    We couldn't find an account
                    with this{" "}
                    {method === "email"
                      ? "email"
                      : "WhatsApp number"}.
                    Enter your name to create one.
                  </p>

                </div>

                <form
                  onSubmit={
                    continueRegistration
                  }
                  className="mt-8 space-y-5"
                >

                  <div>
                    <label
                      htmlFor="full-name"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Full name
                    </label>

                    <input
                      id="full-name"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(event) =>
                        setFullName(
                          event.target.value
                        )
                      }
                      placeholder="Your full name"
                      disabled={loading}
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10 disabled:opacity-60"
                    />
                  </div>

                  <div className="rounded-2xl border border-[#2F6BFF]/15 bg-[#2F6BFF]/5 p-5">

                    <p className="text-xs text-black/40">
                      Account identifier
                    </p>

                    <p className="mt-1 text-sm font-semibold break-all">
                      {identifier}
                    </p>

                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2F6BFF] px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-[#2F6BFF]/20 transition hover:-translate-y-0.5 hover:bg-[#245BE0] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>

                </form>
              </>
            )}

            {/* =====================================================
                OTP
            ===================================================== */}

            {step === "otp" && (
              <>
                <button
                  type="button"
                  onClick={goBack}
                  disabled={loading}
                  className="mb-8 flex items-center gap-2 text-sm font-medium text-black/45 transition hover:text-black"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <div>

                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
                    <ShieldCheck size={24} />
                  </div>

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2F6BFF]">
                    Verify identity
                  </p>

                  <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                    Enter your code.
                  </h2>

                  <p className="mt-4 text-sm leading-6 text-black/45">
                    We sent a 6-digit verification
                    code to:
                  </p>

                  <p className="mt-1 text-sm font-semibold break-all">
                    {identifier}
                  </p>

                </div>

                <form
                  onSubmit={verifyOtp}
                  className="mt-8 space-y-5"
                >

                  <div className="rounded-2xl border border-[#2F6BFF]/15 bg-[#2F6BFF]/5 p-5">
                    <p className="text-xs text-black/40">
                      {authMode ===
                      "register"
                        ? "Creating your TapQR account"
                        : "Signing in to your TapQR account"}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="otp"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Verification code
                    </label>

                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={otp}
                      onChange={(event) =>
                        setOtp(
                          event.target.value.replace(
                            /\D/g,
                            ""
                          )
                        )
                      }
                      placeholder="000000"
                      disabled={loading}
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-4 text-center text-2xl font-semibold tracking-[0.4em] outline-none transition focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10 disabled:opacity-60"
                    />

                    <p className="mt-2 text-center text-xs text-black/35">
                      The code expires in 5 minutes.
                    </p>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {error}
                    </div>
                  )}

                  {success && (
                    <div
                      role="status"
                      className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                    >
                      {success}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      otp.length !== 6
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2F6BFF] px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-[#2F6BFF]/20 transition hover:-translate-y-0.5 hover:bg-[#245BE0] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        {authMode ===
                        "register"
                          ? "Create Account"
                          : "Verify & Sign In"}

                        <ArrowRight
                          size={17}
                        />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void resendOtp()
                    }
                    disabled={
                      loading ||
                      resendSeconds > 0
                    }
                    className="w-full text-sm font-medium text-black/45 transition hover:text-black disabled:cursor-not-allowed disabled:text-black/25"
                  >
                    {resendSeconds > 0
                      ? `Resend code in ${resendSeconds}s`
                      : "Resend code"}
                  </button>

                </form>
              </>
            )}

            <p className="mt-10 text-center text-xs leading-5 text-black/30">
              By continuing, you agree to the TapQR
              Terms of Service and Privacy Policy.
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}