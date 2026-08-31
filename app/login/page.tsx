"use client";

import Link from "next/link";
import {
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  Palette,
  QrCode,
  Search,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { WHATSAPP_COUNTRIES } from "../data/countries";
import { apiRequest, ApiError } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

type AuthMethod = "email" | "phone";
type AuthMode = "register" | "login";

type Step = "choices" | "identifier" | "details" | "otp";

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

const COUNTRY_STORAGE_KEY = "tapqr_login_country";

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
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-white/45">{description}</p>
      </div>
    </div>
  );
}

function WhatsAppLogo({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20.52 3.48A11.84 11.84 0 0 0 12.08 0C5.54 0 .22 5.32.22 11.86c0 2.09.55 4.13 1.59 5.93L.12 24l6.35-1.66a11.85 11.85 0 0 0 5.61 1.43h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.18-1.24-6.17-3.43-8.43Z"
        fill="currentColor"
      />
      <path
        d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.64.08-.3-.15-1.25-.46-2.38-1.48-.88-.78-1.48-1.74-1.65-2.03-.17-.3-.02-.45.13-.6.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.79.37-.27.3-1.03 1-1.03 2.44s1.05 2.83 1.2 3.02c.15.2 2.07 3.16 5.02 4.43.7.3 1.25.49 1.68.63.7.22 1.33.19 1.83.12.56-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35Z"
        fill="white"
      />
    </svg>
  );
}

