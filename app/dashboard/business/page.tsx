"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";
import {
  Building2,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Mail,
  Phone,
  Globe,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type Business = {
  id: string;
  ownerId?: string;
  name: string;
  slug?: string | null;
  email?: string | null;
  phone?: string | null;
  logo?: string | null;
  description?: string | null;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | string;
  createdAt?: string;
  updatedAt?: string;
};

type BusinessesResponse = {
  success?: boolean;
  message?: string;
  data?: Business[];
};

type BusinessResponse = {
  success?: boolean;
  message?: string;
  data?: Business;
};

export default function BusinessPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    logo: "",
    description: "",
  });

  async function loadBusinesses(showRefresh = false) {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await apiRequest<BusinessesResponse>(
        "/businesses"
      );

      setBusinesses(response?.data ?? []);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to load businesses.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadBusinesses();
  }, []);

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function createBusiness(event: FormEvent) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Business name is required.");
      return;
    }

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const response = await apiRequest<BusinessResponse>(
        "/businesses",
        {
          method: "POST",
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim() || undefined,
            phone: form.phone.trim() || undefined,
            logo: form.logo.trim() || undefined,
            description:
              form.description.trim() || undefined,
          }),
        }
      );

      if (response?.data) {
        setBusinesses((current) => [
          response.data!,
          ...current,
        ]);
      }

      setForm({
        name: "",
        email: "",
        phone: "",
        logo: "",
        description: "",
      });

      setShowCreate(false);
      setSuccess(
        response?.message ||
          "Business created successfully."
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to create business.");
      }
    } finally {
      setCreating(false);
    }
  }

  async function deleteBusiness(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this business?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await apiRequest(`/businesses/${id}`, {
        method: "DELETE",
      });

      setBusinesses((current) =>
        current.filter((business) => business.id !== id)
      );

      setSuccess("Business deactivated successfully.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to delete business.");
      }
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-slate-900" />

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Business
              </h1>
            </div>

            <p className="text-sm text-slate-500">
              Manage your business profile and information.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadBusinesses(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setShowCreate(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />

              Add Business
            </button>
          </div>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* STATS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Businesses
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {businesses.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Active
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {
                businesses.filter(
                  (business) =>
                    business.status === "ACTIVE"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Inactive / Suspended
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-600">
              {
                businesses.filter(
                  (business) =>
                    business.status !== "ACTIVE"
                ).length
              }
            </p>
          </div>
        </div>

        {/* BUSINESS LIST */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Building2 className="h-7 w-7 text-slate-500" />
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              No business yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Create your first business to start managing
              your TapQR workspace.
            </p>

            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />

              Create Business
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {businesses.map((business) => (
              <div
                key={business.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                {/* BUSINESS TOP */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                      {business.logo ? (
                        <img
                          src={business.logo}
                          alt={business.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-7 w-7 text-slate-500" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-slate-900">
                        {business.name}
                      </h2>

                      {business.slug && (
                        <p className="mt-1 truncate text-sm text-slate-500">
                          /{business.slug}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      business.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700"
                        : business.status === "SUSPENDED"
                        ? "bg-red-50 text-red-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {business.status || "UNKNOWN"}
                  </span>
                </div>

                {/* DESCRIPTION */}
                <p className="mt-5 min-h-[42px] text-sm leading-6 text-slate-600">
                  {business.description ||
                    "No business description added yet."}
                </p>

                {/* INFO */}
                <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                  {business.email && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="truncate">
                        {business.email}
                      </span>
                    </div>
                  )}

                  {business.phone && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{business.phone}</span>
                    </div>
                  )}

                  {business.slug && (
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Globe className="h-4 w-4 text-slate-400" />
                      <span className="truncate">
                        {business.slug}
                      </span>
                    </div>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteBusiness(business.id)
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Create Business
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add your business information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={createBusiness}
              className="space-y-5 px-6 py-6"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Business name
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    updateField("name", e.target.value)
                  }
                  placeholder="Example Restaurant"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      updateField(
                        "email",
                        e.target.value
                      )
                    }
                    placeholder="business@example.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Phone
                  </label>

                  <input
                    value={form.phone}
                    onChange={(e) =>
                      updateField(
                        "phone",
                        e.target.value
                      )
                    }
                    placeholder="+91..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Logo URL
                </label>

                <input
                  value={form.logo}
                  onChange={(e) =>
                    updateField("logo", e.target.value)
                  }
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateField(
                      "description",
                      e.target.value
                    )
                  }
                  rows={4}
                  placeholder="Tell customers about your business..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating
                    ? "Creating..."
                    : "Create Business"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}