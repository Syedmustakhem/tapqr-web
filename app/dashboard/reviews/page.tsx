"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  BarChart3,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  MoreHorizontal,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";

import {
  apiRequest,
  ApiError,
} from "@/lib/api";

type Business = {
  id: string;
  name: string;
  status?: string;
};

type ReviewStatus =
  | "PENDING"
  | "PUBLISHED"
  | "HIDDEN"
  | "REJECTED";

type Review = {
  id: string;
  businessId: string;
  qrCodeId?: string | null;
  userId?: string | null;
  reviewerName?: string | null;
  reviewerEmail?: string | null;
  rating: number;
  title?: string | null;
  comment?: string | null;
  status: ReviewStatus;
  isVerified: boolean;
  verifiedAt?: string | null;
  ownerResponse?: string | null;
  respondedAt?: string | null;
  moderationNote?: string | null;
  createdAt: string;
  updatedAt?: string;
};

type ReviewSummary = {
  averageRating: number;
  totalReviews: number;
  verifiedReviews: number;
  distribution: Array<{
    rating: number;
    count: number;
  }>;
};

type PaginatedReviews = {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type BusinessesResponse = {
  success?: boolean;
  message?: string;
  data?: Business[];
};

type SummaryResponse = {
  success?: boolean;
  message?: string;
  data?: ReviewSummary;
};

type ReviewsResponse = {
  success?: boolean;
  message?: string;
  data?: PaginatedReviews;
};


type StatusFilter =
  | "ALL"
  | ReviewStatus;

const BUSINESS_STORAGE_KEY =
  "tapqr_current_business_id";

const PAGE_SIZE = 20;

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return "Reviews API route was not found. Make sure the backend Reviews routes are mounted at /api/reviews and the deployed API is up to date.";
    }

    if (error.status === 403) {
      return "You do not have permission to manage reviews for this business.";
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatDateTime(
  value?: string | null
) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

function initials(
  name?: string | null
) {
  const value =
    name?.trim() ?? "";

  if (!value) return "C";

  const parts = value
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

function statusLabel(
  status: ReviewStatus
) {
  if (status === "PUBLISHED") {
    return "Published";
  }

  if (status === "REJECTED") {
    return "Rejected";
  }

  if (status === "HIDDEN") {
    return "Hidden";
  }

  return "Pending";
}

function canPublish(
  status: ReviewStatus
) {
  return (
    status === "PENDING" ||
    status === "HIDDEN"
  );
}

export default function ReviewsPage() {
  const [businesses, setBusinesses] =
    useState<Business[]>([]);

  const [businessId, setBusinessId] =
    useState("");

  const [businessMenuOpen, setBusinessMenuOpen] =
    useState(false);

  const [summary, setSummary] =
    useState<ReviewSummary | null>(
      null
    );

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [meta, setMeta] =
    useState({
      total: 0,
      page: 1,
      totalPages: 1,
      limit: PAGE_SIZE,
    });

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const [ratingFilter, setRatingFilter] =
    useState("ALL");

  const [verifiedFilter, setVerifiedFilter] =
    useState("ALL");

  const [search, setSearch] =
    useState("");

  const [loadingBusinesses, setLoadingBusinesses] =
    useState(true);

  const [loadingData, setLoadingData] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [openMenuId, setOpenMenuId] =
    useState("");

  const [actionLoadingId, setActionLoadingId] =
    useState("");

  const [responseReview, setResponseReview] =
    useState<Review | null>(null);

  const [responseText, setResponseText] =
    useState("");

  const [savingResponse, setSavingResponse] =
    useState(false);

  const [confirmAction, setConfirmAction] =
    useState<{
      review: Review;
      targetStatus: ReviewStatus;
      title: string;
      description: string;
      destructive?: boolean;
    } | null>(null);

  const selectedBusiness = useMemo(
    () =>
      businesses.find(
        (business) =>
          business.id ===
          businessId
      ) ?? null,
    [businesses, businessId]
  );

  const loadBusinesses =
    useCallback(async () => {
      try {
        setLoadingBusinesses(true);
        setError("");

        const response =
          await apiRequest<BusinessesResponse>(
            "/businesses"
          );

        const data =
          response?.data ?? [];

        setBusinesses(data);

        const storedId =
          typeof window !==
          "undefined"
            ? localStorage.getItem(
                BUSINESS_STORAGE_KEY
              )
            : null;

        const usableBusinesses =
          data.filter(
            (business) =>
              business.status ===
                undefined ||
              business.status ===
                "ACTIVE"
          );

        const nextId =
          usableBusinesses.find(
            (business) =>
              business.id ===
              storedId
          )?.id ??
          usableBusinesses[0]?.id ??
          "";

        setBusinessId(nextId);

        if (
          nextId &&
          typeof window !==
            "undefined"
        ) {
          localStorage.setItem(
            BUSINESS_STORAGE_KEY,
            nextId
          );
        }
      } catch (error) {
        if (
          error instanceof ApiError &&
          error.status === 401
        ) {
          window.location.replace(
            "/login"
          );
          return;
        }

        setError(
          errorMessage(error)
        );
      } finally {
        setLoadingBusinesses(
          false
        );
      }
    }, []);

  const loadReviews =
    useCallback(
      async (
        currentBusinessId: string,
        page = 1
      ) => {
        if (!currentBusinessId) {
          setReviews([]);
          setSummary(null);
          setLoadingData(false);
          return;
        }

        try {
          setLoadingData(true);
          setError("");

          const params =
            new URLSearchParams();

          params.set(
            "page",
            String(page)
          );

          params.set(
            "limit",
            String(PAGE_SIZE)
          );

          if (
            statusFilter !== "ALL"
          ) {
            params.set(
              "status",
              statusFilter
            );
          }

          if (
            ratingFilter !== "ALL"
          ) {
            params.set(
              "rating",
              ratingFilter
            );
          }

          if (
            verifiedFilter !== "ALL"
          ) {
            params.set(
              "verified",
              verifiedFilter
            );
          }

          if (search.trim()) {
            params.set(
              "search",
              search.trim()
            );
          }

          const [
            reviewResponse,
            summaryResponse,
          ] = await Promise.all([
            apiRequest<ReviewsResponse>(
              `/reviews/businesses/${encodeURIComponent(currentBusinessId)}/manage?${params.toString()}`
            ),
            apiRequest<SummaryResponse>(
              `/reviews/businesses/${encodeURIComponent(currentBusinessId)}/summary`
            ),
          ]);

          const data =
            reviewResponse?.data;

          setReviews(
            data?.reviews ?? []
          );

          setMeta({
            total:
              data?.total ?? 0,
            page:
              data?.page ?? page,
            totalPages:
              data?.totalPages ?? 1,
            limit:
              data?.limit ??
              PAGE_SIZE,
          });

          setSummary(
            summaryResponse?.data ??
              null
          );
        } catch (error) {
          if (
            error instanceof ApiError &&
            error.status === 401
          ) {
            window.location.replace(
              "/login"
            );
            return;
          }

          setError(
            errorMessage(error)
          );
        } finally {
          setLoadingData(false);
        }
      },
      [
        statusFilter,
        ratingFilter,
        verifiedFilter,
        search,
      ]
    );

  useEffect(() => {
    void loadBusinesses();
  }, [loadBusinesses]);

  useEffect(() => {
    if (!businessId) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        void loadReviews(
          businessId,
          1
        );
      }, 250);

    return () =>
      window.clearTimeout(
        timer
      );
  }, [
    businessId,
    statusFilter,
    ratingFilter,
    verifiedFilter,
    search,
    loadReviews,
  ]);

  function selectBusiness(
    nextBusinessId: string
  ) {
    setBusinessId(
      nextBusinessId
    );

    setBusinessMenuOpen(false);

    if (
      typeof window !==
      "undefined"
    ) {
      localStorage.setItem(
        BUSINESS_STORAGE_KEY,
        nextBusinessId
      );
    }
  }

  async function refresh() {
    if (!businessId) return;

    try {
      setRefreshing(true);

      await loadReviews(
        businessId,
        meta.page
      );

      setSuccess(
        "Reviews refreshed."
      );

      window.setTimeout(
        () => setSuccess(""),
        2000
      );
    } finally {
      setRefreshing(false);
    }
  }

  async function moderate(
    review: Review,
    targetStatus: ReviewStatus
  ) {
    try {
      setActionLoadingId(
        review.id
      );
      setError("");
      setOpenMenuId("");

      await apiRequest(
        `/reviews/${review.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status:
              targetStatus,
          }),
        }
      );

      await loadReviews(
        businessId,
        meta.page
      );

      setSuccess(
        targetStatus ===
          "PUBLISHED"
          ? "Review published successfully."
          : targetStatus ===
              "HIDDEN"
            ? "Review hidden successfully."
            : "Review rejected successfully."
      );

      window.setTimeout(
        () => setSuccess(""),
        2200
      );
    } catch (error) {
      setError(
        errorMessage(error)
      );
    } finally {
      setActionLoadingId("");
      setConfirmAction(null);
    }
  }

  async function saveResponse() {
    if (
      !responseReview ||
      !responseText.trim()
    ) {
      return;
    }

    try {
      setSavingResponse(true);
      setError("");

      await apiRequest(
        `/reviews/${responseReview.id}/response`,
        {
          method: "PATCH",
          body: JSON.stringify({
            response:
              responseText.trim(),
          }),
        }
      );

      await loadReviews(
        businessId,
        meta.page
      );

      setResponseReview(null);
      setResponseText("");

      setSuccess(
        "Business response saved."
      );

      window.setTimeout(
        () => setSuccess(""),
        2200
      );
    } catch (error) {
      setError(
        errorMessage(error)
      );
    } finally {
      setSavingResponse(false);
    }
  }

  const ratingAverage =
    summary?.averageRating ?? 0;

  if (loadingBusinesses) {
    return (
      <ReviewsSkeleton />
    );
  }

  if (!selectedBusiness) {
    return (
      <main className="space-y-7">
        <section className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <MessageSquare className="h-8 w-8 text-slate-500" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Reviews need a business
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Create or select a business before managing customer reviews.
          </p>

          <a
            href="/dashboard/business"
            className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
          >
            Open Business
          </a>
        </section>
      </main>
    );
  }

  return (
    <main
      className="space-y-7"
      onClick={() =>
        setOpenMenuId("")
      }
    >
      {/* Header */}
      <section
        className="relative overflow-visible rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
              <MessageSquare className="h-3.5 w-3.5" />
              Reputation
            </div>

            <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              Reviews
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Monitor customer feedback, moderate reviews and respond from one secure workspace.
            </p>

            <div className="relative mt-5">
              <button
                type="button"
                onClick={() =>
                  setBusinessMenuOpen(
                    (open) => !open
                  )
                }
                className="inline-flex max-w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-[10px] font-black text-white">
                  {initials(
                    selectedBusiness.name
                  )}
                </span>

                <span className="max-w-[250px] truncate">
                  {selectedBusiness.name}
                </span>

                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {businessMenuOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-[320px] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                  <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Select business
                  </p>

                  {businesses.map(
                    (business) => (
                      <button
                        key={
                          business.id
                        }
                        type="button"
                        onClick={() =>
                          selectBusiness(
                            business.id
                          )
                        }
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${
                          business.id ===
                          businessId
                            ? "bg-slate-950 text-white"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-700">
                          {initials(
                            business.name
                          )}
                        </span>

                        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                          {business.name}
                        </span>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              void refresh()
            }
            disabled={refreshing}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={
                refreshing
                  ? "h-4 w-4 animate-spin"
                  : "h-4 w-4"
              }
            />
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </section>

      {error && (
        <Notice
          tone="error"
          message={error}
          onClose={() =>
            setError("")
          }
        />
      )}

      {success && (
        <Notice
          tone="success"
          message={success}
          onClose={() =>
            setSuccess("")
          }
        />
      )}

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Average rating"
          value={ratingAverage.toFixed(
            1
          )}
          helper={
            summary?.totalReviews
              ? `${summary.totalReviews} published reviews`
              : "No published reviews yet"
          }
          icon={
            <Star className="h-5 w-5 fill-current" />
          }
          tone="amber"
          loading={loadingData}
        />

        <StatCard
          label="Total reviews"
          value={
            summary?.totalReviews ??
            0
          }
          helper="Published customer reviews"
          icon={
            <MessageSquare className="h-5 w-5" />
          }
          tone="blue"
          loading={loadingData}
        />

        <StatCard
          label="Verified reviews"
          value={
            summary?.verifiedReviews ??
            0
          }
          helper="Verified published reviews"
          icon={
            <ShieldCheck className="h-5 w-5" />
          }
          tone="green"
          loading={loadingData}
        />

        <StatCard
          label="Pending moderation"
          value={
            statusFilter ===
              "PENDING"
              ? meta.total
              : "—"
          }
          helper={
            statusFilter ===
            "PENDING"
              ? "Current filtered count"
              : "Select Pending to review"
          }
          icon={
            <AlertCircle className="h-5 w-5" />
          }
          tone="violet"
          loading={loadingData}
        />
      </section>

      {/* Rating distribution */}
      <section className="grid gap-5 lg:grid-cols-[1fr_330px]">
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Rating distribution
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Published reviews across each star rating.
              </p>
            </div>

            <BarChart3 className="h-5 w-5 text-slate-300" />
          </div>

          <div className="mt-6 space-y-3">
            {[5, 4, 3, 2, 1].map(
              (star) => {
                const count =
                  summary?.distribution.find(
                    (item) =>
                      item.rating ===
                      star
                  )?.count ??
                  0;

                const percentage =
                  summary?.totalReviews
                    ? (count /
                        summary.totalReviews) *
                      100
                    : 0;

                return (
                  <div
                    key={star}
                    className="grid grid-cols-[34px_1fr_42px] items-center gap-3"
                  >
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                      {star}
                      <Star className="h-3 w-3 fill-current text-amber-400" />
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <span className="text-right text-xs font-semibold text-slate-400">
                      {count}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
            Reputation signal
          </p>

          <div className="mt-4 flex items-end gap-2">
            <span className="text-5xl font-black tracking-tight">
              {ratingAverage.toFixed(
                1
              )}
            </span>

            <div className="pb-2">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map(
                  (star) => (
                    <Star
                      key={star}
                      className="h-4 w-4 fill-current"
                    />
                  )
                )}
              </div>

              <p className="mt-1 text-[10px] text-white/45">
                Customer rating
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white/5 p-4">
            <p className="text-xs font-bold">
              Keep your reputation active
            </p>

            <p className="mt-1 text-[11px] leading-5 text-white/55">
              Reply to published reviews quickly and use feedback to improve the customer experience.
            </p>
          </div>

          <p className="mt-4 text-[10px] leading-5 text-white/45">
            Public review visibility is controlled by the published review status.
          </p>
        </div>
      </section>

      {/* Review manager */}
      <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  ["ALL", "All"],
                  ["PENDING", "Pending"],
                  ["PUBLISHED", "Published"],
                  ["HIDDEN", "Hidden"],
                  ["REJECTED", "Rejected"],
                ] as Array<
                  [
                    StatusFilter,
                    string
                  ]
                >
              ).map(
                ([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setStatusFilter(
                        value
                      )
                    }
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${
                      statusFilter ===
                      value
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>

            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <label className="relative min-w-0 lg:w-[320px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search reviews..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-medium outline-none focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <Select
                  value={
                    ratingFilter
                  }
                  onChange={
                    setRatingFilter
                  }
                  options={[
                    ["ALL", "All ratings"],
                    ["5", "5 stars"],
                    ["4", "4 stars"],
                    ["3", "3 stars"],
                    ["2", "2 stars"],
                    ["1", "1 star"],
                  ]}
                />

                <Select
                  value={
                    verifiedFilter
                  }
                  onChange={
                    setVerifiedFilter
                  }
                  options={[
                    ["ALL", "All reviews"],
                    ["true", "Verified"],
                    ["false", "Unverified"],
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {loadingData ? (
          <ReviewSkeleton />
        ) : reviews.length ===
          0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <MessageSquare className="h-6 w-6 text-slate-400" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              No reviews found
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-400">
              Try adjusting your filters or wait for customers to submit feedback.
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {reviews.map(
                (review) => (
                  <ReviewRow
                    key={review.id}
                    review={review}
                    actionLoading={
                      actionLoadingId ===
                      review.id
                    }
                    menuOpen={
                      openMenuId ===
                      review.id
                    }
                    onMenu={() =>
                      setOpenMenuId(
                        openMenuId ===
                          review.id
                          ? ""
                          : review.id
                      )
                    }
                    onPublish={() =>
                      setConfirmAction({
                        review,
                        targetStatus:
                          "PUBLISHED",
                        title:
                          "Publish this review?",
                        description:
                          "It will become visible on the public TapQR review experience.",
                      })
                    }
                    onHide={() =>
                      setConfirmAction({
                        review,
                        targetStatus:
                          "HIDDEN",
                        title:
                          "Hide this review?",
                        description:
                          "It will no longer appear publicly, but the review will remain stored.",
                        destructive:
                          true,
                      })
                    }
                    onReject={() =>
                      setConfirmAction({
                        review,
                        targetStatus:
                          "REJECTED",
                        title:
                          "Reject this review?",
                        description:
                          "The review will be marked rejected and remain unavailable publicly.",
                        destructive:
                          true,
                      })
                    }
                    onRespond={() => {
                      setOpenMenuId("");
                      setResponseReview(
                        review
                      );
                      setResponseText(
                        review.ownerResponse ??
                          ""
                      );
                    }}
                  />
                )
              )}
            </div>

            <Pagination
              page={meta.page}
              totalPages={
                meta.totalPages
              }
              total={meta.total}
              onPrevious={() =>
                void loadReviews(
                  businessId,
                  meta.page - 1
                )
              }
              onNext={() =>
                void loadReviews(
                  businessId,
                  meta.page + 1
                )
              }
            />
          </>
        )}
      </section>

      {/* Moderation safety */}
      <section className="rounded-[22px] border border-blue-100 bg-blue-50/60 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

          <div>
            <h2 className="text-sm font-bold text-blue-950">
              Moderation & privacy
            </h2>

            <p className="mt-1 max-w-3xl text-xs leading-5 text-blue-900/70">
              Only published reviews are shown on the public experience. Review moderation is enforced by the authenticated backend, and customer contact details are kept out of the public review list.
            </p>
          </div>
        </div>
      </section>

      {/* Response modal */}
      {responseReview && (
        <Modal
          title="Respond to review"
          description="Your response will be visible below this published review."
          onClose={() => {
            if (!savingResponse) {
              setResponseReview(
                null
              );
              setResponseText("");
            }
          }}
        >
          <div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(
                  (star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <=
                        responseReview.rating
                          ? "fill-current text-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  )
                )}
              </div>

              <p className="mt-2 text-sm font-bold text-slate-900">
                {responseReview.title ||
                  "Customer review"}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {responseReview.comment ||
                  "No written comment."}
              </p>
            </div>

            <textarea
              value={
                responseText
              }
              onChange={(event) =>
                setResponseText(
                  event.target.value
                )
              }
              maxLength={2000}
              rows={6}
              placeholder="Write a professional response..."
              className="mt-4 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
            />

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-[10px] text-slate-400">
                {responseText.length}/2000
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setResponseReview(
                      null
                    );
                    setResponseText(
                      ""
                    );
                  }}
                  disabled={
                    savingResponse
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void saveResponse()
                  }
                  disabled={
                    savingResponse ||
                    !responseText.trim()
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {savingResponse ? (
                    <Loader />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Save response
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation modal */}
      {confirmAction && (
        <Modal
          title={
            confirmAction.title
          }
          description={
            confirmAction.description
          }
          onClose={() => {
            if (!actionLoadingId) {
              setConfirmAction(
                null
              );
            }
          }}
        >
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() =>
                setConfirmAction(
                  null
                )
              }
              disabled={
                !!actionLoadingId
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() =>
                void moderate(
                  confirmAction.review,
                  confirmAction.targetStatus
                )
              }
              disabled={
                !!actionLoadingId
              }
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white ${
                confirmAction.destructive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-slate-950 hover:bg-slate-800"
              }`}
            >
              {actionLoadingId ? (
                <Loader />
              ) : null}
              Confirm
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable UI                                                                */
/* -------------------------------------------------------------------------- */

function StatCard({
  label,
  value,
  helper,
  icon,
  tone,
  loading,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: React.ReactNode;
  tone:
    | "amber"
    | "blue"
    | "green"
    | "violet";
  loading: boolean;
}) {
  const toneClasses = {
    amber:
      "bg-amber-50 text-amber-500",
    blue:
      "bg-blue-50 text-blue-600",
    green:
      "bg-emerald-50 text-emerald-600",
    violet:
      "bg-violet-50 text-violet-600",
  };

  return (
    <article className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm">
      {loading ? (
        <div className="animate-pulse">
          <div className="flex justify-between">
            <div className="h-3 w-28 rounded bg-slate-100" />
            <div className="h-10 w-10 rounded-xl bg-slate-100" />
          </div>
          <div className="mt-4 h-9 w-20 rounded-lg bg-slate-100" />
          <div className="mt-2 h-3 w-32 rounded bg-slate-100" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              {label}
            </p>

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}
            >
              {icon}
            </div>
          </div>

          <p className="mt-4 text-3xl font-black tracking-tight text-slate-950">
            {typeof value ===
            "number"
              ? new Intl.NumberFormat(
                  "en-IN"
                ).format(value)
              : value}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            {helper}
          </p>
        </>
      )}
    </article>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (
    value: string
  ) => void;
  options: Array<
    [string, string]
  >;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="h-10 min-w-[130px] appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-xs font-semibold text-slate-700 outline-none hover:bg-slate-50 focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10"
      >
        {options.map(
          ([value, label]) => (
            <option
              key={value}
              value={value}
            >
              {label}
            </option>
          )
        )}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function ReviewRow({
  review,
  menuOpen,
  actionLoading,
  onMenu,
  onPublish,
  onHide,
  onReject,
  onRespond,
}: {
  review: Review;
  menuOpen: boolean;
  actionLoading: boolean;
  onMenu: () => void;
  onPublish: () => void;
  onHide: () => void;
  onReject: () => void;
  onRespond: () => void;
}) {
  return (
    <article className="p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">
          {initials(
            review.reviewerName
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-bold text-slate-950">
                  {review.reviewerName ||
                    "Customer"}
                </p>

                {review.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
                <span>
                  {formatDateTime(
                    review.createdAt
                  )}
                </span>

                {review.reviewerEmail && (
                  <span className="truncate">
                    {review.reviewerEmail}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge
                status={
                  review.status
                }
              />

              {actionLoading ? (
                <Loader />
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onMenu();
                    }}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                    aria-label="Review actions"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>

                  {menuOpen && (
                    <ReviewMenu
                      review={review}
                      onPublish={
                        onPublish
                      }
                      onHide={
                        onHide
                      }
                      onReject={
                        onReject
                      }
                      onRespond={
                        onRespond
                      }
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(
              (star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <=
                    review.rating
                      ? "fill-current text-amber-400"
                      : "text-slate-200"
                  }`}
                />
              )
            )}
          </div>

          {review.title && (
            <h3 className="mt-3 text-sm font-bold text-slate-900">
              {review.title}
            </h3>
          )}

          <p className="mt-1 max-w-4xl whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {review.comment ||
              "No written comment."}
          </p>

          {review.moderationNote && (
            <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-amber-700">
                Moderation note
              </p>

              <p className="mt-1 text-xs text-amber-900/70">
                {review.moderationNote}
              </p>
            </div>
          )}

          {review.ownerResponse && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />

                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  Business response
                </p>

                {review.respondedAt && (
                  <span className="text-[10px] text-slate-400">
                    {formatDate(
                      review.respondedAt
                    )}
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-600">
                {review.ownerResponse}
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function ReviewMenu({
  review,
  onPublish,
  onHide,
  onReject,
  onRespond,
}: {
  review: Review;
  onPublish: () => void;
  onHide: () => void;
  onReject: () => void;
  onRespond: () => void;
}) {
  return (
    <div
      onClick={(event) =>
        event.stopPropagation()
      }
      className="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl"
    >
      {canPublish(
        review.status
      ) && (
        <button
          type="button"
          onClick={onPublish}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
        >
          <Check className="h-4 w-4" />
          Publish
        </button>
      )}

      {review.status ===
        "PUBLISHED" && (
        <>
          <button
            type="button"
            onClick={onRespond}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <MessageSquare className="h-4 w-4" />
            Respond
          </button>

          <button
            type="button"
            onClick={onHide}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-amber-700 hover:bg-amber-50"
          >
            <X className="h-4 w-4" />
            Hide
          </button>
        </>
      )}

      {review.status !==
        "REJECTED" && (
        <button
          type="button"
          onClick={onReject}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
        >
          <X className="h-4 w-4" />
          Reject
        </button>
      )}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: ReviewStatus;
}) {
  const classes = {
    PENDING:
      "bg-amber-50 text-amber-700",
    PUBLISHED:
      "bg-emerald-50 text-emerald-700",
    HIDDEN:
      "bg-slate-100 text-slate-600",
    REJECTED:
      "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${classes[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}

function Pagination({
  page,
  totalPages,
  total,
  onPrevious,
  onNext,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 sm:px-6">
      <p className="text-[10px] text-slate-400">
        Page {page} of{" "}
        {Math.max(
          1,
          totalPages
        )}{" "}
        · {total} reviews
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrevious}
          disabled={page <= 1}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={
            page >=
            totalPages
          }
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Notice({
  tone,
  message,
  onClose,
}: {
  tone:
    | "error"
    | "success";
  message: string;
  onClose: () => void;
}) {
  const success =
    tone === "success";

  return (
    <div
      role={
        success
          ? "status"
          : "alert"
      }
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {success ? (
        <Check className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      )}

      <span className="min-w-0 flex-1">
        {message}
      </span>

      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-1 opacity-70 hover:bg-black/5 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function Modal({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              {title}
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function Loader() {
  return (
    <span
      aria-label="Loading"
      className="inline-flex items-center gap-1"
    >
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
    </span>
  );
}

function ReviewSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="flex gap-4 p-5 sm:p-6"
          >
            <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-100" />
            <div className="flex-1">
              <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
              <div className="mt-3 h-3 w-24 animate-pulse rounded bg-slate-100" />
              <div className="mt-3 h-3 w-full max-w-xl animate-pulse rounded bg-slate-100" />
              <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        )
      )}
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <main className="space-y-7">
      <div className="h-52 animate-pulse rounded-[28px] bg-white" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-[22px] bg-white"
            />
          )
        )}
      </div>

      <div className="h-[520px] animate-pulse rounded-[24px] bg-white" />
    </main>
  );
}
