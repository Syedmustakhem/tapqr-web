"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Globe,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { apiRequest, ApiError } from "@/lib/api";

type BusinessStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | string;

type OpeningHours = Record<
  string,
  { open: string; close: string } | null | undefined
>;

type SocialLinks = Record<string, string | undefined>;

type BusinessProfile = {
  tagline?: string | null;
  description?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  openingHours?: OpeningHours | null;
  socialLinks?: SocialLinks | null;
  coverImage?: string | null;
};

type Business = {
  id: string;
  name: string;
  slug?: string | null;
  email?: string | null;
  phone?: string | null;
  logo?: string | null;
  description?: string | null;
  status?: BusinessStatus;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  profile?: BusinessProfile | null;
  qrCodes?: Array<{
    id: string;
    scanCount?: number;
    status?: string;
  }>;
};

type ListResponse = {
  success?: boolean;
  message?: string;
  data?: Business[];
};

type ItemResponse = {
  success?: boolean;
  message?: string;
  data?: Business;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  logo: string;
  description: string;
  tagline: string;
  website: string;
  whatsapp: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: string;
  longitude: string;
  coverImage: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  youtube: string;
  twitter: string;
  tiktok: string;
  openingHours: OpeningHours;
};

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const EMPTY_FORM = (): FormState => ({
  name: "",
  email: "",
  phone: "",
  logo: "",
  description: "",
  tagline: "",
  website: "",
  whatsapp: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  latitude: "",
  longitude: "",
  coverImage: "",
  instagram: "",
  facebook: "",
  linkedin: "",
  youtube: "",
  twitter: "",
  tiktok: "",
  openingHours: {},
});

function getInitials(name?: string) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return "B";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function toForm(business: Business): FormState {
  const profile = business.profile ?? {};
  const social = profile.socialLinks ?? {};

  return {
    name: business.name ?? "",
    email: business.email ?? "",
    phone: business.phone ?? "",
    logo: business.logo ?? "",
    description: business.description ?? "",
    tagline: profile.tagline ?? "",
    website: profile.website ?? "",
    whatsapp: profile.whatsapp ?? "",
    addressLine1: profile.addressLine1 ?? "",
    addressLine2: profile.addressLine2 ?? "",
    city: profile.city ?? "",
    state: profile.state ?? "",
    postalCode: profile.postalCode ?? "",
    country: profile.country ?? "India",
    latitude:
      profile.latitude === null || profile.latitude === undefined
        ? ""
        : String(profile.latitude),
    longitude:
      profile.longitude === null || profile.longitude === undefined
        ? ""
        : String(profile.longitude),
    coverImage: profile.coverImage ?? "",
    instagram: social.instagram ?? "",
    facebook: social.facebook ?? "",
    linkedin: social.linkedin ?? "",
    youtube: social.youtube ?? "",
    twitter: social.twitter ?? social.x ?? "",
    tiktok: social.tiktok ?? "",
    openingHours: profile.openingHours ?? {},
  };
}

function getStatusClasses(status?: string) {
  if (status === "ACTIVE") return "border-emerald-100 bg-emerald-50 text-emerald-700";
  if (status === "SUSPENDED") return "border-red-100 bg-red-50 text-red-700";
  return "border-slate-200 bg-slate-100 text-slate-600";
}

