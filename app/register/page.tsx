"use client";

import Link from "next/link";
import {
  FormEvent,
  ReactNode,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  MessageCircle,
  Palette,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import {
  apiRequest,
  ApiError,
} from "@/lib/api";

import {
  saveSession,
} from "@/lib/auth";

import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

type AuthMethod =
  | "email"
  | "phone";

type AuthMode =
  | "login"
  | "register";

type Step =
  | "identifier"
  | "details"
  | "otp";

type IdentifyResponse = {
  success?: boolean;
  message?: string;
  code?: string;

  data?: {
    exists: boolean;
    method:
      | "email"
      | "phone";
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

function Feature({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-[#6E96FF] transition group-hover:border-[#2F6BFF]/30 group-hover:bg-[#2F6BFF]/10">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-white/40">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [step, setStep] =
    useState<Step>("identifier");

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

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function getErrorMessage(error: unknown) {
    if (error instanceof ApiError) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "Something went wrong. Please try again.";
  }

  function startResendTimer() {
    setResendSeconds(60);

    const interval = window.setInterval(() => {
      setResendSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          return 0;
        }

        return current - 1;
      });
    }, 1000);
  }

  function goDashboard() {
    router.replace("/dashboard");
  }

  async function identifyAccount(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    clearMessages();

    const value = identifier.trim();

    if (!value) {
      setError(
        method === "email"
          ? "Enter your email address."
          : "Enter your WhatsApp number."
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
        "Enter your number in international format, e.g. +919876543210."
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
            body:
              JSON.stringify(
                payload
              ),
          }
        );

      if (!response.data) {
        throw new Error(
          "Unable to identify this account."
        );
      }

      if (response.data.exists) {
        setAuthMode("login");

        await sendOtp("login");

        return;
      }

      setAuthMode("register");
      setStep("details");

      setSuccess(
        "No account found. Let's create one."
      );
    } catch (error) {
      setError(
        getErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  }

  async function sendOtp(
    mode: AuthMode
  ) {
    const value =
      identifier.trim();

    if (!value) {
      throw new Error(
        "Email or phone number is required."
      );
    }

    clearMessages();

    if (method === "email") {
      const response =
        await apiRequest<AuthResponse>(
          "/auth/email/send-otp",
          {
            method: "POST",
            body:
              JSON.stringify({
                email:
                  value.toLowerCase(),
                mode,
              }),
          }
        );

      setSuccess(
        response.message ||
          "Verification code sent to your email."
      );
    } else {
      const response =
        await apiRequest<AuthResponse>(
          "/auth/whatsapp/send-otp",
          {
            method: "POST",
            body:
              JSON.stringify({
                phone: value,
                mode,
              }),
          }
        );

      setSuccess(
        response.message ||
          "Verification code sent via WhatsApp."
      );
    }

    setAuthMode(mode);
    setOtp("");
    setStep("otp");

    startResendTimer();
  }

  async function continueRegistration(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    clearMessages();

    if (
      fullName.trim().length < 3
    ) {
      setError(
        "Full name must be at least 3 characters."
      );
      return;
    }

    setLoading(true);

    try {
      setAuthMode("register");

      await sendOtp("register");
    } catch (error) {
      setError(
        getErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  }

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
        "Enter the 6-digit verification code."
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
              body:
                JSON.stringify({
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
              body:
                JSON.stringify({
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

      saveSession(response);

      setSuccess(
        authMode === "register"
          ? "Your TapQR account has been created."
          : "Welcome back."
      );

      setTimeout(
        goDashboard,
        400
      );
    } catch (error) {
      setError(
        getErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  }

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
    } catch (error) {
      setError(
        getErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(
    idToken: string
  ) {
    clearMessages();

    setGoogleLoading(true);

    try {
      try {
        const response =
          await apiRequest<AuthResponse>(
            "/auth/google",
            {
              method: "POST",
              body:
                JSON.stringify({
                  idToken,
                  mode: "login",
                }),
            }
          );

        saveSession(
          response
        );

        goDashboard();

        return;
      } catch (error) {
        if (
          !(
            error instanceof
            ApiError
          ) ||
          error.code !==
            "ACCOUNT_NOT_FOUND"
        ) {
          throw error;
        }
      }

      const response =
        await apiRequest<AuthResponse>(
          "/auth/google",
          {
            method: "POST",
            body:
              JSON.stringify({
                idToken,
                mode: "register",
              }),
          }
        );

      saveSession(
        response
      );

      goDashboard();
    } catch (error) {
      setError(
        getErrorMessage(error)
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  function goBack() {
    clearMessages();

    if (step === "otp") {
      setOtp("");

      if (
        authMode === "register"
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
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F7FB] text-[#090B10]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">

        {/* LEFT SIDE */}

        <section className="relative hidden overflow-hidden bg-[#070A11] lg:flex">

          <div className="absolute -left-40 -top-40 h-[620px] w-[620px] rounded-full bg-[#2F6BFF]/20 blur-[140px]" />

          <div className="absolute -bottom-40 -right-40 h-[560px] w-[560px] rounded-full bg-[#6938EF]/15 blur-[150px]" />

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
              backgroundSize:
                "56px 56px",
            }}
          />

          <div className="relative z-10 flex w-full flex-col px-14 py-12 xl:px-20">

            <Link
              href="/"
              className="flex w-fit items-center gap-3"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2F6BFF] text-white shadow-xl shadow-[#2F6BFF]/20">
                <QrCode
                  size={23}
                />
              </span>

              <span className="text-xl font-bold text-white">
                TapQR
              </span>
            </Link>

            <div className="my-auto max-w-xl py-16">

              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#2F6BFF]/25 bg-[#2F6BFF]/10 px-4 py-2">
                <Sparkles
                  size={14}
                  className="text-[#7FA0FF]"
                />

                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9BB4FF]">
                  Digital identity platform
                </span>
              </div>

              <h1 className="text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-white xl:text-[64px]">
                Everything
                <br />
                behind
                <br />
                <span className="bg-gradient-to-r from-[#6E96FF] to-[#9B7CFF] bg-clip-text text-transparent">
                  one QR.
                </span>
              </h1>

              <p className="mt-7 max-w-lg text-base leading-7 text-white/45">
                Create, manage and share your
                digital identity with TapQR.
                One platform for profiles,
                QR codes, catalogs and analytics.
              </p>

              <div className="mt-11 grid gap-7 sm:grid-cols-2">

                <Feature
                  icon={
                    <Zap size={19} />
                  }
                  title="Dynamic QR codes"
                  description="Change your destination without replacing your printed QR."
                />

                <Feature
                  icon={
                    <BarChart3 size={19} />
                  }
                  title="Powerful analytics"
                  description="Understand scans and see how people interact with your profile."
                />

                <Feature
                  icon={
                    <Palette size={19} />
                  }
                  title="Custom branding"
                  description="Build a digital experience that matches your brand."
                />

                <Feature
                  icon={
                    <Users size={19} />
                  }
                  title="Team ready"
                  description="Manage multiple profiles and business identities."
                />

              </div>

              <div className="mt-11 flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                  <ShieldCheck
                    size={17}
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-white">
                    Secure authentication
                  </p>

                  <p className="mt-0.5 text-[11px] text-white/30">
                    Passwordless OTP and Google
                    authentication.
                  </p>
                </div>

              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-white/20">
              <span>
                © 2026 TapQR
              </span>

              <span>
                One scan. Everything.
              </span>
            </div>

          </div>
        </section>

        {/* RIGHT SIDE */}

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">

          <div className="w-full max-w-[460px]">

            {/* MOBILE LOGO */}

            <div className="mb-10 lg:hidden">
              <Link
                href="/"
                className="flex items-center gap-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2F6BFF] text-white">
                  <QrCode
                    size={21}
                  />
                </span>

                <span className="text-xl font-bold">
                  TapQR
                </span>
              </Link>
            </div>

            {/* =====================================================
                IDENTIFIER
            ===================================================== */}

            {step === "identifier" && (
              <>
                <div>

                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2F6BFF]/15 to-[#6938EF]/10 text-[#2F6BFF] ring-1 ring-[#2F6BFF]/10">
                    <Sparkles
                      size={25}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#2F6BFF]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2F6BFF]" />
                    Welcome to TapQR
                  </div>

                  <h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-[46px]">
                    Your account,
                    <br />
                    one step away.
                  </h2>

                  <p className="mt-5 max-w-md text-sm leading-6 text-black/45">
                    Sign in or create your TapQR
                    account. We'll automatically
                    detect whether you already have
                    an account.
                  </p>

                </div>

                {/* GOOGLE */}

                <div className="mt-8">

                  <div className="rounded-2xl border border-black/8 bg-white p-1.5 shadow-sm">

                    <GoogleAuthButton
                      disabled={
                        loading ||
                        googleLoading
                      }
                      onSuccess={
                        handleGoogleSuccess
                      }
                      onError={(message) => {
                        setError(
                          message
                        );
                      }}
                    />

                  </div>

                </div>

                {/* DIVIDER */}

                <div className="my-6 flex items-center gap-4">

                  <div className="h-px flex-1 bg-black/8" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/25">
                    or continue with
                  </span>

                  <div className="h-px flex-1 bg-black/8" />

                </div>

                {/* METHODS */}

                <div className="grid gap-3 sm:grid-cols-2">

                  <button
                    type="button"
                    onClick={() => {
                      setMethod(
                        "email"
                      );
                      setIdentifier("");
                      clearMessages();
                    }}
                    className={`group rounded-2xl border p-4 text-left transition-all ${
                      method === "email"
                        ? "border-[#2F6BFF]/30 bg-[#2F6BFF]/5 shadow-sm"
                        : "border-black/8 bg-white hover:border-black/15 hover:shadow-sm"
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold ${
                          method === "email"
                            ? "bg-[#2F6BFF] text-white"
                            : "bg-black/5 text-black/60"
                        }`}
                      >
                        @
                      </span>

                      {method ===
                        "email" && (
                        <Check
                          size={17}
                          className="text-[#2F6BFF]"
                        />
                      )}

                    </div>

                    <p className="mt-4 text-sm font-semibold">
                      Email
                    </p>

                    <p className="mt-1 text-xs text-black/35">
                      Secure email OTP
                    </p>

                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMethod(
                        "phone"
                      );
                      setIdentifier("");
                      clearMessages();
                    }}
                    className={`group rounded-2xl border p-4 text-left transition-all ${
                      method === "phone"
                        ? "border-[#25D366]/30 bg-[#25D366]/5 shadow-sm"
                        : "border-black/8 bg-white hover:border-black/15 hover:shadow-sm"
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          method === "phone"
                            ? "bg-[#25D366] text-white"
                            : "bg-black/5 text-black/60"
                        }`}
                      >
                        <MessageCircle
                          size={20}
                        />
                      </span>

                      {method ===
                        "phone" && (
                        <Check
                          size={17}
                          className="text-[#25D366]"
                        />
                      )}

                    </div>

                    <p className="mt-4 text-sm font-semibold">
                      WhatsApp
                    </p>

                    <p className="mt-1 text-xs text-black/35">
                      Secure WhatsApp OTP
                    </p>

                  </button>

                </div>

                {/* INPUT */}

                <form
                  onSubmit={
                    identifyAccount
                  }
                  className="mt-4"
                >

                  <div className="relative">

                    <input
                      type={
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
                          ? "Enter your email address"
                          : "+919876543210"
                      }
                      autoComplete={
                        method === "email"
                          ? "email"
                          : "tel"
                      }
                      disabled={
                        loading
                      }
                      className="h-14 w-full rounded-2xl border border-black/10 bg-white px-5 pr-14 text-sm outline-none transition placeholder:text-black/25 focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10 disabled:opacity-60"
                    />

                    <button
                      type="submit"
                      disabled={
                        loading
                      }
                      className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#2F6BFF] text-white transition hover:bg-[#245BE0] disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <ArrowRight
                          size={18}
                        />
                      )}
                    </button>

                  </div>

                </form>

                {error && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700">
                    {success}
                  </div>
                )}

                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-black/6 bg-white/60 p-4">

                  <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-[#2F6BFF]"
                  />

                  <p className="text-[11px] leading-5 text-black/40">
                    Your account is protected with
                    secure OTP verification and
                    Google authentication. We never
                    ask for your password through
                    email or WhatsApp.
                  </p>

                </div>
              </>
            )}

            {/* =====================================================
                DETAILS
            ===================================================== */}

            {step === "details" && (
              <>
                <button
                  type="button"
                  onClick={goBack}
                  className="mb-8 flex items-center gap-2 text-sm font-medium text-black/40 transition hover:text-black"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <div>

                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
                    <Users size={25} />
                  </div>

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2F6BFF]">
                    New account
                  </p>

                  <h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em]">
                    Let's get you
                    <br />
                    started.
                  </h2>

                  <p className="mt-5 text-sm leading-6 text-black/45">
                    We couldn't find an account
                    with this{" "}
                    {method === "email"
                      ? "email address"
                      : "WhatsApp number"}.
                    Enter your name to create your
                    TapQR account.
                  </p>

                </div>

                <form
                  onSubmit={
                    continueRegistration
                  }
                  className="mt-8 space-y-5"
                >

                  <div>

                    <label className="mb-2 block text-sm font-semibold">
                      Full name
                    </label>

                    <input
                      type="text"
                      value={
                        fullName
                      }
                      onChange={(event) =>
                        setFullName(
                          event.target.value
                        )
                      }
                      placeholder="Enter your full name"
                      autoComplete="name"
                      disabled={loading}
                      className="h-14 w-full rounded-2xl border border-black/10 bg-white px-5 text-sm outline-none transition placeholder:text-black/25 focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10"
                    />

                  </div>

                  <div className="rounded-2xl border border-[#2F6BFF]/10 bg-[#2F6BFF]/5 p-5">

                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2F6BFF]">
                      Your account
                    </p>

                    <p className="mt-2 break-all text-sm font-semibold">
                      {identifier}
                    </p>

                  </div>

                  {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#2F6BFF] text-sm font-semibold text-white shadow-lg shadow-[#2F6BFF]/20 transition hover:bg-[#245BE0] disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Sending code...
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
                  className="mb-8 flex items-center gap-2 text-sm font-medium text-black/40 transition hover:text-black"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <div>

                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <ShieldCheck
                      size={25}
                    />
                  </div>

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                    Verification
                  </p>

                  <h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em]">
                    Check your
                    <br />
                    {method === "email"
                      ? "email."
                      : "WhatsApp."}
                  </h2>

                  <p className="mt-5 text-sm leading-6 text-black/45">
                    Enter the 6-digit code we sent
                    to:
                  </p>

                  <p className="mt-1 break-all text-sm font-semibold">
                    {identifier}
                  </p>

                </div>

                <form
                  onSubmit={
                    verifyOtp
                  }
                  className="mt-8 space-y-5"
                >

                  <input
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
                    className="h-16 w-full rounded-2xl border border-black/10 bg-white px-5 text-center text-3xl font-semibold tracking-[0.45em] outline-none transition focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10"
                  />

                  <div className="flex items-center justify-center gap-2 text-xs text-black/35">
                    <ShieldCheck
                      size={14}
                    />
                    Code expires in 5 minutes
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {success}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      otp.length !== 6
                    }
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#2F6BFF] text-sm font-semibold text-white shadow-lg shadow-[#2F6BFF]/20 transition hover:bg-[#245BE0] disabled:cursor-not-allowed disabled:opacity-50"
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
                          ? "Create account"
                          : "Sign in"}

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
                    className="w-full py-2 text-sm font-semibold text-black/45 transition hover:text-black disabled:text-black/20"
                  >
                    {resendSeconds > 0
                      ? `Resend code in ${resendSeconds}s`
                      : "Didn't receive the code? Resend"}
                  </button>

                </form>
              </>
            )}

            <div className="mt-10 text-center">

              <div className="flex items-center justify-center gap-2 text-[11px] text-black/25">
                <ShieldCheck
                  size={13}
                />
                Secure authentication
              </div>

              <p className="mt-3 text-[11px] leading-5 text-black/25">
                By continuing, you agree to TapQR's
                Terms of Service and Privacy Policy.
              </p>

            </div>

          </div>
        </section>

      </div>
    </main>
  );
}