function Flag({ code, emoji }: { code: string; emoji?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <span className="text-lg leading-none">{emoji ?? "🌐"}</span>;
  }
  return (
    <img
      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
      alt=""
      loading="lazy"
      className="h-5 w-7 shrink-0 rounded-[2px] object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export default function LoginPage() {
  const [step, setStep] = useState<Step>("choices");
  const [method, setMethod] = useState<AuthMethod>("email");
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);

  const defaultCountry =
    WHATSAPP_COUNTRIES.find((country) => country.code === "IN") ??
    WHATSAPP_COUNTRIES[0];

  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const countrySearchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const savedCode = window.localStorage.getItem(COUNTRY_STORAGE_KEY);
    if (!savedCode) return;
    const savedCountry = WHATSAPP_COUNTRIES.find(
      (country) => country.code === savedCode
    );
    if (savedCountry) setSelectedCountry(savedCountry);
  }, []);

  useEffect(() => {
    if (!countryOpen) {
      setCountrySearch("");
      return;
    }
    window.setTimeout(() => countrySearchRef.current?.focus(), 0);
  }, [countryOpen]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setResendSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  const filteredCountries = useMemo(() => {
    const query = countrySearch.trim().toLowerCase();
    if (!query) return WHATSAPP_COUNTRIES;
    return WHATSAPP_COUNTRIES.filter((country) =>
      `${country.name} ${country.dialCode} ${country.code}`
        .toLowerCase()
        .includes(query)
    );
  }, [countrySearch]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function getErrorMessage(err: unknown) {
    if (err instanceof ApiError) return err.message;
    if (err instanceof Error) return err.message;
    return "Something went wrong. Please try again.";
  }

  function goToDashboard() {
    window.location.href = "/dashboard";
  }

  function chooseEmail() {
    clearMessages();
    setMethod("email");
    setIdentifier("");
    setPhoneNumber("");
    setAuthMode(null);
    setStep("identifier");
  }

  function chooseWhatsapp() {
    clearMessages();
    setMethod("phone");
    setIdentifier("");
    setPhoneNumber("");
    setAuthMode(null);
    setStep("identifier");
  }

  function selectCountry(country: (typeof WHATSAPP_COUNTRIES)[number]) {
    setSelectedCountry(country);
    window.localStorage.setItem(COUNTRY_STORAGE_KEY, country.code);
    setCountryOpen(false);
    clearMessages();
  }

  async function identifyAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearMessages();

    const normalizedPhone = phoneNumber
      .replace(/\D/g, "")
      .replace(/^0+/, "");

    const value =
      method === "email"
        ? identifier.trim()
        : `${selectedCountry.dialCode}${normalizedPhone}`;

    if (method === "email" && !value) {
      setError("Please enter your email address.");
      return;
    }

    if (method === "phone" && !normalizedPhone) {
      setError("Please enter your WhatsApp number.");
      return;
    }

    if (
      method === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    if (method === "phone" && !/^\+[1-9]\d{6,14}$/.test(value)) {
      setError("Please enter a valid WhatsApp number.");
      return;
    }

    if (method === "phone") setIdentifier(value);

    setLoading(true);

    try {
      const payload =
        method === "email"
          ? { email: value.toLowerCase() }
          : { phone: value };

      const response = await apiRequest<IdentifyResponse>("/auth/identify", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.data) {
        throw new Error("Unable to identify this account.");
      }

      const detectedMode: AuthMode = response.data.exists ? "login" : "register";
      setAuthMode(detectedMode);

      if (detectedMode === "login") {
        await sendOtp("login", value);
        return;
      }

      setStep("details");
      setSuccess("We couldn't find an account. Let's create one.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function sendOtp(requestedMode?: AuthMode, valueOverride?: string) {
    const mode = requestedMode ?? authMode ?? "login";
    clearMessages();

    const value = (valueOverride ?? identifier).trim();
    if (!value) {
      throw new Error("Email or phone number is required.");
    }

    if (method === "email") {
      const response = await apiRequest<AuthResponse>("/auth/email/send-otp", {
        method: "POST",
        body: JSON.stringify({
          email: value.toLowerCase(),
          mode,
        }),
      });
      setSuccess(response.message || "OTP sent to your email address.");
    } else {
      const response = await apiRequest<AuthResponse>(
        "/auth/whatsapp/send-otp",
        {
          method: "POST",
          body: JSON.stringify({
            phone: value,
            mode,
          }),
        }
      );
      setSuccess(response.message || "OTP sent via WhatsApp.");
    }

    setAuthMode(mode);
    setOtp("");
    setStep("otp");
    setResendSeconds(60);

    window.setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }

  async function continueRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearMessages();

    const name = fullName.trim();
    if (name.length < 3) {
      setError("Full name must be at least 3 characters.");
      return;
    }

    setLoading(true);
    try {
      setAuthMode("register");
      await sendOtp("register", identifier.trim());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function focusOtp(index: number) {
    window.setTimeout(() => otpRefs.current[index]?.focus(), 0);
  }

  function handleOtpChange(index: number, value: string) {
    const digits = value.replace(/\D/g, "");
    if (!digits) return;

    const chars = digits.slice(0, 6).split("");
    const next = otp.split("");
    while (next.length < 6) next.push("");

    chars.forEach((char, offset) => {
      const targetIndex = Math.min(index + offset, 5);
      next[targetIndex] = char;
    });

    const nextOtp = next.join("").slice(0, 6);
    setOtp(nextOtp);

    const focusIndex = Math.min(index + chars.length, 5);
    focusOtp(focusIndex);

    if (nextOtp.length === 6) {
      window.setTimeout(() => {
        const form = otpRefs.current[5]?.form;
        if (form && !loading) form.requestSubmit();
      }, 80);
    }
  }

  function handleOtpKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Backspace" && !otp[index]) {
      if (index > 0) focusOtp(index - 1);
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusOtp(index - 1);
    }

    if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      focusOtp(index + 1);
    }
  }

  function handleOtpPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    setOtp(pasted);
    focusOtp(Math.min(pasted.length, 6) - 1);
    if (pasted.length === 6) {
      window.setTimeout(() => otpRefs.current[5]?.form?.requestSubmit(), 80);
    }
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearMessages();

    if (!authMode) {
      setError("Authentication session expired. Please start again.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      let response: AuthResponse;

      if (method === "email") {
        response = await apiRequest<AuthResponse>("/auth/email/verify-otp", {
          method: "POST",
          body: JSON.stringify({
            email: identifier.trim().toLowerCase(),
            otp: otp.trim(),
            mode: authMode,
            ...(authMode === "register"
              ? { fullName: fullName.trim() }
              : {}),
          }),
        });
      } else {
        response = await apiRequest<AuthResponse>("/auth/whatsapp/verify-otp", {
          method: "POST",
          body: JSON.stringify({
            phone: identifier.trim(),
            otp: otp.trim(),
            mode: authMode,
            ...(authMode === "register"
              ? { fullName: fullName.trim() }
              : {}),
          }),
        });
      }

      saveSession(response);
      setSuccess(
        authMode === "register"
          ? "Account created successfully."
          : "Login successful."
      );
      window.setTimeout(goToDashboard, 500);
    } catch (err) {
      setError(getErrorMessage(err));
      setOtp("");
      focusOtp(0);
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    if (resendSeconds > 0 || loading || !authMode) return;

    setLoading(true);
    try {
      await sendOtp(authMode, identifier.trim());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(idToken: string) {
    clearMessages();
    setGoogleLoading(true);

    try {
      try {
        const response = await apiRequest<AuthResponse>("/auth/google", {
          method: "POST",
          body: JSON.stringify({ idToken, mode: "login" }),
        });

        saveSession(response);
        goToDashboard();
        return;
      } catch (err) {
        if (!(err instanceof ApiError) || err.code !== "ACCOUNT_NOT_FOUND") {
          throw err;
        }
      }

      const registerResponse = await apiRequest<AuthResponse>("/auth/google", {
        method: "POST",
        body: JSON.stringify({ idToken, mode: "register" }),
      });

      saveSession(registerResponse);
      goToDashboard();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  }

  function goBack() {
    clearMessages();

    if (step === "otp") {
      setOtp("");
      if (authMode === "register") setStep("details");
      else setStep("identifier");
      return;
    }

    if (step === "details") {
      setFullName("");
      setAuthMode(null);
      setStep("identifier");
      return;
    }

    if (step === "identifier") {
      setStep("choices");
    }
  }

  const stepLabel =
    step === "choices"
      ? "Choose your sign-in method"
      : step === "identifier"
        ? method === "email"
          ? "Email authentication"
          : "WhatsApp authentication"
        : step === "details"
          ? "Create your account"
          : "Verify your identity";

  return (
    <main className="min-h-screen bg-[#F6F8FC] text-[#0B0D0C]">
      <style jsx>{`
        .tapqr-step {
          animation: tapqrStepIn 220ms ease-out;
        }

        @keyframes tapqrStepIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden bg-[#080B12] lg:flex">
          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#2F6BFF]/20 blur-[130px]" />
          <div className="absolute -bottom-32 -right-32 h-[450px] w-[450px] rounded-full bg-[#2F6BFF]/15 blur-[130px]" />

          <div className="relative z-10 flex w-full flex-col px-14 py-12 xl:px-20">
            <Link href="/" className="flex w-fit items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2F6BFF] text-white shadow-lg shadow-[#2F6BFF]/20">
                <QrCode size={23} strokeWidth={2.3} />
              </span>
              <span className="text-xl font-bold tracking-tight text-white">TapQR</span>
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
                <span className="text-[#2F6BFF]">One QR.</span>
              </h1>

              <p className="mt-7 max-w-lg text-base leading-7 text-white/50">
                Sign in to manage your TapQR profile, QR codes, catalog and analytics from one place.
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
                    <p className="text-sm font-semibold text-white">Secure sign in</p>
                    <p className="mt-1 text-xs text-white/40">
                      Google, Email OTP and WhatsApp OTP provide passwordless access.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-white/25">© 2026 TapQR</p>
              <p className="text-xs text-white/25">One scan. Everything.</p>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-10">
          <div className="w-full max-w-[470px]">
            <div className="mb-8 lg:hidden">
              <Link href="/" className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2F6BFF] text-white">
                  <QrCode size={21} />
                </span>
                <span className="text-xl font-bold">TapQR</span>
              </Link>
            </div>

            <div key={step} className="tapqr-step">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#2F6BFF]">
                {stepLabel}
              </p>

              {step === "choices" && (
                <>
                  <div>
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
                      <QrCode size={24} />
                    </div>
                    <h2 className="text-4xl font-semibold tracking-[-0.04em] sm:text-[44px]">
                      Sign in to TapQR.
                    </h2>
                    <p className="mt-4 max-w-md text-sm leading-6 text-black/45">
                      Access your digital profile, QR codes and business tools.
                    </p>
                  </div>

                  <div className="mt-9 space-y-3">
                    <div className="w-full">
                      <GoogleAuthButton
                        disabled={loading || googleLoading}
                        onSuccess={handleGoogleSuccess}
                        onError={(message) =>
                          setError(message || "Google sign-in failed.")
                        }
                      />
                    </div>

                    <button
                      type="button"
                      onClick={chooseWhatsapp}
                      disabled={loading || googleLoading}
                      className="group flex w-full items-center gap-4 rounded-2xl border border-black/10 bg-white px-5 py-4 text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
                        <WhatsAppLogo size={22} />
                      </span>
                      <span className="flex-1 text-left">
                        Continue with WhatsApp
                        <span className="mt-0.5 block text-xs font-normal text-black/35">
                          Login or create account with OTP
                        </span>
                      </span>
                      <ArrowRight size={17} className="text-black/30 transition-transform group-hover:translate-x-1" />
                    </button>

                    <div className="flex items-center gap-4 py-3">
                      <div className="h-px flex-1 bg-black/8" />
                      <span className="text-[11px] font-medium uppercase tracking-wider text-black/30">or</span>
                      <div className="h-px flex-1 bg-black/8" />
                    </div>

                    <button
                      type="button"
                      onClick={chooseEmail}
                      disabled={loading || googleLoading}
                      className="group flex w-full items-center gap-4 rounded-2xl bg-[#080B12] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-base font-bold">@</span>
                      <span className="flex-1 text-left">
                        Continue with Email
                        <span className="mt-0.5 block text-xs font-normal text-white/35">
                          Login or create account with OTP
                        </span>
                      </span>
                      <ArrowRight size={17} className="text-white/40 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </>
              )}

              {step === "identifier" && (
                <>
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={loading}
                    className="mb-8 flex items-center gap-2 text-sm font-medium text-black/45 transition hover:text-black disabled:opacity-50"
                  >
                    <ArrowLeft size={16} /> Back to login options
                  </button>

                  <div className="mb-8">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]/10 text-[#2F6BFF]">
                      {method === "email" ? "@" : <WhatsAppLogo size={24} />}
                    </div>
                    <h2 className="text-4xl font-semibold tracking-[-0.04em]">Continue to TapQR.</h2>
                    <p className="mt-4 text-sm leading-6 text-black/45">
                      Enter your {method === "email" ? "email address" : "WhatsApp number"} and we'll automatically determine whether you need to sign in or create an account.
                    </p>
                  </div>

                  <form onSubmit={identifyAccount} className="space-y-5">
                    <div>
                      <label htmlFor="identifier" className="mb-2 block text-sm font-semibold">
                        {method === "email" ? "Email address" : "WhatsApp number"}
                      </label>

                      {method === "email" ? (
                        <input
                          id="identifier"
                          type="email"
                          autoComplete="email"
                          value={identifier}
                          onChange={(event) => setIdentifier(event.target.value)}
                          placeholder="you@example.com"
                          disabled={loading}
                          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10 disabled:opacity-60"
                        />
                      ) : (
                        <div className="space-y-3">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setCountryOpen((open) => !open)}
                              disabled={loading}
                              aria-expanded={countryOpen}
                              aria-haspopup="listbox"
                              className="flex w-full items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm font-medium outline-none transition hover:border-black/20 focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10 disabled:opacity-60"
                            >
                              <span className="flex min-w-0 items-center gap-3">
                                <Flag code={selectedCountry.code} emoji={selectedCountry.flag} />
                                <span className="truncate">{selectedCountry.name}</span>
                                <span className="shrink-0 text-black/45">{selectedCountry.dialCode}</span>
                              </span>
                              <ChevronDown size={18} className={`shrink-0 text-black/40 transition-transform ${countryOpen ? "rotate-180" : ""}`} />
                            </button>

                            {countryOpen && (
                              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl shadow-black/10">
                                <div className="border-b border-black/5 p-2">
                                  <div className="flex items-center gap-2 rounded-xl bg-[#F6F8FC] px-3">
                                    <Search size={16} className="shrink-0 text-black/35" />
                                    <input
                                      ref={countrySearchRef}
                                      type="search"
                                      value={countrySearch}
                                      onChange={(event) => setCountrySearch(event.target.value)}
                                      placeholder="Search country or code"
                                      className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-black/35"
                                    />
                                  </div>
                                </div>

                                <div role="listbox" className="max-h-72 overflow-y-auto p-2">
                                  {filteredCountries.length === 0 ? (
                                    <p className="px-3 py-6 text-center text-sm text-black/40">No country found.</p>
                                  ) : (
                                    filteredCountries.map((country) => (
                                      <button
                                        key={country.code}
                                        type="button"
                                        role="option"
                                        aria-selected={selectedCountry.code === country.code}
                                        onClick={() => selectCountry(country)}
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-[#2F6BFF]/5"
                                      >
                                        <Flag code={country.code} emoji={country.flag} />
                                        <span className="flex-1 truncate">{country.name}</span>
                                        <span className="text-black/45">{country.dialCode}</span>
                                        {selectedCountry.code === country.code && (
                                          <Check size={16} className="shrink-0 text-[#2F6BFF]" />
                                        )}
                                      </button>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex overflow-hidden rounded-2xl border border-black/10 bg-white transition focus-within:border-[#2F6BFF] focus-within:ring-4 focus-within:ring-[#2F6BFF]/10">
                            <div className="flex shrink-0 items-center gap-2 border-r border-black/10 px-4 text-sm font-semibold text-black/60">
                              <Flag code={selectedCountry.code} emoji={selectedCountry.flag} />
                              <span>{selectedCountry.dialCode}</span>
                            </div>
                            <input
                              id="identifier"
                              type="tel"
                              inputMode="numeric"
                              autoComplete="tel"
                              value={phoneNumber}
                              onChange={(event) => setPhoneNumber(event.target.value.replace(/\D/g, ""))}
                              placeholder="9876543210"
                              disabled={loading}
                              className="min-w-0 flex-1 px-4 py-3.5 text-sm outline-none"
                            />
                          </div>

                          <p className="text-xs text-black/35">We'll send a secure verification code to your WhatsApp number.</p>
                        </div>
                      )}
                    </div>

                    {error && <div role="alert" aria-live="polite" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                    {success && <div role="status" aria-live="polite" className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2F6BFF] px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-[#2F6BFF]/20 transition hover:-translate-y-0.5 hover:bg-[#245BE0] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Checking your account...
                        </>
                      ) : (
                        <>Continue <ArrowRight size={17} /></>
                      )}
                    </button>
                  </form>
                </>
              )}

              {step === "details" && (
                <>
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={loading}
                    className="mb-8 flex items-center gap-2 text-sm font-medium text-black/45 transition hover:text-black disabled:opacity-50"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>

                  <div className="mb-8">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]/10 text-[#2F6BFF]"><Users size={24} /></div>
                    <h2 className="text-4xl font-semibold tracking-[-0.04em]">Welcome to TapQR.</h2>
                    <p className="mt-4 text-sm leading-6 text-black/45">
                      We couldn't find an account with this {method === "email" ? "email" : "WhatsApp number"}. Enter your name to create one.
                    </p>
                  </div>

                  <form onSubmit={continueRegistration} className="space-y-5">
                    <div>
                      <label htmlFor="full-name" className="mb-2 block text-sm font-semibold">Full name</label>
                      <input
                        id="full-name"
                        type="text"
                        autoComplete="name"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder="Your full name"
                        disabled={loading}
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10 disabled:opacity-60"
                      />
                    </div>

                    <div className="rounded-2xl border border-[#2F6BFF]/15 bg-[#2F6BFF]/5 p-5">
                      <p className="text-xs text-black/40">Account identifier</p>
                      <p className="mt-1 break-all text-sm font-semibold">{identifier}</p>
                    </div>

                    {error && <div role="alert" aria-live="polite" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2F6BFF] px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-[#2F6BFF]/20 transition hover:-translate-y-0.5 hover:bg-[#245BE0] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Sending code...
                        </>
                      ) : (
                        <>Continue <ArrowRight size={17} /></>
                      )}
                    </button>
                  </form>
                </>
              )}

              {step === "otp" && (
                <>
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={loading}
                    className="mb-8 flex items-center gap-2 text-sm font-medium text-black/45 transition hover:text-black disabled:opacity-50"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>

                  <div className="mb-8">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6BFF]/10 text-[#2F6BFF]"><ShieldCheck size={24} /></div>
                    <h2 className="text-4xl font-semibold tracking-[-0.04em]">Enter your code.</h2>
                    <p className="mt-4 text-sm leading-6 text-black/45">We sent a 6-digit verification code to:</p>
                    <p className="mt-1 break-all text-sm font-semibold">{identifier}</p>
                  </div>

                  <form onSubmit={verifyOtp} className="space-y-5">
                    <div className="rounded-2xl border border-[#2F6BFF]/15 bg-[#2F6BFF]/5 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-black/40">Authentication</p>
                          <p className="mt-1 text-sm font-semibold">
                            {authMode === "register" ? "Creating your TapQR account" : "Signing in to your TapQR account"}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-black/45 shadow-sm">6 digits</span>
                      </div>
                    </div>

                    <div>
                      <label className="mb-3 block text-sm font-semibold">Verification code</label>
                      <div className="grid grid-cols-6 gap-2 sm:gap-3" role="group" aria-label="6-digit verification code">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <input
                            key={index}
                            ref={(element) => {
                              otpRefs.current[index] = element;
                            }}
                            value={otp[index] ?? ""}
                            onChange={(event) => handleOtpChange(index, event.target.value)}
                            onKeyDown={(event) => handleOtpKeyDown(index, event)}
                            onPaste={handleOtpPaste}
                            onFocus={(event) => event.currentTarget.select()}
                            type="text"
                            inputMode="numeric"
                            autoComplete={index === 0 ? "one-time-code" : "off"}
                            maxLength={1}
                            disabled={loading}
                            aria-label={`Verification code digit ${index + 1}`}
                            className="h-14 w-full rounded-2xl border border-black/10 bg-white text-center text-2xl font-semibold outline-none transition focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10 disabled:opacity-60"
                          />
                        ))}
                      </div>
                      <p className="mt-3 text-center text-xs text-black/35">Paste the full code or enter the digits one by one. The code expires in 5 minutes.</p>
                    </div>

                    {error && <div role="alert" aria-live="polite" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                    {success && <div role="status" aria-live="polite" className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2F6BFF] px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-[#2F6BFF]/20 transition hover:-translate-y-0.5 hover:bg-[#245BE0] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Verifying...
                        </>
                      ) : (
                        <>{authMode === "register" ? "Create Account" : "Verify & Sign In"}<ArrowRight size={17} /></>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => void resendOtp()}
                      disabled={loading || resendSeconds > 0}
                      className="w-full text-sm font-medium text-black/45 transition hover:text-black disabled:cursor-not-allowed disabled:text-black/25"
                    >
                      {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : "Resend code"}
                    </button>
                  </form>
                </>
              )}
            </div>

            <p className="mt-10 text-center text-xs leading-5 text-black/30">
              By continuing, you agree to the TapQR Terms of Service and Privacy Policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