export default function BusinessPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    phone: "",
    logo: "",
    description: "",
  });

  const selectedBusiness = useMemo(
    () => businesses.find((item) => item.id === selectedId) ?? null,
    [businesses, selectedId]
  );

  const activeCount = useMemo(
    () => businesses.filter((item) => item.status === "ACTIVE").length,
    [businesses]
  );

  const totalScans = useMemo(
    () =>
      businesses.reduce(
        (businessTotal, business) =>
          businessTotal +
          (business.qrCodes ?? []).reduce(
            (qrTotal, qr) => qrTotal + Number(qr.scanCount ?? 0),
            0
          ),
        0
      ),
    [businesses]
  );

  const profileCompletion = useMemo(() => {
    if (!selectedBusiness) return 0;

    const fields = [
      selectedBusiness.name,
      selectedBusiness.email,
      selectedBusiness.phone,
      selectedBusiness.logo,
      selectedBusiness.description,
      selectedBusiness.profile?.tagline,
      selectedBusiness.profile?.website,
      selectedBusiness.profile?.whatsapp,
      selectedBusiness.profile?.addressLine1,
      selectedBusiness.profile?.city,
      selectedBusiness.profile?.state,
      selectedBusiness.profile?.country,
      selectedBusiness.profile?.coverImage,
    ];

    const completed = fields.filter((value) => Boolean(value?.toString().trim())).length;
    return Math.round((completed / fields.length) * 100);
  }, [selectedBusiness]);

  async function loadBusinesses(showRefresh = false) {
    try {
      setError("");
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await apiRequest<ListResponse>("/businesses");
      const data = response.data ?? [];
      setBusinesses(data);

      const storedId =
        typeof window !== "undefined"
          ? localStorage.getItem("tapqr_current_business_id")
          : null;

      const nextId =
        data.find((business) => business.id === storedId)?.id ??
        data[0]?.id ??
        "";

      setSelectedId(nextId);

      if (nextId && typeof window !== "undefined") {
        localStorage.setItem("tapqr_current_business_id", nextId);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load businesses.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadBusinesses();
  }, []);

  useEffect(() => {
    if (selectedBusiness) setForm(toForm(selectedBusiness));
  }, [selectedBusiness]);

  function setField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function setDayHours(day: string, key: "open" | "close", value: string) {
    setForm((current) => ({
      ...current,
      openingHours: {
        ...current.openingHours,
        [day]: {
          open: current.openingHours[day]?.open ?? "",
          close: current.openingHours[day]?.close ?? "",
          [key]: value,
        },
      },
    }));
  }

  function clearDay(day: string) {
    setForm((current) => {
      const next = { ...current.openingHours };
      delete next[day];
      return { ...current, openingHours: next };
    });
  }

  function chooseBusiness(id: string) {
    setSelectedId(id);
    setSwitcherOpen(false);
    setEditing(false);
    setError("");
    setSuccess("");
    if (typeof window !== "undefined") {
      localStorage.setItem("tapqr_current_business_id", id);
    }
  }

  async function saveBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedBusiness) return;

    const name = form.name.trim();
    if (name.length < 2) {
      setError("Business name must be at least 2 characters.");
      return;
    }

    const latitude = form.latitude.trim() ? Number(form.latitude) : null;
    const longitude = form.longitude.trim() ? Number(form.longitude) : null;

    if (latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) {
      setError("Latitude must be between -90 and 90.");
      return;
    }

    if (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) {
      setError("Longitude must be between -180 and 180.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await apiRequest<ItemResponse>(`/businesses/${selectedBusiness.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name,
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          logo: form.logo.trim() || null,
          description: form.description.trim() || null,
        }),
      });

      await apiRequest(`/businesses/${selectedBusiness.id}/profile`, {
        method: "PATCH",
        body: JSON.stringify({
          tagline: form.tagline.trim() || null,
          description: form.description.trim() || null,
          website: form.website.trim() || null,
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          whatsapp: form.whatsapp.trim() || null,
          addressLine1: form.addressLine1.trim() || null,
          addressLine2: form.addressLine2.trim() || null,
          city: form.city.trim() || null,
          state: form.state.trim() || null,
          postalCode: form.postalCode.trim() || null,
          country: form.country.trim() || null,
          latitude,
          longitude,
          coverImage: form.coverImage.trim() || null,
          openingHours:
            Object.keys(form.openingHours).length > 0
              ? form.openingHours
              : null,
          socialLinks: {
            ...(form.instagram.trim() ? { instagram: form.instagram.trim() } : {}),
            ...(form.facebook.trim() ? { facebook: form.facebook.trim() } : {}),
            ...(form.linkedin.trim() ? { linkedin: form.linkedin.trim() } : {}),
            ...(form.youtube.trim() ? { youtube: form.youtube.trim() } : {}),
            ...(form.twitter.trim() ? { twitter: form.twitter.trim() } : {}),
            ...(form.tiktok.trim() ? { tiktok: form.tiktok.trim() } : {}),
          },
        }),
      });

      await loadBusinesses(true);
      setEditing(false);
      setSuccess("Business profile updated successfully.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to update business.");
    } finally {
      setSaving(false);
    }
  }

  async function createBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (createForm.name.trim().length < 2) {
      setError("Business name must be at least 2 characters.");
      return;
    }

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const response = await apiRequest<ItemResponse>("/businesses", {
        method: "POST",
        body: JSON.stringify({
          name: createForm.name.trim(),
          email: createForm.email.trim() || undefined,
          phone: createForm.phone.trim() || undefined,
          logo: createForm.logo.trim() || undefined,
          description: createForm.description.trim() || undefined,
        }),
      });

      if (response.data) {
        setBusinesses((current) => [response.data!, ...current]);
        setSelectedId(response.data.id);
        localStorage.setItem("tapqr_current_business_id", response.data.id);
      } else {
        await loadBusinesses();
      }

      setCreateForm({ name: "", email: "", phone: "", logo: "", description: "" });
      setShowCreate(false);
      setSuccess(response.message ?? "Business created successfully.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create business.");
    } finally {
      setCreating(false);
    }
  }

  async function deactivateBusiness() {
    if (!selectedBusiness) return;

    try {
      setDeactivating(true);
      setError("");
      setSuccess("");

      await apiRequest(`/businesses/${selectedBusiness.id}`, {
        method: "DELETE",
      });

      const remaining = businesses.filter((item) => item.id !== selectedBusiness.id);
      setBusinesses(remaining);

      const nextId = remaining[0]?.id ?? "";
      setSelectedId(nextId);
      if (nextId) localStorage.setItem("tapqr_current_business_id", nextId);
      else localStorage.removeItem("tapqr_current_business_id");

      setShowDeactivate(false);
      setEditing(false);
      setSuccess("Business deactivated successfully.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to deactivate business.");
    } finally {
      setDeactivating(false);
    }
  }

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="h-44 animate-pulse rounded-[28px] bg-white" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-32 animate-pulse rounded-[22px] bg-white" />
          <div className="h-32 animate-pulse rounded-[22px] bg-white" />
          <div className="h-32 animate-pulse rounded-[22px] bg-white" />
        </div>
        <div className="h-[560px] animate-pulse rounded-[28px] bg-white" />
      </main>
    );
  }

  if (!selectedBusiness) {
    return (
      <main className="space-y-6">
        <section className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm sm:p-16">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Building2 className="h-8 w-8 text-slate-500" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-950">Create your first business</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Create a TapQR workspace to manage your public profile, QR codes, analytics and team.
          </p>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Create business
          </button>
        </section>

        {showCreate && (
          <CreateBusinessModal
            form={createForm}
            setForm={setCreateForm}
            creating={creating}
            onClose={() => setShowCreate(false)}
            onSubmit={createBusiness}
          />
        )}
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {error && <Banner tone="error" message={error} onClose={() => setError("")} />}
      {success && <Banner tone="success" message={success} onClose={() => setSuccess("")} />}

      <section className="relative overflow-visible rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
                <Building2 className="h-3.5 w-3.5" />
                Business workspace
              </span>
              <span className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${getStatusClasses(selectedBusiness.status)}`}>
                {selectedBusiness.status ?? "UNKNOWN"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                {selectedBusiness.logo ? (
                  <img src={selectedBusiness.logo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-black text-slate-500">{getInitials(selectedBusiness.name)}</span>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
                  {selectedBusiness.name}
                </h1>
                <p className="mt-1 truncate text-sm text-slate-500">
                  {selectedBusiness.slug
                    ? `tapqr.shop/${selectedBusiness.slug}`
                    : "Complete your profile to publish your public experience."}
                </p>
              </div>
            </div>

            <div className="relative mt-6">
              <button
                type="button"
                onClick={() => setSwitcherOpen((open) => !open)}
                aria-expanded={switcherOpen}
                aria-haspopup="listbox"
                className="inline-flex max-w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-[10px] font-black text-white">
                  {getInitials(selectedBusiness.name)}
                </span>
                <span className="max-w-[220px] truncate">{selectedBusiness.name}</span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${switcherOpen ? "rotate-180" : ""}`} />
              </button>

              {switcherOpen && (
                <div role="listbox" className="absolute left-0 top-full z-50 mt-2 w-[min(360px,calc(100vw-3rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Your workspaces</div>
                  <div className="max-h-64 overflow-y-auto">
                    {businesses.map((business) => (
                      <button
                        key={business.id}
                        type="button"
                        role="option"
                        aria-selected={business.id === selectedBusiness.id}
                        onClick={() => chooseBusiness(business.id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${business.id === selectedBusiness.id ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-50"}`}
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black ${business.id === selectedBusiness.id ? "bg-white/10 text-white" : "bg-slate-100 text-slate-600"}`}>
                          {getInitials(business.name)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{business.name}</span>
                          <span className={`block text-[11px] ${business.id === selectedBusiness.id ? "text-white/55" : "text-slate-400"}`}>
                            {business.status ?? "UNKNOWN"}
                          </span>
                        </span>
                        {business.id === selectedBusiness.id && <Check className="h-4 w-4" />}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 border-t border-slate-100 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSwitcherOpen(false);
                        setShowCreate(true);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Plus className="h-4 w-4" /></span>
                      Create another business
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setForm(toForm(selectedBusiness));
              }}
              disabled={!editing || saving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(toForm(selectedBusiness));
                setEditing((value) => !value);
                setError("");
                setSuccess("");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" />
              {editing ? "Editing" : "Edit profile"}
            </button>
            <button
              type="button"
              onClick={() => setShowDeactivate(true)}
              disabled={deactivating}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Deactivate
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric title="Businesses" value={String(businesses.length)} helper="Your active workspaces" />
        <Metric title="Active" value={String(activeCount)} helper="Currently active" />
        <Metric title="QR codes" value={String(selectedBusiness.qrCodes?.length ?? 0)} helper="This workspace" />
        <Metric title="Total scans" value={String(totalScans)} helper="Across your workspaces" />
      </section>

      <section className="rounded-[22px] border border-blue-100 bg-blue-50/60 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">Profile readiness</p>
            <h2 className="mt-1 text-base font-bold text-slate-950">Your public profile is {profileCompletion}% complete</h2>
            <p className="mt-1 text-xs text-slate-500">Complete key details to give customers a richer TapQR experience.</p>
          </div>
          <div className="hidden h-16 w-16 items-center justify-center rounded-full border-4 border-blue-100 bg-white sm:flex">
            <span className="text-sm font-black text-blue-600">{profileCompletion}%</span>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${profileCompletion}%` }} />
        </div>
      </section>

      <form onSubmit={saveBusiness} className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <Panel title="Business information" subtitle="Core business identity and contact details.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Business name" value={form.name} disabled={!editing || saving} required onChange={(value) => setField("name", value)} />
              <Field label="Tagline" value={form.tagline} disabled={!editing || saving} onChange={(value) => setField("tagline", value)} />
              <Field label="Business email" type="email" value={form.email} disabled={!editing || saving} onChange={(value) => setField("email", value)} />
              <Field label="Business phone" type="tel" value={form.phone} disabled={!editing || saving} onChange={(value) => setField("phone", value)} />
              <Field label="WhatsApp" type="tel" value={form.whatsapp} disabled={!editing || saving} onChange={(value) => setField("whatsapp", value)} />
              <Field label="Website" type="url" value={form.website} disabled={!editing || saving} onChange={(value) => setField("website", value)} />
            </div>
            <div className="mt-5">
              <TextArea label="Business description" value={form.description} disabled={!editing || saving} onChange={(value) => setField("description", value)} />
            </div>
          </Panel>

          <Panel title="Address" subtitle="Location information shown on the public profile.">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2"><Field label="Address line 1" value={form.addressLine1} disabled={!editing || saving} onChange={(value) => setField("addressLine1", value)} /></div>
              <div className="sm:col-span-2"><Field label="Address line 2" value={form.addressLine2} disabled={!editing || saving} onChange={(value) => setField("addressLine2", value)} /></div>
              <Field label="City" value={form.city} disabled={!editing || saving} onChange={(value) => setField("city", value)} />
              <Field label="State" value={form.state} disabled={!editing || saving} onChange={(value) => setField("state", value)} />
              <Field label="Postal code" value={form.postalCode} disabled={!editing || saving} onChange={(value) => setField("postalCode", value)} />
              <Field label="Country" value={form.country} disabled={!editing || saving} onChange={(value) => setField("country", value)} />
            </div>
          </Panel>

          <Panel title="Map coordinates" subtitle="Optional coordinates for future map and location features.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Latitude" value={form.latitude} disabled={!editing || saving} inputMode="decimal" onChange={(value) => setField("latitude", value)} />
              <Field label="Longitude" value={form.longitude} disabled={!editing || saving} inputMode="decimal" onChange={(value) => setField("longitude", value)} />
            </div>
          </Panel>

          <Panel title="Opening hours" subtitle="Hours shown on your customer-facing experience.">
            <div className="space-y-3">
              {DAYS.map((day) => {
                const hours = form.openingHours[day];
                return (
                  <div key={day} className="grid grid-cols-[90px_1fr_1fr_auto] items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3 sm:grid-cols-[110px_1fr_1fr_auto] sm:gap-3">
                    <span className="text-xs font-semibold capitalize text-slate-700">{day}</span>
                    <input type="time" value={hours?.open ?? ""} disabled={!editing || saving} onChange={(e) => setDayHours(day, "open", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs outline-none focus:border-blue-300 disabled:opacity-50" />
                    <input type="time" value={hours?.close ?? ""} disabled={!editing || saving} onChange={(e) => setDayHours(day, "close", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs outline-none focus:border-blue-300 disabled:opacity-50" />
                    <button type="button" disabled={!editing || saving || !hours} onClick={() => clearDay(day)} aria-label={`Clear ${day} hours`} className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-red-500 disabled:opacity-30"><X className="h-4 w-4" /></button>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Social presence" subtitle="Connect public social profiles.">
            <div className="grid gap-5 sm:grid-cols-2">
              {(["instagram", "facebook", "linkedin", "youtube", "twitter", "tiktok"] as const).map((key) => (
                <Field key={key} label={key === "twitter" ? "X / Twitter" : key.charAt(0).toUpperCase() + key.slice(1)} type="url" value={form[key]} disabled={!editing || saving} onChange={(value) => setField(key, value)} />
              ))}
            </div>
          </Panel>

          {editing && (
            <div className="sticky bottom-4 z-20 flex items-center justify-end gap-2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur">
              <button type="button" onClick={() => { setForm(toForm(selectedBusiness)); setEditing(false); }} disabled={saving} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <Panel title="Brand assets" subtitle="URLs for your business logo and cover image.">
            <div className="space-y-5">
              <Field label="Logo URL" type="url" value={form.logo} disabled={!editing || saving} onChange={(value) => setField("logo", value)} />
              <Field label="Cover image URL" type="url" value={form.coverImage} disabled={!editing || saving} onChange={(value) => setField("coverImage", value)} />
              {form.logo && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <img src={form.logo} alt="" className="h-32 w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Workspace health" subtitle="Key profile areas ready for your customers.">
            <div className="space-y-3">
              <HealthRow label="Business identity" complete={Boolean(form.name.trim())} />
              <HealthRow label="Contact information" complete={Boolean(form.email.trim() || form.phone.trim())} />
              <HealthRow label="Public website" complete={Boolean(form.website.trim())} />
              <HealthRow label="Address" complete={Boolean(form.addressLine1.trim() && form.city.trim())} />
              <HealthRow label="Social presence" complete={Boolean(form.instagram.trim() || form.facebook.trim() || form.linkedin.trim())} />
            </div>
          </Panel>

          <Panel title="Business summary" subtitle="A quick snapshot of this workspace.">
            <div className="space-y-4">
              <SummaryRow icon={<Globe className="h-4 w-4" />} label="Public URL" value={selectedBusiness.slug ? `tapqr.shop/${selectedBusiness.slug}` : "Not published"} />
              <SummaryRow icon={<Phone className="h-4 w-4" />} label="Contact" value={form.whatsapp || form.phone || "Not added"} />
              <SummaryRow icon={<MapPin className="h-4 w-4" />} label="Location" value={[form.city, form.state].filter(Boolean).join(", ") || "Not added"} />
            </div>
          </Panel>

          <Panel title="Refresh workspace" subtitle="Reload the latest business data from the API.">
            <button type="button" onClick={() => void loadBusinesses(true)} disabled={refreshing} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh data"}
            </button>
          </Panel>
        </aside>
      </form>

      {showCreate && <CreateBusinessModal form={createForm} setForm={setCreateForm} creating={creating} onClose={() => setShowCreate(false)} onSubmit={createBusiness} />}
      {showDeactivate && <ConfirmModal loading={deactivating} businessName={selectedBusiness.name} onCancel={() => setShowDeactivate(false)} onConfirm={() => void deactivateBusiness()} />}
    </main>
  );
}

function Metric({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <article className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{helper}</p>
    </article>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <h2 className="text-sm font-bold text-slate-950">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-400">{subtitle}</p>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, disabled, type = "text", required, inputMode }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean; type?: string; required?: boolean; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"] }) {
  return (
    <div>
      {label && <label className="mb-2 block text-xs font-semibold text-slate-700">{label}{required && <span className="ml-1 text-red-500">*</span>}</label>}
      <input type={type} value={value} disabled={disabled} required={required} inputMode={inputMode} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-500/5 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500" />
    </div>
  );
}

function TextArea({ label, value, onChange, disabled }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-700">{label}</label>
      <textarea rows={5} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-500/5 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500" />
    </div>
  );
}

function Banner({ tone, message, onClose }: { tone: "error" | "success"; message: string; onClose: () => void }) {
  const success = tone === "success";
  return (
    <div role={success ? "status" : "alert"} className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}>
      {success ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}
      <span className="min-w-0 flex-1 leading-6">{message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss message" className="rounded-lg p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  );
}

function HealthRow({ label, complete }: { label: string; complete: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold ${complete ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${complete ? "bg-emerald-500" : "bg-amber-500"}`} />
        {complete ? "Complete" : "Incomplete"}
      </span>
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
        <p className="mt-0.5 truncate text-xs font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function CreateBusinessModal({ form, setForm, creating, onClose, onSubmit }: { form: { name: string; email: string; phone: string; logo: string; description: string }; setForm: React.Dispatch<React.SetStateAction<{ name: string; email: string; phone: string; logo: string; description: string }>>; creating: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="create-business-title">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 id="create-business-title" className="text-lg font-bold text-slate-950">Create business</h2>
            <p className="mt-1 text-xs text-slate-400">Start a new TapQR workspace.</p>
          </div>
          <button type="button" onClick={onClose} disabled={creating} aria-label="Close" className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-5 p-6">
          <Field label="Business name" value={form.name} disabled={creating} required onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email" type="email" value={form.email} disabled={creating} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
            <Field label="Phone" type="tel" value={form.phone} disabled={creating} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
          </div>
          <Field label="Logo URL" type="url" value={form.logo} disabled={creating} onChange={(value) => setForm((current) => ({ ...current, logo: value }))} />
          <TextArea label="Description" value={form.description} disabled={creating} onChange={(value) => setForm((current) => ({ ...current, description: value }))} />
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
            <button type="button" onClick={onClose} disabled={creating} className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={creating} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              {creating ? "Creating..." : "Create business"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmModal({ loading, businessName, onCancel, onConfirm }: { loading: boolean; businessName: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="deactivate-business-title">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600"><Trash2 className="h-5 w-5" /></div>
        <h2 id="deactivate-business-title" className="mt-5 text-lg font-bold text-slate-950">Deactivate business?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          “{businessName}” will be marked inactive. Existing data remains stored.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={loading} className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 disabled:opacity-50">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Deactivating..." : "Deactivate business"}
          </button>
        </div>
      </div>
    </div>
  );
}
