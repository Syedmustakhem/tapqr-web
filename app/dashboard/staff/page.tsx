"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Mail,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserMinus,
  Users,
  X,
} from "lucide-react";

import {
  apiRequest,
  ApiError,
} from "@/lib/api";

import {
  AuthUser,
  getStoredUser,
  saveUser,
} from "@/lib/auth";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Business = {
  id: string;
  name: string;
  status?: string;
};

type MemberRole =
  | "OWNER"
  | "MANAGER"
  | "STAFF";

type MemberStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "REMOVED";

type InvitationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED";

type Member = {
  id: string;
  userId: string;
  businessId: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    fullName?: string | null;
    email?: string | null;
    phone?: string | null;
    role?: string | null;
    isActive?: boolean;
  };
};

type Invitation = {
  id: string;
  businessId?: string;
  email: string;
  role: MemberRole;
  status: InvitationStatus;
  expiresAt: string;
  createdAt?: string;
  acceptedAt?: string | null;
  business?: {
    id: string;
    name?: string;
    slug?: string;
  };
  invitedBy?: {
    id: string;
    fullName?: string | null;
    email?: string | null;
  };
};

type PaginatedMembers = {
  members: Member[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type PaginatedInvitations = {
  invitations: Invitation[];
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

type MembersResponse = {
  success?: boolean;
  message?: string;
  data?: PaginatedMembers;
};

type InvitationsResponse = {
  success?: boolean;
  message?: string;
  data?: PaginatedInvitations;
};

type BasicResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

type StaffTab =
  | "members"
  | "invitations";

type RoleFilter =
  | "ALL"
  | MemberRole;

type StatusFilter =
  | "ALL"
  | MemberStatus;

const BUSINESS_STORAGE_KEY =
  "tapqr_current_business_id";

const MEMBERS_LIMIT = 20;
const INVITATIONS_LIMIT = 20;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatDateTime(
  value?: string
) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

function initials(
  value?: string | null
) {
  const safe =
    value?.trim() ?? "";

  const parts = safe
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

function roleLabel(
  role: MemberRole
) {
  return (
    role.charAt(0) +
    role.slice(1).toLowerCase()
  );
}

function statusLabel(
  status: MemberStatus
) {
  return (
    status.charAt(0) +
    status.slice(1).toLowerCase()
  );
}

function isManagerCapable(
  role: MemberRole
) {
  return (
    role === "OWNER" ||
    role === "MANAGER"
  );
}

function daysUntil(
  value: string
) {
  const expiry =
    new Date(value).getTime();
  const diff =
    expiry - Date.now();

  return Math.ceil(
    diff / 86_400_000
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function StaffPage() {
  const [businesses, setBusinesses] =
    useState<Business[]>([]);

  const [currentUser, setCurrentUser] =
    useState<AuthUser | null>(
      () => getStoredUser()
    );

  const [selectedBusinessId, setSelectedBusinessId] =
    useState("");

  const [businessMenuOpen, setBusinessMenuOpen] =
    useState(false);

  const [tab, setTab] =
    useState<StaffTab>("members");

  const [members, setMembers] =
    useState<Member[]>([]);

  const [memberMeta, setMemberMeta] =
    useState({
      total: 0,
      page: 1,
      totalPages: 1,
      limit: MEMBERS_LIMIT,
    });

  const [invitations, setInvitations] =
    useState<Invitation[]>([]);

  const [invitationMeta, setInvitationMeta] =
    useState({
      total: 0,
      page: 1,
      totalPages: 1,
      limit: INVITATIONS_LIMIT,
    });

  const [memberSearch, setMemberSearch] =
    useState("");

  const [memberRoleFilter, setMemberRoleFilter] =
    useState<RoleFilter>("ALL");

  const [memberStatusFilter, setMemberStatusFilter] =
    useState<StatusFilter>("ALL");

  const [invitationStatusFilter, setInvitationStatusFilter] =
    useState<
      "ALL" | InvitationStatus
    >("PENDING");

  const [loadingBusinesses, setLoadingBusinesses] =
    useState(true);

  const [loadingMembers, setLoadingMembers] =
    useState(true);

  const [loadingInvitations, setLoadingInvitations] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [inviteOpen, setInviteOpen] =
    useState(false);

  const [inviteEmail, setInviteEmail] =
    useState("");

  const [inviteRole, setInviteRole] =
    useState<"MANAGER" | "STAFF">(
      "STAFF"
    );

  const [submittingInvite, setSubmittingInvite] =
    useState(false);

  const [actionLoadingId, setActionLoadingId] =
    useState("");

  const [openMemberMenuId, setOpenMemberMenuId] =
    useState("");

  const [openInvitationMenuId, setOpenInvitationMenuId] =
    useState("");

  const memberFilterInitializedRef =
    useRef(false);

  const invitationFilterInitializedRef =
    useRef(false);

  const [confirmAction, setConfirmAction] =
    useState<{
      type:
        | "removeMember"
        | "suspendMember"
        | "activateMember"
        | "cancelInvitation"
        | "resendInvitation";
      id: string;
      title: string;
      description: string;
      destructive?: boolean;
    } | null>(null);

  const selectedBusiness = useMemo(
    () =>
      businesses.find(
        (business) =>
          business.id ===
          selectedBusinessId
      ) ?? null,
    [
      businesses,
      selectedBusinessId,
    ]
  );

  const myMembership = useMemo(
    () =>
      currentUser?.id
        ? members.find(
            (member) =>
              member.userId ===
              currentUser.id
          ) ?? null
        : null,
    [members, currentUser?.id]
  );

  /*
   * The backend treats the business owner as OWNER even when there is
   * no BusinessMember row for that owner. Use the authenticated user
   * only as a UI hint; backend authorization remains authoritative.
   */
  const actorRole: MemberRole =
    myMembership?.role ??
    (currentUser?.role
      ?.toUpperCase() === "OWNER"
      ? "OWNER"
      : "STAFF");

  const canManage =
    isManagerCapable(
      actorRole
    );

  const canInviteManager =
    actorRole === "OWNER";

  const activeMemberCount =
    members.filter(
      (member) =>
        member.status ===
        "ACTIVE"
    ).length;

  const pendingInvitationCount =
    invitationStatusFilter === "PENDING"
      ? invitationMeta.total
      : invitations.filter(
          (invitation) =>
            invitation.status ===
            "PENDING" &&
            new Date(
              invitation.expiresAt
            ).getTime() > Date.now()
        ).length;

  /*
   * We keep the API filter server-side. This derived list is only used
   * for the current page in case a backend response contains a member
   * outside the exact UI scope.
   */
  const visibleMembers =
    members;

  const loadBusinesses =
    useCallback(
      async () => {
        try {
          setLoadingBusinesses(true);
          setError("");

          const [meResponse, businessResponse] =
            await Promise.all([
              apiRequest<{
                success?: boolean;
                message?: string;
                data?: AuthUser;
                user?: AuthUser;
              }>("/auth/me"),
              apiRequest<BusinessesResponse>(
                "/businesses"
              ),
            ]);

          const authenticatedUser =
            meResponse?.data ??
            meResponse?.user ??
            null;

          if (authenticatedUser) {
            setCurrentUser(
              authenticatedUser
            );
            saveUser(
              authenticatedUser
            );
          }

          const data =
            businessResponse?.data ?? [];

          setBusinesses(data);

          const storedId =
            typeof window !==
            "undefined"
              ? localStorage.getItem(
                  BUSINESS_STORAGE_KEY
                )
              : null;

          const nextId =
            data.find(
              (business) =>
                business.id === storedId
            )?.id ??
            data[0]?.id ??
            "";

          setSelectedBusinessId(
            nextId
          );

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
        } catch (err) {
          setError(
            getErrorMessage(err)
          );
        } finally {
          setLoadingBusinesses(
            false
          );
        }
      },
      []
    );

  const loadMembers =
    useCallback(
      async (
        businessId: string,
        page = 1
      ) => {
        if (!businessId) {
          setMembers([]);
          return;
        }

        try {
          setLoadingMembers(true);
          setError("");

          const params =
            new URLSearchParams();

          params.set(
            "page",
            String(page)
          );

          params.set(
            "limit",
            String(MEMBERS_LIMIT)
          );

          if (
            memberSearch.trim()
          ) {
            params.set(
              "search",
              memberSearch.trim()
            );
          }

          if (
            memberRoleFilter !==
            "ALL"
          ) {
            params.set(
              "role",
              memberRoleFilter
            );
          }

          if (
            memberStatusFilter !==
            "ALL"
          ) {
            params.set(
              "status",
              memberStatusFilter
            );
          }

          const response =
            await apiRequest<MembersResponse>(
              `/staff/businesses/${businessId}/members?${params.toString()}`
            );

          const data =
            response?.data;

          setMembers(
            data?.members ?? []
          );

          setMemberMeta({
            total:
              data?.total ?? 0,
            page:
              data?.page ?? page,
            totalPages:
              data?.totalPages ?? 1,
            limit:
              data?.limit ??
              MEMBERS_LIMIT,
          });
        } catch (err) {
          if (
            err instanceof ApiError &&
            err.status === 401
          ) {
            window.location.replace(
              "/login"
            );
            return;
          }

          setError(
            getErrorMessage(err)
          );
        } finally {
          setLoadingMembers(
            false
          );
        }
      },
      [
        memberSearch,
        memberRoleFilter,
        memberStatusFilter,
      ]
    );

  const loadInvitations =
    useCallback(
      async (
        businessId: string,
        page = 1
      ) => {
        if (!businessId) {
          setInvitations([]);
          return;
        }

        try {
          setLoadingInvitations(
            true
          );
          setError("");

          const params =
            new URLSearchParams();

          params.set(
            "page",
            String(page)
          );

          params.set(
            "limit",
            String(
              INVITATIONS_LIMIT
            )
          );

          if (
            invitationStatusFilter !==
            "ALL"
          ) {
            params.set(
              "status",
              invitationStatusFilter
            );
          }

          const response =
            await apiRequest<InvitationsResponse>(
              `/staff/businesses/${businessId}/invitations?${params.toString()}`
            );

          const data =
            response?.data;

          setInvitations(
            data?.invitations ?? []
          );

          setInvitationMeta({
            total:
              data?.total ?? 0,
            page:
              data?.page ?? page,
            totalPages:
              data?.totalPages ?? 1,
            limit:
              data?.limit ??
              INVITATIONS_LIMIT,
          });
        } catch (err) {
          if (
            err instanceof ApiError &&
            err.status === 401
          ) {
            window.location.replace(
              "/login"
            );
            return;
          }

          setError(
            getErrorMessage(err)
          );
        } finally {
          setLoadingInvitations(
            false
          );
        }
      },
      [invitationStatusFilter]
    );

  useEffect(() => {
    void loadBusinesses();
  }, [loadBusinesses]);

  useEffect(() => {
    if (!selectedBusinessId) {
      setMembers([]);
      setInvitations([]);
      setMemberMeta({
        total: 0,
        page: 1,
        totalPages: 1,
        limit: MEMBERS_LIMIT,
      });
      setInvitationMeta({
        total: 0,
        page: 1,
        totalPages: 1,
        limit: INVITATIONS_LIMIT,
      });
      setLoadingMembers(false);
      setLoadingInvitations(false);
      return;
    }

    void loadMembers(
      selectedBusinessId,
      1
    );

    void loadInvitations(
      selectedBusinessId,
      1
    );
  }, [selectedBusinessId]);

  /*
   * Search uses a small debounce so typing doesn't generate a request per
   * keystroke.
   */
  useEffect(() => {
    if (!selectedBusinessId) {
      memberFilterInitializedRef.current =
        false;
      return;
    }

    if (
      !memberFilterInitializedRef.current
    ) {
      memberFilterInitializedRef.current =
        true;
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          void loadMembers(
            selectedBusinessId,
            1
          );
        },
        300
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [
    memberSearch,
    memberRoleFilter,
    memberStatusFilter,
    selectedBusinessId,
    loadMembers,
  ]);

  useEffect(() => {
    if (!selectedBusinessId) {
      invitationFilterInitializedRef.current =
        false;
      return;
    }

    if (
      !invitationFilterInitializedRef.current
    ) {
      invitationFilterInitializedRef.current =
        true;
      return;
    }

    void loadInvitations(
      selectedBusinessId,
      1
    );
  }, [
    invitationStatusFilter,
    selectedBusinessId,
    loadInvitations,
  ]);

  async function refreshAll() {
    if (!selectedBusinessId) {
      return;
    }

    try {
      setRefreshing(true);
      setError("");
      await Promise.all([
        loadMembers(
          selectedBusinessId,
          memberMeta.page
        ),
        loadInvitations(
          selectedBusinessId,
          invitationMeta.page
        ),
      ]);

      setSuccess(
        "Team data refreshed."
      );

      window.setTimeout(
        () => setSuccess(""),
        2000
      );
    } finally {
      setRefreshing(false);
    }
  }

  function chooseBusiness(
    businessId: string
  ) {
    setSelectedBusinessId(
      businessId
    );
    setBusinessMenuOpen(false);
    setOpenMemberMenuId("");
    setOpenInvitationMenuId("");

    if (
      typeof window !==
      "undefined"
    ) {
      localStorage.setItem(
        BUSINESS_STORAGE_KEY,
        businessId
      );
    }
  }

  async function inviteMember() {
    if (
      !selectedBusinessId ||
      !canManage
    ) {
      return;
    }

    const email =
      inviteEmail
        .trim()
        .toLowerCase();

    if (!email) {
      setError(
        "Enter an email address."
      );
      return;
    }

    try {
      setSubmittingInvite(true);
      setError("");

      const response =
        await apiRequest<BasicResponse>(
          `/staff/businesses/${selectedBusinessId}/invitations`,
          {
            method: "POST",
            body: JSON.stringify({
              email,
              role: inviteRole,
            }),
          }
        );

      setInviteEmail("");
      setInviteRole("STAFF");
      setInviteOpen(false);

      await loadInvitations(
        selectedBusinessId,
        1
      );

      setSuccess(
        response?.message ??
          "Invitation created successfully."
      );

      window.setTimeout(
        () => setSuccess(""),
        2500
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setSubmittingInvite(false);
    }
  }

  function askAction(
    action: NonNullable<
      typeof confirmAction
    >
  ) {
    setConfirmAction(action);
    setOpenMemberMenuId("");
    setOpenInvitationMenuId("");
  }

  async function executeConfirmedAction() {
    if (
      !confirmAction ||
      !selectedBusinessId
    ) {
      return;
    }

    const action =
      confirmAction;

    try {
      setActionLoadingId(
        action.id
      );
      setError("");

      if (
        action.type ===
        "removeMember"
      ) {
        await apiRequest(
          `/staff/businesses/${selectedBusinessId}/members/${action.id}`,
          {
            method: "DELETE",
            body: JSON.stringify({}),
          }
        );

        await loadMembers(
          selectedBusinessId,
          memberMeta.page
        );
      }

      if (
        action.type ===
          "suspendMember" ||
        action.type ===
          "activateMember"
      ) {
        await apiRequest(
          `/staff/businesses/${selectedBusinessId}/members/${action.id}/status`,
          {
            method: "PATCH",
            body: JSON.stringify({
              status:
                action.type ===
                "suspendMember"
                  ? "SUSPENDED"
                  : "ACTIVE",
            }),
          }
        );

        await loadMembers(
          selectedBusinessId,
          memberMeta.page
        );
      }

      if (
        action.type ===
          "cancelInvitation"
      ) {
        await apiRequest(
          `/staff/businesses/${selectedBusinessId}/invitations/${action.id}/cancel`,
          {
            method: "POST",
          }
        );

        await loadInvitations(
          selectedBusinessId,
          invitationMeta.page
        );
      }

      if (
        action.type ===
          "resendInvitation"
      ) {
        await apiRequest(
          `/staff/businesses/${selectedBusinessId}/invitations/${action.id}/resend`,
          {
            method: "POST",
          }
        );

        await loadInvitations(
          selectedBusinessId,
          invitationMeta.page
        );
      }

      setSuccess(
        action.type ===
          "resendInvitation"
          ? "Invitation resent successfully."
          : "Action completed successfully."
      );

      window.setTimeout(
        () => setSuccess(""),
        2500
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setActionLoadingId("");
      setConfirmAction(null);
    }
  }

  async function changeMemberRole(
    member: Member,
    role: "MANAGER" | "STAFF"
  ) {
    if (
      !canManage ||
      member.role ===
        "OWNER" ||
      member.userId ===
        myMembership?.userId
    ) {
      return;
    }

    try {
      setActionLoadingId(
        member.id
      );
      setError("");
      setOpenMemberMenuId("");

      await apiRequest(
        `/staff/businesses/${selectedBusinessId}/members/${member.id}/role`,
        {
          method: "PATCH",
          body: JSON.stringify({
            role,
          }),
        }
      );

      await loadMembers(
        selectedBusinessId,
        memberMeta.page
      );

      setSuccess(
        "Member role updated successfully."
      );

      window.setTimeout(
        () => setSuccess(""),
        2000
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setActionLoadingId("");
    }
  }

  if (loadingBusinesses) {
    return (
      <StaffSkeleton />
    );
  }

  if (!selectedBusiness) {
    return (
      <main className="space-y-7">
        <section className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Users className="h-8 w-8 text-slate-500" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Staff access starts with a business
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Create a business before adding team members and managing workspace access.
          </p>

          <a
            href="/dashboard/business"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
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
      onClick={() => {
        setOpenMemberMenuId("");
        setOpenInvitationMenuId("");
      }}
    >
      {/* HEADER */}
      <section
        className="relative overflow-visible rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-100/50 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-violet-600">
              <Users className="h-3.5 w-3.5" />
              Team & access
            </div>

            <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              Staff & Access
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage workspace members, invitations and access status from one secure place.
            </p>

            <div className="relative mt-5">
              <button
                type="button"
                onClick={() =>
                  setBusinessMenuOpen(
                    (open) => !open
                  )
                }
                className="inline-flex max-w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-[10px] font-black text-white">
                  {initials(
                    selectedBusiness.name
                  )}
                </span>

                <span className="max-w-[240px] truncate">
                  {selectedBusiness.name}
                </span>

                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {businessMenuOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-[320px] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                  <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Select workspace
                  </p>

                  <div className="max-h-64 overflow-y-auto">
                    {businesses.map(
                      (business) => (
                        <button
                          key={business.id}
                          type="button"
                          onClick={() =>
                            chooseBusiness(
                              business.id
                            )
                          }
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                            business.id ===
                            selectedBusinessId
                              ? "bg-slate-950 text-white"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-700">
                            {initials(
                              business.name
                            )}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">
                              {business.name}
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.12em] opacity-50">
                              {business.status ??
                                "ACTIVE"}
                            </span>
                          </span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                void refreshAll()
              }
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            {canManage && (
              <button
                type="button"
                onClick={() =>
                  setInviteOpen(true)
                }
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Invite member
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ALERTS */}
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

      {/* SUMMARY */}
      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Team members"
          value={memberMeta.total}
          helper={`${activeMemberCount} active on this page`}
          icon={
            <Users className="h-5 w-5" />
          }
          tone="violet"
          loading={loadingMembers}
        />

        <SummaryCard
          label="Pending invitations"
          value={pendingInvitationCount}
          helper="Active invitations"
          icon={
            <Mail className="h-5 w-5" />
          }
          tone="blue"
          loading={loadingInvitations}
        />

        <SummaryCard
          label="Your role"
          value={roleLabel(
            actorRole
          )}
          helper={
            canManage
              ? "Team administration available"
              : "Limited team access"
          }
          icon={
            <ShieldCheck className="h-5 w-5" />
          }
          tone="green"
          loading={loadingMembers}
        />
      </section>

      {/* SECURITY STRIP */}
      <section className="rounded-[22px] border border-emerald-100 bg-emerald-50/60 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

          <div>
            <p className="text-sm font-bold text-emerald-950">
              Access is enforced by the TapQR backend
            </p>

            <p className="mt-1 text-xs leading-5 text-emerald-900/70">
              This interface reflects the permissions returned by the workspace APIs. Backend authorization remains the source of truth.
            </p>
          </div>
        </div>
      </section>

      {/* TABS / FILTER TOOLBAR */}
      <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between sm:px-6">
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() =>
                setTab("members")
              }
              className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                tab === "members"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Members
              <span className="ml-2 text-[10px] opacity-50">
                {memberMeta.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setTab("invitations")
              }
              className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                tab === "invitations"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Invitations
              <span className="ml-2 text-[10px] opacity-50">
                {invitationMeta.total}
              </span>
            </button>
          </div>

          {tab === "members" ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative block min-w-0 sm:w-[270px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={memberSearch}
                  onChange={(event) =>
                    setMemberSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search members..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                />
              </label>

              <Select
                value={
                  memberRoleFilter
                }
                onChange={(value) =>
                  setMemberRoleFilter(
                    value as RoleFilter
                  )
                }
                options={[
                  ["ALL", "All roles"],
                  ["OWNER", "Owner"],
                  ["MANAGER", "Manager"],
                  ["STAFF", "Staff"],
                ]}
              />

              <Select
                value={
                  memberStatusFilter
                }
                onChange={(value) =>
                  setMemberStatusFilter(
                    value as StatusFilter
                  )
                }
                options={[
                  ["ALL", "All status"],
                  ["ACTIVE", "Active"],
                  ["SUSPENDED", "Suspended"],
                  ["REMOVED", "Removed"],
                ]}
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["PENDING", "Pending"],
                  ["ALL", "All"],
                  ["EXPIRED", "Expired"],
                  ["ACCEPTED", "Accepted"],
                  ["REJECTED", "Revoked"],
                ] as Array<
                  [
                    "ALL" | InvitationStatus,
                    string
                  ]
                >
              ).map(
                ([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setInvitationStatusFilter(
                        value
                      )
                    }
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-bold transition ${
                      invitationStatusFilter ===
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
          )}
        </div>

        {/* MEMBERS */}
        {tab === "members" && (
          <>
            {loadingMembers ? (
              <MembersLoading />
            ) : visibleMembers.length ===
              0 ? (
              <EmptyState
                icon={
                  <Users className="h-6 w-6" />
                }
                title="No members found"
                description={
                  memberSearch ||
                  memberRoleFilter !==
                    "ALL" ||
                  memberStatusFilter !==
                    "ALL"
                    ? "Try changing your search or filters."
                    : "Invite your first teammate to start collaborating."
                }
                action={
                  canManage
                    ? {
                        label:
                          "Invite member",
                        onClick: () =>
                          setInviteOpen(
                            true
                          ),
                      }
                    : undefined
                }
              />
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[760px] text-left">
                    <thead className="border-b border-slate-100 bg-slate-50/70">
                      <tr>
                        {[
                          "Member",
                          "Role",
                          "Status",
                          "Joined",
                          "Actions",
                        ].map(
                          (heading) => (
                            <th
                              key={
                                heading
                              }
                              className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400"
                            >
                              {
                                heading
                              }
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {visibleMembers.map(
                        (member) => (
                          <MemberRow
                            key={
                              member.id
                            }
                            member={
                              member
                            }
                            canManage={
                              canManage
                            }
                            actorRole={
                              actorRole
                            }
                            actorUserId={
                              myMembership?.userId
                            }
                            menuOpen={
                              openMemberMenuId ===
                              member.id
                            }
                            actionLoading={
                              actionLoadingId ===
                              member.id
                            }
                            onMenu={() =>
                              setOpenMemberMenuId(
                                openMemberMenuId ===
                                  member.id
                                  ? ""
                                  : member.id
                              )
                            }
                            onRoleChange={(
                              role
                            ) =>
                              void changeMemberRole(
                                member,
                                role
                              )
                            }
                            onSuspend={() =>
                              askAction({
                                type:
                                  "suspendMember",
                                id:
                                  member.id,
                                title:
                                  "Suspend this member?",
                                description:
                                  `They will lose active workspace access until reactivated.`,
                                destructive:
                                  true,
                              })
                            }
                            onActivate={() =>
                              askAction({
                                type:
                                  "activateMember",
                                id:
                                  member.id,
                                title:
                                  "Reactivate this member?",
                                description:
                                  "They will regain active access to this business.",
                              })
                            }
                            onRemove={() =>
                              askAction({
                                type:
                                  "removeMember",
                                id:
                                  member.id,
                                title:
                                  "Remove this member?",
                                description:
                                  "Their membership will be soft-removed and historical membership data will be preserved.",
                                destructive:
                                  true,
                              })
                            }
                          />
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-slate-100 md:hidden">
                  {visibleMembers.map(
                    (member) => (
                      <MemberMobileRow
                        key={
                          member.id
                        }
                        member={
                          member
                        }
                        canManage={
                          canManage
                        }
                        actorRole={
                          actorRole
                        }
                        actorUserId={
                          myMembership?.userId
                        }
                        menuOpen={
                          openMemberMenuId ===
                          member.id
                        }
                        actionLoading={
                          actionLoadingId ===
                          member.id
                        }
                        onMenu={() =>
                          setOpenMemberMenuId(
                            openMemberMenuId ===
                              member.id
                              ? ""
                              : member.id
                          )
                        }
                        onRoleChange={(
                          role
                        ) =>
                          void changeMemberRole(
                            member,
                            role
                          )
                        }
                        onSuspend={() =>
                          askAction({
                            type:
                              "suspendMember",
                            id:
                              member.id,
                            title:
                              "Suspend this member?",
                            description:
                              "They will lose active workspace access until reactivated.",
                            destructive:
                              true,
                          })
                        }
                        onActivate={() =>
                          askAction({
                            type:
                              "activateMember",
                            id:
                              member.id,
                            title:
                              "Reactivate this member?",
                            description:
                              "They will regain active access to this business.",
                          })
                        }
                        onRemove={() =>
                          askAction({
                            type:
                              "removeMember",
                            id:
                              member.id,
                            title:
                              "Remove this member?",
                            description:
                              "Their membership will be soft-removed and historical membership data will be preserved.",
                            destructive:
                              true,
                          })
                        }
                      />
                    )
                  )}
                </div>

                <Pagination
                  page={
                    memberMeta.page
                  }
                  totalPages={
                    memberMeta.totalPages
                  }
                  total={
                    memberMeta.total
                  }
                  label="members"
                  onPrevious={() =>
                    void loadMembers(
                      selectedBusinessId,
                      memberMeta.page -
                        1
                    )
                  }
                  onNext={() =>
                    void loadMembers(
                      selectedBusinessId,
                      memberMeta.page +
                        1
                    )
                  }
                />
              </>
            )}
          </>
        )}

        {/* INVITATIONS */}
        {tab ===
          "invitations" && (
          <>
            {loadingInvitations ? (
              <InvitationsLoading />
            ) : invitations.length ===
              0 ? (
              <EmptyState
                icon={
                  <Mail className="h-6 w-6" />
                }
                title="No invitations found"
                description="Pending and historical invitations will appear here."
                action={
                  canManage
                    ? {
                        label:
                          "Invite member",
                        onClick: () =>
                          setInviteOpen(
                            true
                          ),
                      }
                    : undefined
                }
              />
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[780px] text-left">
                    <thead className="border-b border-slate-100 bg-slate-50/70">
                      <tr>
                        {[
                          "Invitee",
                          "Role",
                          "Status",
                          "Expires",
                          "Invited",
                          "Actions",
                        ].map(
                          (heading) => (
                            <th
                              key={
                                heading
                              }
                              className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400"
                            >
                              {
                                heading
                              }
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {invitations.map(
                        (
                          invitation
                        ) => (
                          <InvitationRow
                            key={
                              invitation.id
                            }
                            invitation={
                              invitation
                            }
                            canManage={
                              canManage
                            }
                            canManageManagerInvite={
                              canInviteManager
                            }
                            menuOpen={
                              openInvitationMenuId ===
                              invitation.id
                            }
                            actionLoading={
                              actionLoadingId ===
                              invitation.id
                            }
                            onMenu={() =>
                              setOpenInvitationMenuId(
                                openInvitationMenuId ===
                                  invitation.id
                                  ? ""
                                  : invitation.id
                              )
                            }
                            onResend={() =>
                              askAction({
                                type:
                                  "resendInvitation",
                                id:
                                  invitation.id,
                                title:
                                  "Resend this invitation?",
                                description:
                                  "The existing invitation will be replaced with a fresh invitation.",
                              })
                            }
                            onCancel={() =>
                              askAction({
                                type:
                                  "cancelInvitation",
                                id:
                                  invitation.id,
                                title:
                                  "Revoke this invitation?",
                                description:
                                  "The pending invitation will no longer be usable.",
                                destructive:
                                  true,
                              })
                            }
                          />
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-slate-100 md:hidden">
                  {invitations.map(
                    (
                      invitation
                    ) => (
                      <InvitationMobileRow
                        key={
                          invitation.id
                        }
                        invitation={
                          invitation
                        }
                        canManage={
                          canManage
                        }
                        canManageManagerInvite={
                          canInviteManager
                        }
                        menuOpen={
                          openInvitationMenuId ===
                          invitation.id
                        }
                        actionLoading={
                          actionLoadingId ===
                          invitation.id
                        }
                        onMenu={() =>
                          setOpenInvitationMenuId(
                            openInvitationMenuId ===
                              invitation.id
                              ? ""
                              : invitation.id
                          )
                        }
                        onResend={() =>
                          askAction({
                            type:
                              "resendInvitation",
                            id:
                              invitation.id,
                            title:
                              "Resend this invitation?",
                            description:
                              "The existing invitation will be replaced with a fresh invitation.",
                          })
                        }
                        onCancel={() =>
                          askAction({
                            type:
                              "cancelInvitation",
                            id:
                              invitation.id,
                            title:
                              "Revoke this invitation?",
                            description:
                              "The pending invitation will no longer be usable.",
                            destructive:
                              true,
                          })
                        }
                      />
                    )
                  )}
                </div>

                <Pagination
                  page={
                    invitationMeta.page
                  }
                  totalPages={
                    invitationMeta.totalPages
                  }
                  total={
                    invitationMeta.total
                  }
                  label="invitations"
                  onPrevious={() =>
                    void loadInvitations(
                      selectedBusinessId,
                      invitationMeta.page -
                        1
                    )
                  }
                  onNext={() =>
                    void loadInvitations(
                      selectedBusinessId,
                      invitationMeta.page +
                        1
                    )
                  }
                />
              </>
            )}
          </>
        )}
      </section>

      {/* PERMISSIONS */}
      <section className="rounded-[24px] border border-blue-100 bg-blue-50/60 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

          <div>
            <h2 className="text-sm font-bold text-blue-950">
              Workspace permissions
            </h2>

            <div className="mt-3 grid gap-2 text-xs text-blue-900/75 sm:grid-cols-2">
              <p>
                <strong className="text-blue-950">
                  Owner
                </strong>{" "}
                can manage managers, staff and invitations.
              </p>

              <p>
                <strong className="text-blue-950">
                  Manager
                </strong>{" "}
                can manage staff, subject to backend authorization.
              </p>

              <p>
                <strong className="text-blue-950">
                  Staff
                </strong>{" "}
                cannot administer team access.
              </p>

              <p>
                Owners cannot be modified through these staff endpoints.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INVITE MODAL */}
      {inviteOpen && (
        <Modal
          title="Invite a team member"
          description="Send a secure workspace invitation to a teammate."
          onClose={() => {
            if (!submittingInvite) {
              setInviteOpen(false);
            }
          }}
        >
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                Email address
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={inviteEmail}
                  onChange={(event) =>
                    setInviteEmail(
                      event.target.value
                    )
                  }
                  type="email"
                  autoComplete="email"
                  placeholder="teammate@company.com"
                  disabled={
                    submittingInvite
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-500/10 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                Workspace role
              </label>

              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    ["STAFF", "Staff"],
                    ["MANAGER", "Manager"],
                  ] as Array<
                    [
                      "STAFF" | "MANAGER",
                      string
                    ]
                  >
                ).map(
                  ([value, label]) => {
                    const disabled =
                      value ===
                      "MANAGER" &&
                      !canInviteManager;

                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={
                          disabled ||
                          submittingInvite
                        }
                        onClick={() =>
                          setInviteRole(
                            value
                          )
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          inviteRole ===
                          value
                            ? "border-slate-950 bg-slate-950 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        } ${
                          disabled
                            ? "cursor-not-allowed opacity-40"
                            : ""
                        }`}
                      >
                        <p className="text-sm font-bold">
                          {label}
                        </p>

                        <p
                          className={`mt-1 text-xs ${
                            inviteRole ===
                            value
                              ? "text-white/60"
                              : "text-slate-400"
                          }`}
                        >
                          {value ===
                          "MANAGER"
                            ? "Team-level administration"
                            : "Operational workspace access"}
                        </p>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-700">
                Invitation expiry
              </p>
              <p className="mt-1 text-[11px] leading-5 text-slate-400">
                TapQR invitations expire automatically after the configured invitation lifetime.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setInviteOpen(
                    false
                  )
                }
                disabled={
                  submittingInvite
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  void inviteMember()
                }
                disabled={
                  submittingInvite ||
                  !inviteEmail.trim()
                }
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submittingInvite ? (
                  <LoaderDot />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {submittingInvite
                  ? "Sending..."
                  : "Send invitation"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM MODAL */}
      {confirmAction && (
        <Modal
          title={
            confirmAction.title
          }
          description={
            confirmAction.description
          }
          onClose={() => {
            if (
              !actionLoadingId
            ) {
              setConfirmAction(
                null
              );
            }
          }}
        >
          <div className="flex items-center justify-end gap-2">
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
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() =>
                void executeConfirmedAction()
              }
              disabled={
                !!actionLoadingId
              }
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white ${
                confirmAction.destructive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-slate-950 hover:bg-slate-800"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {actionLoadingId ? (
                <LoaderDot />
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
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function SummaryCard({
  label,
  value,
  helper,
  icon,
  tone,
  loading,
}: {
  label: string;
  value: number | string;
  helper: string;
  icon: React.ReactNode;
  tone:
    | "blue"
    | "violet"
    | "green";
  loading?: boolean;
}) {
  const classes = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    green: "bg-emerald-50 text-emerald-600",
  };

  return (
    <article className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
      {loading ? (
        <div className="animate-pulse">
          <div className="flex justify-between">
            <div className="h-3 w-24 rounded bg-slate-100" />
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
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${classes[tone]}`}
            >
              {icon}
            </div>
          </div>

          <p className="mt-4 truncate text-3xl font-bold tracking-tight text-slate-950">
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
        className="h-10 min-w-[130px] appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-xs font-semibold text-slate-700 outline-none transition hover:bg-slate-50 focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10"
      >
        {options.map(
          ([optionValue, label]) => (
            <option
              key={optionValue}
              value={
                optionValue
              }
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

function MemberRow({
  member,
  canManage,
  actorRole,
  actorUserId,
  menuOpen,
  actionLoading,
  onMenu,
  onRoleChange,
  onSuspend,
  onActivate,
  onRemove,
}: {
  member: Member;
  canManage: boolean;
  actorRole: MemberRole;
  actorUserId?: string;
  menuOpen: boolean;
  actionLoading: boolean;
  onMenu: () => void;
  onRoleChange: (
    role: "MANAGER" | "STAFF"
  ) => void;
  onSuspend: () => void;
  onActivate: () => void;
  onRemove: () => void;
}) {
  const isSelf =
    actorUserId ===
    member.userId;

  const canModify =
    canManage &&
    !isSelf &&
    member.role !==
      "OWNER" &&
    member.status !==
      "REMOVED" &&
    !(
      actorRole ===
        "MANAGER" &&
      member.role ===
        "MANAGER"
    );

  return (
    <tr className="transition hover:bg-slate-50/60">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">
            {initials(
              member.user
                ?.fullName
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              {member.user
                ?.fullName ||
                "Unnamed user"}
            </p>

            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">
                {member.user
                  ?.email ||
                  member.user
                    ?.phone ||
                  "No contact information"}
              </span>
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <RoleBadge
          role={member.role}
        />
      </td>

      <td className="px-6 py-4">
        <StatusBadge
          status={member.status}
        />
      </td>

      <td className="px-6 py-4 text-xs text-slate-500">
        {formatDate(
          member.joinedAt ??
            member.createdAt
        )}
      </td>

      <td className="px-6 py-4">
        {actionLoading ? (
          <LoaderDot />
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onMenu();
              }}
              disabled={!canModify}
              aria-label="Member actions"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {menuOpen &&
              canModify && (
                <MemberActionMenu
                  member={
                    member
                  }
                  onRoleChange={
                    onRoleChange
                  }
                  onSuspend={
                    onSuspend
                  }
                  onActivate={
                    onActivate
                  }
                  onRemove={
                    onRemove
                  }
                />
              )}
          </div>
        )}
      </td>
    </tr>
  );
}

function MemberMobileRow({
  member,
  canManage,
  actorRole,
  actorUserId,
  menuOpen,
  actionLoading,
  onMenu,
  onRoleChange,
  onSuspend,
  onActivate,
  onRemove,
}: {
  member: Member;
  canManage: boolean;
  actorRole: MemberRole;
  actorUserId?: string;
  menuOpen: boolean;
  actionLoading: boolean;
  onMenu: () => void;
  onRoleChange: (
    role: "MANAGER" | "STAFF"
  ) => void;
  onSuspend: () => void;
  onActivate: () => void;
  onRemove: () => void;
}) {
  const isSelf =
    actorUserId ===
    member.userId;

  const canModify =
    canManage &&
    !isSelf &&
    member.role !==
      "OWNER" &&
    member.status !==
      "REMOVED" &&
    !(
      actorRole ===
        "MANAGER" &&
      member.role ===
        "MANAGER"
    );

  return (
    <div className="p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">
          {initials(
            member.user
              ?.fullName
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {member.user
                  ?.fullName ||
                  "Unnamed user"}
              </p>

              <p className="mt-0.5 truncate text-[11px] text-slate-400">
                {member.user
                  ?.email ||
                  member.user
                    ?.phone ||
                  "No contact information"}
              </p>
            </div>

            {actionLoading ? (
              <LoaderDot />
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onMenu();
                  }}
                  disabled={
                    !canModify
                  }
                  className="rounded-lg p-2 text-slate-400 disabled:opacity-30"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>

                {menuOpen &&
                  canModify && (
                    <MemberActionMenu
                      mobile
                      member={
                        member
                      }
                      onRoleChange={
                        onRoleChange
                      }
                      onSuspend={
                        onSuspend
                      }
                      onActivate={
                        onActivate
                      }
                      onRemove={
                        onRemove
                      }
                    />
                  )}
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <RoleBadge
              role={member.role}
            />
            <StatusBadge
              status={member.status}
            />
          </div>

          <p className="mt-3 text-[10px] text-slate-400">
            Joined{" "}
            {formatDate(
              member.joinedAt ??
                member.createdAt
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function MemberActionMenu({
  member,
  onRoleChange,
  onSuspend,
  onActivate,
  onRemove,
  mobile = false,
}: {
  member: Member;
  onRoleChange: (
    role: "MANAGER" | "STAFF"
  ) => void;
  onSuspend: () => void;
  onActivate: () => void;
  onRemove: () => void;
  mobile?: boolean;
}) {
  return (
    <div
      onClick={(event) =>
        event.stopPropagation()
      }
      className={`absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl ${
        mobile
          ? "top-full"
          : ""
      }`}
    >
      <p className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
        Change role
      </p>

      <button
        type="button"
        onClick={() =>
          onRoleChange(
            "STAFF"
          )
        }
        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        Staff
        {member.role ===
          "STAFF" && (
          <Check className="h-4 w-4 text-blue-600" />
        )}
      </button>

      <button
        type="button"
        onClick={() =>
          onRoleChange(
            "MANAGER"
          )
        }
        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        Manager
        {member.role ===
          "MANAGER" && (
          <Check className="h-4 w-4 text-blue-600" />
        )}
      </button>

      <div className="my-1 border-t border-slate-100" />

      {member.status ===
      "SUSPENDED" ? (
        <button
          type="button"
          onClick={onActivate}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
        >
          <UserCheck className="h-4 w-4" />
          Reactivate
        </button>
      ) : (
        <button
          type="button"
          onClick={onSuspend}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-amber-700 hover:bg-amber-50"
        >
          <UserMinus className="h-4 w-4" />
          Suspend access
        </button>
      )}

      <button
        type="button"
        onClick={onRemove}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
      >
        <UserMinus className="h-4 w-4" />
        Remove member
      </button>
    </div>
  );
}

function InvitationRow({
  invitation,
  canManage,
  canManageManagerInvite,
  menuOpen,
  actionLoading,
  onMenu,
  onResend,
  onCancel,
}: {
  invitation: Invitation;
  canManage: boolean;
  canManageManagerInvite: boolean;
  menuOpen: boolean;
  actionLoading: boolean;
  onMenu: () => void;
  onResend: () => void;
  onCancel: () => void;
}) {
  const days =
    daysUntil(
      invitation.expiresAt
    );

  const expiredByTime =
    days < 0 &&
    invitation.status ===
      "PENDING";

  const canOperate =
    canManage &&
    !(
      invitation.role ===
        "MANAGER" &&
      !canManageManagerInvite
    );

  return (
    <tr className="transition hover:bg-slate-50/60">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Mail className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              {invitation.email}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              Invited{" "}
              {formatDate(
                invitation.createdAt
              )}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <RoleBadge
          role={invitation.role}
        />
      </td>

      <td className="px-6 py-4">
        <InvitationStatusBadge
          status={
            expiredByTime
              ? "EXPIRED"
              : invitation.status
          }
        />
      </td>

      <td className="px-6 py-4">
        <div className="text-xs text-slate-500">
          {formatDate(
            invitation.expiresAt
          )}
        </div>

        {invitation.status ===
          "PENDING" &&
          !expiredByTime && (
            <div
              className={`mt-1 text-[10px] font-semibold ${
                days <= 2
                  ? "text-amber-600"
                  : "text-slate-400"
              }`}
            >
              {days === 0
                ? "Expires today"
                : `${days} days left`}
            </div>
          )}
      </td>

      <td className="px-6 py-4 text-xs text-slate-500">
        {formatDate(
          invitation.createdAt
        )}
      </td>

      <td className="px-6 py-4">
        {actionLoading ? (
          <LoaderDot />
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onMenu();
              }}
              disabled={!canOperate}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Invitation actions"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {menuOpen &&
              canOperate && (
                <InvitationActionMenu
                  invitation={
                    invitation
                  }
                  onResend={
                    onResend
                  }
                  onCancel={
                    onCancel
                  }
                />
              )}
          </div>
        )}
      </td>
    </tr>
  );
}

function InvitationMobileRow({
  invitation,
  canManage,
  canManageManagerInvite,
  menuOpen,
  actionLoading,
  onMenu,
  onResend,
  onCancel,
}: {
  invitation: Invitation;
  canManage: boolean;
  canManageManagerInvite: boolean;
  menuOpen: boolean;
  actionLoading: boolean;
  onMenu: () => void;
  onResend: () => void;
  onCancel: () => void;
}) {
  const days =
    daysUntil(
      invitation.expiresAt
    );

  const expiredByTime =
    days < 0 &&
    invitation.status ===
      "PENDING";

  const canOperate =
    canManage &&
    !(
      invitation.role ===
        "MANAGER" &&
      !canManageManagerInvite
    );

  return (
    <div className="p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Mail className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {invitation.email}
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                Invited{" "}
                {formatDate(
                  invitation.createdAt
                )}
              </p>
            </div>

            {actionLoading ? (
              <LoaderDot />
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onMenu();
                  }}
                  disabled={
                    !canOperate
                  }
                  className="rounded-lg p-2 text-slate-400 disabled:opacity-30"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>

                {menuOpen &&
                  canOperate && (
                    <InvitationActionMenu
                      invitation={
                        invitation
                      }
                      onResend={
                        onResend
                      }
                      onCancel={
                        onCancel
                      }
                      mobile
                    />
                  )}
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <RoleBadge
              role={invitation.role}
            />

            <InvitationStatusBadge
              status={
                expiredByTime
                  ? "EXPIRED"
                  : invitation.status
              }
            />
          </div>

          <p className="mt-3 text-[10px] text-slate-400">
            Expires{" "}
            {formatDateTime(
              invitation.expiresAt
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function InvitationActionMenu({
  invitation,
  onResend,
  onCancel,
  mobile = false,
}: {
  invitation: Invitation;
  onResend: () => void;
  onCancel: () => void;
  mobile?: boolean;
}) {
  const resendable =
    invitation.status ===
      "PENDING" ||
    invitation.status ===
      "EXPIRED";

  const cancellable =
    invitation.status ===
    "PENDING";

  return (
    <div
      onClick={(event) =>
        event.stopPropagation()
      }
      className={`absolute right-0 z-40 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl ${
        mobile
          ? "top-full"
          : ""
      }`}
    >
      {resendable && (
        <button
          type="button"
          onClick={onResend}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Resend invitation
        </button>
      )}

      {cancellable && (
        <button
          type="button"
          onClick={onCancel}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
        >
          <X className="h-4 w-4" />
          Revoke invitation
        </button>
      )}
    </div>
  );
}

function RoleBadge({
  role,
}: {
  role: MemberRole;
}) {
  const classes = {
    OWNER:
      "bg-blue-50 text-blue-700",
    MANAGER:
      "bg-violet-50 text-violet-700",
    STAFF:
      "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
        classes[role]
      }`}
    >
      {roleLabel(role)}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: MemberStatus;
}) {
  const classes = {
    ACTIVE:
      "bg-emerald-50 text-emerald-700",
    SUSPENDED:
      "bg-amber-50 text-amber-700",
    REMOVED:
      "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
        classes[status]
      }`}
    >
      {statusLabel(status)}
    </span>
  );
}

function InvitationStatusBadge({
  status,
}: {
  status: InvitationStatus;
}) {
  const classes = {
    PENDING:
      "bg-amber-50 text-amber-700",
    ACCEPTED:
      "bg-emerald-50 text-emerald-700",
    REJECTED:
      "bg-slate-100 text-slate-600",
    EXPIRED:
      "bg-red-50 text-red-700",
  };

  const label =
    status === "REJECTED"
      ? "Revoked"
      : statusLabel(
          status
        );

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
        classes[status]
      }`}
    >
      {status ===
        "PENDING" && (
        <Clock3 className="h-3 w-3" />
      )}
      {label}
    </span>
  );
}

function Pagination({
  page,
  totalPages,
  total,
  label,
  onPrevious,
  onNext,
}: {
  page: number;
  totalPages: number;
  total: number;
  label: string;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 sm:px-6">
      <p className="text-[10px] text-slate-400">
        Page {page} of{" "}
        {Math.max(
          totalPages,
          1
        )} · {total} {label}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={
            onPrevious
          }
          disabled={
            page <= 1
          }
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
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
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-900">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-400">
        {description}
      </p>

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          {action.label}
        </button>
      )}
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
        <CheckCircleIcon />
      ) : (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      )}

      <span className="min-w-0 flex-1">
        {message}
      </span>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="rounded-lg p-1 opacity-70 hover:bg-black/5 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-500">
      <Check className="h-3 w-3" />
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
        className="w-full max-w-lg overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={title}
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
            aria-label="Close"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800"
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

function MembersLoading() {
  return (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="flex items-center gap-4 px-5 py-5 sm:px-6"
          >
            <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />

            <div className="flex-1">
              <div className="h-3 w-36 animate-pulse rounded bg-slate-100" />
              <div className="mt-2 h-2.5 w-52 animate-pulse rounded bg-slate-100" />
            </div>

            <div className="hidden h-6 w-16 animate-pulse rounded-full bg-slate-100 sm:block" />
          </div>
        )
      )}
    </div>
  );
}

function InvitationsLoading() {
  return (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="flex items-center gap-4 px-5 py-5 sm:px-6"
          >
            <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />

            <div className="flex-1">
              <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />
              <div className="mt-2 h-2.5 w-28 animate-pulse rounded bg-slate-100" />
            </div>

            <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
          </div>
        )
      )}
    </div>
  );
}

function LoaderDot() {
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

function StaffSkeleton() {
  return (
    <main className="space-y-7">
      <div className="h-48 animate-pulse rounded-[28px] bg-white" />

      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-[22px] bg-white"
            />
          )
        )}
      </div>

      <div className="h-20 animate-pulse rounded-[22px] bg-white" />

      <div className="h-[520px] animate-pulse rounded-[24px] bg-white" />
    </main>
  );
}
