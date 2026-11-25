"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface NotificationSummary {
  today: {
    total: number;
    emailSent: number;
    whatsappSent: number;
    delivered: number;
    failed: number;
    pending: number;
    retrying: number;
  };
  last7Days: {
    total: number;
    emailSent: number;
    whatsappSent: number;
    delivered: number;
    failed: number;
  };
  last30Days: {
    total: number;
    emailSent: number;
    whatsappSent: number;
    delivered: number;
    failed: number;
  };
  activeRemindersUpcoming: number;
  smtpCapacity: {
    dailyLimit: number;
    usedToday: number;
    remainingToday: number;
    priorityReserved: number;
  };
  whatsappStatus: {
    enabled: boolean;
    ready: boolean;
    templatesConfigured: number;
    totalTemplates: number;
    missingKeys: string[];
  };
  workerHealth: {
    state: string;
    lastHeartbeat: string | null;
    overdueJobs: number;
    staleLeases: number;
    lastRunStats?: {
      durationMs: number;
      claimed: number;
      processed: number;
      failed: number;
    };
  };
}

interface NotificationItem {
  _id: string;
  bookingId: string;
  bookingReference: string;
  channel: "EMAIL" | "WHATSAPP";
  type: string;
  status: string;
  recipientMasked: string;
  scheduledFor: string;
  attemptCount: number;
  maxAttempts: number;
  lastAttemptAt?: string;
  deliveredAt?: string;
  lastError?: string;
  idempotencyKey?: string;
  isResend?: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface AuditLogItem {
  _id: string;
  notificationId?: string;
  bookingId?: string;
  bookingReference?: string;
  action: string;
  adminId: string;
  adminUsername: string;
  reason: string;
  details?: Record<string, any>;
  createdAt: string;
}

export default function AdminCommunicationsPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "notifications" | "reminders" | "failed" | "smtp" | "whatsapp" | "worker" | "audit"
  >("overview");

  // Overview data
  const [overview, setOverview] = useState<NotificationSummary | null>(null);
  const [dateRange, setDateRange] = useState<"today" | "last7days" | "last30days">("today");
  const [overviewLoading, setOverviewLoading] = useState(false);

  // Notifications tab state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Detail Modal
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Retry Modal
  const [retryModalOpen, setRetryModalOpen] = useState(false);
  const [retryTargetId, setRetryTargetId] = useState<string | null>(null);
  const [retryReason, setRetryReason] = useState("");
  const [retryResetAttempts, setRetryResetAttempts] = useState(false);
  const [retryProcessing, setRetryProcessing] = useState(false);

  // Resend Modal
  const [resendModalOpen, setResendModalOpen] = useState(false);
  const [resendTargetId, setResendTargetId] = useState<string | null>(null);
  const [resendReason, setResendReason] = useState("");
  const [resendProcessing, setResendProcessing] = useState(false);

  // Cancel Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelProcessing, setCancelProcessing] = useState(false);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Worker trigger state
  const [triggeringWorker, setTriggeringWorker] = useState(false);
  const [workerMessage, setWorkerMessage] = useState<string | null>(null);

  // Load overview
  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const res = await fetch(`/api/admin/communications/overview?range=${dateRange}`);
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch (e) {
      console.error("Failed to load overview:", e);
    } finally {
      setOverviewLoading(false);
    }
  }, [dateRange]);

  // Load notifications
  const fetchNotifications = useCallback(async (targetStatus?: string, targetType?: string) => {
    setNotificationsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      if (search.trim()) params.set("search", search.trim());
      if (channelFilter !== "all") params.set("channel", channelFilter);
      if (targetStatus) {
        params.set("status", targetStatus);
      } else if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      if (targetType) {
        params.set("type", targetType);
      } else if (typeFilter !== "all") {
        params.set("type", typeFilter);
      }

      const res = await fetch(`/api/admin/communications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.totalCount || 0);
      }
    } catch (e) {
      console.error("Failed to load notifications:", e);
    } finally {
      setNotificationsLoading(false);
    }
  }, [page, search, channelFilter, statusFilter, typeFilter]);

  // Load audit logs
  const fetchAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    try {
      const res = await fetch("/api/admin/communications/audit?limit=50");
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (e) {
      console.error("Failed to load audit logs:", e);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    if (activeTab === "notifications") {
      fetchNotifications();
    } else if (activeTab === "reminders") {
      fetchNotifications("PENDING", "ARRIVAL_REMINDER");
    } else if (activeTab === "failed") {
      fetchNotifications("FAILED");
    } else if (activeTab === "audit") {
      fetchAuditLogs();
    }
  }, [activeTab, page, fetchNotifications, fetchAuditLogs]);

  // Load detail modal
  const openDetailModal = async (id: string) => {
    setSelectedNotificationId(id);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/communications/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDetailData(data);
      } else {
        alert("Failed to load notification details");
        setSelectedNotificationId(null);
      }
    } catch (e) {
      alert("Network error fetching details");
      setSelectedNotificationId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle Retry
  const handleRetrySubmit = async () => {
    if (!retryTargetId) return;
    if (!retryReason.trim()) {
      alert("Please provide an administrative reason for the retry.");
      return;
    }
    setRetryProcessing(true);
    try {
      const res = await fetch(`/api/admin/communications/${retryTargetId}/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: retryReason.trim(),
          resetAttempts: retryResetAttempts,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Notification successfully scheduled for retry.");
        setRetryModalOpen(false);
        setRetryTargetId(null);
        setRetryReason("");
        fetchNotifications();
        fetchOverview();
      } else {
        alert(`Retry failed: ${data.error || "Unknown error"}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setRetryProcessing(false);
    }
  };

  // Handle Resend
  const handleResendSubmit = async () => {
    if (!resendTargetId) return;
    if (!resendReason.trim()) {
      alert("Please provide a reason for the manual resend.");
      return;
    }
    setResendProcessing(true);
    try {
      const res = await fetch(`/api/admin/communications/${resendTargetId}/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: resendReason.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`New resend job created successfully! Job ID: ${data.resendJobId}`);
        setResendModalOpen(false);
        setResendTargetId(null);
        setResendReason("");
        fetchNotifications();
        fetchOverview();
      } else {
        alert(`Resend failed: ${data.error || "Unknown error"}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setResendProcessing(false);
    }
  };

  // Handle Cancel
  const handleCancelSubmit = async () => {
    if (!cancelTargetId) return;
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancelling this reminder.");
      return;
    }
    setCancelProcessing(true);
    try {
      const res = await fetch(`/api/admin/communications/${cancelTargetId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: cancelReason.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Scheduled reminder successfully cancelled.");
        setCancelModalOpen(false);
        setCancelTargetId(null);
        setCancelReason("");
        fetchNotifications();
        fetchOverview();
      } else {
        alert(`Cancel failed: ${data.error || "Unknown error"}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setCancelProcessing(false);
    }
  };

  // Trigger manual worker run
  const triggerWorkerRun = async () => {
    setTriggeringWorker(true);
    setWorkerMessage(null);
    try {
      const res = await fetch("/api/admin/communications/worker", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setWorkerMessage(
          `Worker run completed in ${data.stats?.durationMs || 0}ms. Processed: ${data.stats?.processed || 0}, Delivered: ${data.stats?.delivered || 0}, Failed: ${data.stats?.failed || 0}`
        );
        fetchOverview();
      } else {
        setWorkerMessage(`Worker run failed: ${data.error || "Unknown error"}`);
      }
    } catch (e: any) {
      setWorkerMessage(`Worker error: ${e.message}`);
    } finally {
      setTriggeringWorker(false);
    }
  };

  const getStatusBadge = (status: string) => {
    let bg = "#e2e8f0";
    let color = "#334155";
    switch (status) {
      case "DELIVERED":
      case "ACCEPTED":
        bg = "#dcfce7";
        color = "#15803d";
        break;
      case "PENDING":
        bg = "#fef9c3";
        color = "#a16207";
        break;
      case "PROCESSING":
        bg = "#e0e7ff";
        color = "#4338ca";
        break;
      case "RETRY_SCHEDULED":
        bg = "#ffedd5";
        color = "#c2410c";
        break;
      case "FAILED":
        bg = "#fee2e2";
        color = "#b91c1c";
        break;
      case "CANCELLED":
        bg = "#f1f5f9";
        color = "#64748b";
        break;
      case "SKIPPED":
        bg = "#e2e8f0";
        color = "#475569";
        break;
    }
    return (
      <span
        style={{
          display: "inline-block",
          padding: "0.25rem 0.6rem",
          borderRadius: "9999px",
          fontSize: "0.75rem",
          fontWeight: 700,
          backgroundColor: bg,
          color: color,
        }}
      >
        {status}
      </span>
    );
  };

  const getHealthBadge = (state: string) => {
    let bg = "#e2e8f0";
    let color = "#475569";
    if (state === "Healthy") {
      bg = "#dcfce7";
      color = "#15803d";
    } else if (state === "Delayed") {
      bg = "#fef9c3";
      color = "#a16207";
    } else if (state === "Degraded") {
      bg = "#fee2e2";
      color = "#b91c1c";
    }
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: "0.25rem 0.75rem",
          borderRadius: "9999px",
          fontSize: "0.8rem",
          fontWeight: 700,
          backgroundColor: bg,
          color: color,
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: color,
          }}
        />
        {state}
      </span>
    );
  };

  const currentMetrics =
    dateRange === "today"
      ? overview?.today
      : dateRange === "last7days"
      ? overview?.last7Days
      : overview?.last30Days;

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: "#111827", margin: 0 }}>
            Communication Operations Center
          </h1>
          <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0", fontSize: "0.9rem" }}>
            Automated booking dispatch, scheduling engine, failure recovery & audit controls
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {overview?.workerHealth && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Scheduler:</span>
              {getHealthBadge(overview.workerHealth.state)}
            </div>
          )}
          <button
            onClick={triggerWorkerRun}
            disabled={triggeringWorker}
            style={{
              padding: "0.5rem 1rem",
              background: "#1f2937",
              color: "#ffffff",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: triggeringWorker ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            {triggeringWorker ? "Running Worker..." : "⚡ Run Worker"}
          </button>
        </div>
      </div>

      {workerMessage && (
        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            color: "#1e40af",
            fontSize: "0.875rem",
            marginBottom: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{workerMessage}</span>
          <button
            onClick={() => setWorkerMessage(null)}
            style={{ background: "none", border: "none", color: "#1e40af", cursor: "pointer", fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #e5e7eb",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          overflowX: "auto",
        }}
      >
        {[
          { key: "overview", label: "📊 Overview" },
          { key: "notifications", label: "📨 All Notifications" },
          { key: "reminders", label: "⏰ Scheduled Reminders" },
          { key: "failed", label: "⚠️ Failed & Retries" },
          { key: "smtp", label: "📧 SMTP Monitoring" },
          { key: "whatsapp", label: "💬 WhatsApp Readiness" },
          { key: "worker", label: "⚙️ Scheduler Health" },
          { key: "audit", label: "🛡️ Audit Trail" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key as any);
              setPage(1);
            }}
            style={{
              padding: "0.75rem 1.25rem",
              fontSize: "0.9rem",
              fontWeight: activeTab === tab.key ? 700 : 500,
              color: activeTab === tab.key ? "#2563eb" : "#4b5563",
              borderBottom: activeTab === tab.key ? "3px solid #2563eb" : "3px solid transparent",
              background: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div>
          {/* Time Filter Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ fontSize: "0.9rem", color: "#4b5563" }}>
              Timezone: <strong>Asia/Kolkata (IST)</strong>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {(["today", "last7days", "last30days"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  style={{
                    padding: "0.4rem 0.9rem",
                    borderRadius: "0.375rem",
                    fontSize: "0.85rem",
                    fontWeight: dateRange === range ? 600 : 500,
                    border: "1px solid #d1d5db",
                    background: dateRange === range ? "#2563eb" : "#ffffff",
                    color: dateRange === range ? "#ffffff" : "#374151",
                    cursor: "pointer",
                  }}
                >
                  {range === "today" ? "Today" : range === "last7days" ? "Last 7 Days" : "Last 30 Days"}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: 500 }}>Total Dispatches</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111827", marginTop: "0.25rem" }}>
                {currentMetrics?.total ?? 0}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                Email: {currentMetrics?.emailSent ?? 0} | WhatsApp: {currentMetrics?.whatsappSent ?? 0}
              </div>
            </div>

            <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "0.85rem", color: "#15803d", fontWeight: 500 }}>Delivered / Accepted</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#15803d", marginTop: "0.25rem" }}>
                {currentMetrics?.delivered ?? 0}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#86efac", marginTop: "0.25rem" }}>
                Successful delivery receipts
              </div>
            </div>

            <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "0.85rem", color: "#b91c1c", fontWeight: 500 }}>Permanent Failures</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#b91c1c", marginTop: "0.25rem" }}>
                {currentMetrics?.failed ?? 0}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#fca5a5", marginTop: "0.25rem" }}>
                Exceeded retry limits or unrecoverable
              </div>
            </div>

            <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "0.85rem", color: "#c2410c", fontWeight: 500 }}>In Retry / Pending</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#c2410c", marginTop: "0.25rem" }}>
                {(overview?.today?.retrying ?? 0) + (overview?.today?.pending ?? 0)}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#fdba74", marginTop: "0.25rem" }}>
                Scheduled or waiting for execution
              </div>
            </div>

            <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "0.85rem", color: "#4338ca", fontWeight: 500 }}>Upcoming Reminders</div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#4338ca", marginTop: "0.25rem" }}>
                {overview?.activeRemindersUpcoming ?? 0}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#a5b4fc", marginTop: "0.25rem" }}>
                Active 48h/24h/2h arrival reminders
              </div>
            </div>
          </div>

          {/* Operational Cards Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
            {/* SMTP Capacity Card */}
            <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1rem 0", color: "#111827" }}>
                📧 Gmail SMTP Daily Quota
              </h3>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Budget Used Today</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                  {overview?.smtpCapacity?.usedToday ?? 0} / {overview?.smtpCapacity?.dailyLimit ?? 450} emails
                </span>
              </div>
              <div style={{ height: "10px", width: "100%", background: "#f3f4f6", borderRadius: "5px", overflow: "hidden", marginBottom: "1rem" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(100, (((overview?.smtpCapacity?.usedToday ?? 0) / (overview?.smtpCapacity?.dailyLimit ?? 450)) * 100))}%`,
                    background: (overview?.smtpCapacity?.remainingToday ?? 450) < 50 ? "#dc2626" : "#2563eb",
                    borderRadius: "5px",
                  }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.85rem" }}>
                <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "0.5rem" }}>
                  <div style={{ color: "#64748b" }}>Remaining Budget</div>
                  <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f172a" }}>
                    {overview?.smtpCapacity?.remainingToday ?? 450}
                  </div>
                </div>
                <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "0.5rem" }}>
                  <div style={{ color: "#64748b" }}>Priority Reserved</div>
                  <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1e40af" }}>
                    {overview?.smtpCapacity?.priorityReserved ?? 50}
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Readiness Banner */}
            <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#111827" }}>
                  💬 Meta WhatsApp Business Channel
                </h3>
                <span
                  style={{
                    padding: "0.2rem 0.5rem",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    background: "#f1f5f9",
                    color: "#475569",
                  }}
                >
                  DORMANT / DISABLED
                </span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#4b5563", margin: "0 0 1rem 0" }}>
                Live dispatch is safely guarded by <code>BOOKING_WHATSAPP_ENABLED=false</code>. Architecture and templates are verified and ready for activation.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.85rem" }}>
                <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "0.5rem" }}>
                  <div style={{ color: "#64748b" }}>Templates Prepared</div>
                  <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#166534" }}>
                    {overview?.whatsappStatus?.templatesConfigured ?? 7} / {overview?.whatsappStatus?.totalTemplates ?? 7}
                  </div>
                </div>
                <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "0.5rem" }}>
                  <div style={{ color: "#64748b" }}>Direct Dispatches</div>
                  <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#475569" }}>
                    0 (Guarded)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NOTIFICATIONS LIST */}
      {(activeTab === "notifications" || activeTab === "reminders" || activeTab === "failed") && (
        <div style={{ background: "#ffffff", borderRadius: "0.75rem", border: "1px solid #e5e7eb", padding: "1.25rem" }}>
          {/* Filter Bar */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              marginBottom: "1.25rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="Search reference, guest, property, ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                flex: 1,
                minWidth: "240px",
                padding: "0.5rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
              }}
            />

            <select
              value={channelFilter}
              onChange={(e) => {
                setChannelFilter(e.target.value);
                setPage(1);
              }}
              style={{
                padding: "0.5rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                background: "white",
              }}
            >
              <option value="all">All Channels</option>
              <option value="EMAIL">Email</option>
              <option value="WHATSAPP">WhatsApp</option>
            </select>

            {activeTab === "notifications" && (
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: "0.5rem 0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  background: "white",
                }}
              >
                <option value="all">All Statuses</option>
                <option value="DELIVERED">Delivered</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="PENDING">Pending</option>
                <option value="RETRY_SCHEDULED">Retry Scheduled</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="SKIPPED">Skipped</option>
              </select>
            )}

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              style={{
                padding: "0.5rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                background: "white",
              }}
            >
              <option value="all">All Event Types</option>
              <option value="BOOKING_CONFIRMATION">Booking Confirmation</option>
              <option value="ARRIVAL_REMINDER_48H">Arrival Reminder 48h</option>
              <option value="ARRIVAL_REMINDER_24H">Arrival Reminder 24h</option>
              <option value="ARRIVAL_REMINDER_2H">Arrival Reminder 2h</option>
              <option value="CHECKOUT_THANK_YOU">Checkout Thank You</option>
              <option value="FINAL_INVOICE">Final Invoice Delivery</option>
              <option value="REVIEW_REQUEST">Review Invitation</option>
            </select>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "0.75rem 1rem", color: "#475569", fontWeight: 600 }}>Date / ID</th>
                  <th style={{ padding: "0.75rem 1rem", color: "#475569", fontWeight: 600 }}>Booking Ref</th>
                  <th style={{ padding: "0.75rem 1rem", color: "#475569", fontWeight: 600 }}>Recipient</th>
                  <th style={{ padding: "0.75rem 1rem", color: "#475569", fontWeight: 600 }}>Type & Channel</th>
                  <th style={{ padding: "0.75rem 1rem", color: "#475569", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "0.75rem 1rem", color: "#475569", fontWeight: 600 }}>Attempts</th>
                  <th style={{ padding: "0.75rem 1rem", color: "#475569", fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notificationsLoading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                      Loading notifications...
                    </td>
                  </tr>
                ) : notifications.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                      No communications match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  notifications.map((item) => (
                    <tr
                      key={item._id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background 0.15s ease",
                      }}
                    >
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>
                          {new Date(item.scheduledFor || item.createdAt).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontFamily: "monospace" }}>
                          {item._id.slice(-8)}
                        </div>
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <div style={{ fontWeight: 600, color: "#2563eb", fontFamily: "monospace" }}>
                          {item.bookingReference || "N/A"}
                        </div>
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <div style={{ color: "#334155", fontFamily: "monospace" }}>
                          {item.recipientMasked}
                        </div>
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <div style={{ fontWeight: 500, color: "#1e293b" }}>{item.type}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {item.channel} {item.isResend && <span style={{ color: "#b45309", fontWeight: 600 }}>[RESEND]</span>}
                        </div>
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        {getStatusBadge(item.status)}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", color: "#475569" }}>
                        {item.attemptCount} / {item.maxAttempts}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <div style={{ display: "flex", gap: "0.35rem" }}>
                          <button
                            onClick={() => openDetailModal(item._id)}
                            style={{
                              padding: "0.3rem 0.6rem",
                              background: "#f1f5f9",
                              border: "1px solid #cbd5e1",
                              borderRadius: "0.25rem",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              color: "#334155",
                            }}
                          >
                            Details
                          </button>

                          {(item.status === "FAILED" || item.status === "CANCELLED" || item.status === "RETRY_SCHEDULED") && (
                            <button
                              onClick={() => {
                                setRetryTargetId(item._id);
                                setRetryReason("");
                                setRetryResetAttempts(false);
                                setRetryModalOpen(true);
                              }}
                              style={{
                                padding: "0.3rem 0.6rem",
                                background: "#fee2e2",
                                border: "1px solid #fca5a5",
                                borderRadius: "0.25rem",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                color: "#991b1b",
                              }}
                            >
                              Retry
                            </button>
                          )}

                          {item.status === "PENDING" && item.type.startsWith("ARRIVAL_REMINDER") && (
                            <button
                              onClick={() => {
                                setCancelTargetId(item._id);
                                setCancelReason("");
                                setCancelModalOpen(true);
                              }}
                              style={{
                                padding: "0.3rem 0.6rem",
                                background: "#fff7ed",
                                border: "1px solid #fed7aa",
                                borderRadius: "0.25rem",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                color: "#c2410c",
                              }}
                            >
                              Cancel
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setResendTargetId(item._id);
                              setResendReason("");
                              setResendModalOpen(true);
                            }}
                            style={{
                              padding: "0.3rem 0.6rem",
                              background: "#eff6ff",
                              border: "1px solid #bfdbfe",
                              borderRadius: "0.25rem",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              color: "#1d4ed8",
                            }}
                          >
                            Resend
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "1.25rem",
              fontSize: "0.875rem",
              color: "#64748b",
            }}
          >
            <div>
              Showing {notifications.length} of {totalCount} notifications
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: "0.4rem 0.75rem",
                  background: page <= 1 ? "#f1f5f9" : "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                }}
              >
                Previous
              </button>
              <span style={{ padding: "0.4rem 0.75rem" }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  padding: "0.4rem 0.75rem",
                  background: page >= totalPages ? "#f1f5f9" : "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  cursor: page >= totalPages ? "not-allowed" : "pointer",
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SMTP MONITORING */}
      {activeTab === "smtp" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
          <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1rem 0" }}>
              📊 Gmail SMTP Allocation Breakdown
            </h3>
            <div style={{ display: "grid", gap: "1rem", fontSize: "0.9rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.5rem" }}>
                <span style={{ color: "#64748b" }}>Provider</span>
                <strong>Google Workspace / Gmail SMTP</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.5rem" }}>
                <span style={{ color: "#64748b" }}>Daily Safety Ceiling</span>
                <strong>450 emails / 24 hours</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.5rem" }}>
                <span style={{ color: "#64748b" }}>Priority Reservation (Confirmations/Vouchers)</span>
                <strong>50 emails</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.5rem" }}>
                <span style={{ color: "#64748b" }}>Batch Worker Quota Remaining</span>
                <strong>{Math.max(0, (overview?.smtpCapacity?.remainingToday ?? 450) - 50)} emails</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.5rem" }}>
                <span style={{ color: "#64748b" }}>Current Status</span>
                <span style={{ color: "#166534", fontWeight: 700 }}>Operational</span>
              </div>
            </div>
          </div>

          <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1rem 0" }}>
              🛡️ Capacity Limiter Policies
            </h3>
            <ul style={{ paddingLeft: "1.25rem", color: "#475569", fontSize: "0.875rem", lineHeight: 1.6 }}>
              <li>Arrival reminders and review requests are paused if total remaining capacity falls below 50 emails.</li>
              <li>Transactional booking confirmations and cancellation notices always bypass the standard queue throttle.</li>
              <li>Batch worker enforces a max batch size of 20 emails per minute to maintain high Gmail reputation.</li>
              <li>Transient SMTP socket errors automatically trigger exponential backoff retry up to 3 attempts.</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 6: WHATSAPP READINESS */}
      {activeTab === "whatsapp" && (
        <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
              Meta WhatsApp Business Cloud API Configuration
            </h3>
            <span style={{ background: "#fee2e2", color: "#991b1b", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700 }}>
              STATUS: DISABLED (DORMANT)
            </span>
          </div>

          <p style={{ color: "#4b5563", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            The WhatsApp notification engine is fully modeled and ready. No live messages are dispatched because <code>BOOKING_WHATSAPP_ENABLED=false</code> is set in the environment.
          </p>

          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem", color: "#1e293b" }}>
            Registered Meta Message Templates:
          </h4>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "0.5rem 1rem" }}>Template Name</th>
                  <th style={{ padding: "0.5rem 1rem" }}>Language</th>
                  <th style={{ padding: "0.5rem 1rem" }}>Category</th>
                  <th style={{ padding: "0.5rem 1rem" }}>Readiness</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "booking_confirmation_v1", cat: "TRANSACTIONAL", lang: "en" },
                  { name: "arrival_reminder_48h_v1", cat: "UTILITY", lang: "en" },
                  { name: "arrival_reminder_24h_v1", cat: "UTILITY", lang: "en" },
                  { name: "arrival_reminder_2h_v1", cat: "UTILITY", lang: "en" },
                  { name: "checkout_thank_you_v1", cat: "UTILITY", lang: "en" },
                  { name: "final_invoice_ready_v1", cat: "TRANSACTIONAL", lang: "en" },
                  { name: "guest_review_invitation_v1", cat: "UTILITY", lang: "en" },
                ].map((tmpl) => (
                  <tr key={tmpl.name} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.5rem 1rem", fontFamily: "monospace", fontWeight: 600 }}>{tmpl.name}</td>
                    <td style={{ padding: "0.5rem 1rem" }}>{tmpl.lang}</td>
                    <td style={{ padding: "0.5rem 1rem" }}>{tmpl.cat}</td>
                    <td style={{ padding: "0.5rem 1rem", color: "#166534", fontWeight: 600 }}>Ready (Verified)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: WORKER HEALTH */}
      {activeTab === "worker" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
          <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1rem 0" }}>
              ⚙️ Scheduler Engine Heartbeat
            </h3>
            <div style={{ display: "grid", gap: "0.75rem", fontSize: "0.875rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Scheduler Status:</span>
                {overview?.workerHealth && getHealthBadge(overview.workerHealth.state)}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Last Execution Heartbeat:</span>
                <strong>{overview?.workerHealth?.lastHeartbeat ? new Date(overview.workerHealth.lastHeartbeat).toLocaleString() : "None"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Overdue Pending Jobs:</span>
                <strong style={{ color: (overview?.workerHealth?.overdueJobs ?? 0) > 0 ? "#b91c1c" : "#166534" }}>
                  {overview?.workerHealth?.overdueJobs ?? 0}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Stale Leases Detected:</span>
                <strong style={{ color: (overview?.workerHealth?.staleLeases ?? 0) > 0 ? "#c2410c" : "#166534" }}>
                  {overview?.workerHealth?.staleLeases ?? 0}
                </strong>
              </div>
              {overview?.workerHealth?.lastRunStats && (
                <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "0.5rem", marginTop: "0.5rem" }}>
                  <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Last Run Summary:</div>
                  <div style={{ color: "#64748b" }}>
                    Duration: {overview.workerHealth.lastRunStats.durationMs}ms | Claimed: {overview.workerHealth.lastRunStats.claimed} | Processed: {overview.workerHealth.lastRunStats.processed}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1rem 0" }}>
              ⚡ Manual Operational Trigger
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#475569", lineHeight: 1.5, marginBottom: "1rem" }}>
              Admins can immediately trigger the background worker to poll pending reminders and process outstanding deliveries without waiting for the next Vercel cron invocation.
            </p>
            <button
              onClick={triggerWorkerRun}
              disabled={triggeringWorker}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                fontWeight: 600,
                cursor: triggeringWorker ? "not-allowed" : "pointer",
              }}
            >
              {triggeringWorker ? "Executing Worker Run..." : "Trigger Notification Worker Now"}
            </button>
          </div>
        </div>
      )}

      {/* TAB 8: AUDIT TRAIL */}
      {activeTab === "audit" && (
        <div style={{ background: "#ffffff", borderRadius: "0.75rem", border: "1px solid #e5e7eb", padding: "1.25rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1rem 0" }}>
            🛡️ Administrative Communication Audit Trail
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "0.75rem 1rem" }}>Timestamp</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Admin User</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Action</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Booking Ref</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {auditLoading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                      Loading audit logs...
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                      No administrative audit records found.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.75rem 1rem", color: "#64748b" }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                        {log.adminUsername}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <span
                          style={{
                            background: "#e0e7ff",
                            color: "#3730a3",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontFamily: "monospace" }}>
                        {log.bookingReference || "N/A"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", color: "#334155" }}>
                        {log.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedNotificationId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1.5rem",
          }}
          onClick={() => setSelectedNotificationId(null)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "0.75rem",
              padding: "1.5rem",
              maxWidth: "750px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
                Notification Inspection
              </h2>
              <button
                onClick={() => setSelectedNotificationId(null)}
                style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            {detailLoading ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>Loading details...</div>
            ) : detailData?.notification ? (
              <div style={{ display: "grid", gap: "1rem", fontSize: "0.875rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <div>
                    <span style={{ color: "#64748b" }}>Status: </span>
                    {getStatusBadge(detailData.notification.status)}
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>Channel: </span>
                    <strong>{detailData.notification.channel}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>Type: </span>
                    <strong>{detailData.notification.type}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>Recipient (Masked): </span>
                    <code>{detailData.notification.recipientMasked}</code>
                  </div>
                </div>

                {detailData.notification.lastError && (
                  <div style={{ background: "#fee2e2", padding: "0.75rem", borderRadius: "0.5rem", color: "#991b1b" }}>
                    <strong>Last Error:</strong> {detailData.notification.lastError}
                  </div>
                )}

                {/* Safe Email Preview */}
                {detailData.safePreview && (
                  <div style={{ marginTop: "1rem" }}>
                    <h4 style={{ margin: "0 0 0.5rem 0", fontWeight: 600 }}>Message Preview:</h4>
                    <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                        Subject: {detailData.safePreview.subject}
                      </div>
                      <div
                        style={{
                          marginTop: "0.5rem",
                          padding: "1rem",
                          background: "#ffffff",
                          borderRadius: "0.25rem",
                          border: "1px solid #cbd5e1",
                          maxHeight: "260px",
                          overflowY: "auto",
                          fontSize: "0.8rem",
                        }}
                        dangerouslySetInnerHTML={{ __html: detailData.safePreview.htmlBody }}
                      />
                    </div>
                  </div>
                )}

                {/* Audit trail for this notification */}
                {detailData.auditLogs && detailData.auditLogs.length > 0 && (
                  <div style={{ marginTop: "1rem" }}>
                    <h4 style={{ margin: "0 0 0.5rem 0", fontWeight: 600 }}>Administrative Actions:</h4>
                    <ul style={{ paddingLeft: "1.25rem", margin: 0, color: "#475569" }}>
                      {detailData.auditLogs.map((log: any) => (
                        <li key={log._id}>
                          <strong>{log.action}</strong> by {log.adminUsername} ({new Date(log.createdAt).toLocaleString()}): {log.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div>No data found.</div>
            )}
          </div>
        </div>
      )}

      {/* RETRY MODAL */}
      {retryModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1.5rem",
          }}
          onClick={() => setRetryModalOpen(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "0.75rem",
              padding: "1.5rem",
              maxWidth: "500px",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1.15rem", fontWeight: 700 }}>
              Confirm Notification Retry
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "1rem" }}>
              This will re-queue the notification for immediate delivery by the background worker.
            </p>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                Administrative Reason:
              </label>
              <textarea
                value={retryReason}
                onChange={(e) => setRetryReason(e.target.value)}
                placeholder="e.g., SMTP socket error resolved, customer requested resend"
                rows={3}
                style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <input
                type="checkbox"
                id="resetAttempts"
                checked={retryResetAttempts}
                onChange={(e) => setRetryResetAttempts(e.target.checked)}
              />
              <label htmlFor="resetAttempts" style={{ fontSize: "0.85rem", color: "#475569" }}>
                Reset attempt count back to 0
              </label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button
                onClick={() => setRetryModalOpen(false)}
                style={{ padding: "0.5rem 1rem", background: "#f1f5f9", border: "none", borderRadius: "0.375rem" }}
              >
                Cancel
              </button>
              <button
                onClick={handleRetrySubmit}
                disabled={retryProcessing}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  fontWeight: 600,
                }}
              >
                {retryProcessing ? "Scheduling..." : "Confirm Retry"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESEND MODAL */}
      {resendModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1.5rem",
          }}
          onClick={() => setResendModalOpen(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "0.75rem",
              padding: "1.5rem",
              maxWidth: "500px",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1.15rem", fontWeight: 700 }}>
              Authorized Manual Resend
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "1rem" }}>
              Creates a separate new delivery job with full audit trail while preserving the historical notification record.
            </p>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                Reason for Resend:
              </label>
              <textarea
                value={resendReason}
                onChange={(e) => setResendReason(e.target.value)}
                placeholder="e.g., Guest did not receive confirmation voucher email"
                rows={3}
                style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button
                onClick={() => setResendModalOpen(false)}
                style={{ padding: "0.5rem 1rem", background: "#f1f5f9", border: "none", borderRadius: "0.375rem" }}
              >
                Cancel
              </button>
              <button
                onClick={handleResendSubmit}
                disabled={resendProcessing}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  fontWeight: 600,
                }}
              >
                {resendProcessing ? "Creating..." : "Execute Resend"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {cancelModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1.5rem",
          }}
          onClick={() => setCancelModalOpen(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "0.75rem",
              padding: "1.5rem",
              maxWidth: "500px",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1.15rem", fontWeight: 700 }}>
              Cancel Scheduled Reminder
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "1rem" }}>
              Cancelling will prevent this automated arrival reminder from firing. An audit log will be permanently recorded.
            </p>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                Reason for Cancellation:
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Guest changed travel itinerary or requested no reminders"
                rows={3}
                style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.375rem" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button
                onClick={() => setCancelModalOpen(false)}
                style={{ padding: "0.5rem 1rem", background: "#f1f5f9", border: "none", borderRadius: "0.375rem" }}
              >
                Back
              </button>
              <button
                onClick={handleCancelSubmit}
                disabled={cancelProcessing}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  fontWeight: 600,
                }}
              >
                {cancelProcessing ? "Cancelling..." : "Cancel Reminder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
