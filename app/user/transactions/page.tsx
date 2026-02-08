"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";

interface Transaction {
  _id: string;
  transactionId: string;
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentGateway: string;
  status: string;
  transactionDate: string;
  gatewayTransactionId?: string;
  description?: string;
}

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "success" | "pending" | "failed" | "refunded"
  >("all");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/user/transactions", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
      } else if (response.status === 401) {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return { bg: "#dcfce7", color: "#166534", icon: "✓" };
      case "pending":
        return { bg: "#fef3c7", color: "#92400e", icon: "⏳" };
      case "failed":
        return { bg: "#fee2e2", color: "#991b1b", icon: "✗" };
      case "refunded":
        return { bg: "#dbeafe", color: "#1e40af", icon: "↩" };
      default:
        return { bg: "#f3f4f6", color: "#6b7280", icon: "•" };
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "credit card":
      case "debit card":
        return "💳";
      case "upi":
        return "📱";
      case "net banking":
        return "🏦";
      case "wallet":
        return "👛";
      default:
        return "💰";
    }
  };

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.status === filter);

  const totalAmount = filteredTransactions.reduce((sum, t) => {
    if (t.status === "success") return sum + t.amount;
    return sum;
  }, 0);

  if (loading) {
    return (
      <>
        <Header />
        <div
          style={{
            minHeight: "100vh",
            background: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p>Loading transactions...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div
        style={{
          minHeight: "100vh",
          background: "#f3f4f6",
          paddingTop: "2rem",
          paddingBottom: "4rem",
        }}
      >
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}
        >
          <div style={{ marginBottom: "2rem" }}>
            <h1
              style={{
                margin: "0 0 0.5rem",
                fontSize: "2rem",
                fontWeight: 700,
              }}
            >
              Transaction History
            </h1>
            <p style={{ margin: 0, color: "#6b7280" }}>
              {transactions.length > 0
                ? `${transactions.length} total ${
                    transactions.length === 1 ? "transaction" : "transactions"
                  }`
                : "No transactions yet"}
            </p>
          </div>

          {/* Summary Cards */}
          {transactions.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  background: "white",
                  padding: "1.25rem",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#6b7280",
                    marginBottom: "0.5rem",
                  }}
                >
                  Total Spent
                </div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "#0066cc",
                  }}
                >
                  {formatCurrency(totalAmount)}
                </div>
              </div>
              <div
                style={{
                  background: "white",
                  padding: "1.25rem",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#6b7280",
                    marginBottom: "0.5rem",
                  }}
                >
                  Successful
                </div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "#16a34a",
                  }}
                >
                  {transactions.filter((t) => t.status === "success").length}
                </div>
              </div>
              <div
                style={{
                  background: "white",
                  padding: "1.25rem",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#6b7280",
                    marginBottom: "0.5rem",
                  }}
                >
                  Pending
                </div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "#ca8a04",
                  }}
                >
                  {transactions.filter((t) => t.status === "pending").length}
                </div>
              </div>
              <div
                style={{
                  background: "white",
                  padding: "1.25rem",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#6b7280",
                    marginBottom: "0.5rem",
                  }}
                >
                  Failed/Refunded
                </div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "#dc2626",
                  }}
                >
                  {
                    transactions.filter(
                      (t) => t.status === "failed" || t.status === "refunded",
                    ).length
                  }
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "2rem",
              flexWrap: "wrap",
            }}
          >
            {[
              { value: "all", label: "All" },
              { value: "success", label: "Success" },
              { value: "pending", label: "Pending" },
              { value: "failed", label: "Failed" },
              { value: "refunded", label: "Refunded" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value as any)}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: filter === tab.value ? "#0066cc" : "white",
                  color: filter === tab.value ? "white" : "#1f2937",
                  border: filter === tab.value ? "none" : "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "0.95rem",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Transactions List */}
          {filteredTransactions.length === 0 ? (
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "3rem",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>💳</div>
              <h3
                style={{
                  margin: "0 0 0.5rem",
                  fontSize: "1.3rem",
                  fontWeight: 600,
                }}
              >
                No Transactions Found
              </h3>
              <p style={{ margin: "0", color: "#6b7280" }}>
                {filter === "all"
                  ? "You haven't made any transactions yet."
                  : `No ${filter} transactions.`}
              </p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {filteredTransactions.map((transaction) => {
                const statusStyle = getStatusColor(transaction.status);

                return (
                  <div
                    key={transaction._id}
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "1.5rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        flexWrap: "wrap",
                        gap: "1rem",
                      }}
                    >
                      {/* Left Side - Transaction Details */}
                      <div style={{ flex: "1", minWidth: "250px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            marginBottom: "0.75rem",
                          }}
                        >
                          <span style={{ fontSize: "2rem" }}>
                            {getPaymentMethodIcon(transaction.paymentMethod)}
                          </span>
                          <div>
                            <h3
                              style={{
                                margin: "0 0 0.25rem",
                                fontSize: "1.1rem",
                                fontWeight: 700,
                              }}
                            >
                              {transaction.paymentMethod}
                            </h3>
                            <p
                              style={{
                                margin: 0,
                                color: "#6b7280",
                                fontSize: "0.85rem",
                              }}
                            >
                              via {transaction.paymentGateway}
                            </p>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                            fontSize: "0.85rem",
                          }}
                        >
                          <div>
                            <span style={{ color: "#6b7280" }}>
                              Transaction ID:{" "}
                            </span>
                            <strong>{transaction.transactionId}</strong>
                          </div>
                          <div>
                            <span style={{ color: "#6b7280" }}>
                              Booking ID:{" "}
                            </span>
                            <strong>{transaction.bookingId}</strong>
                          </div>
                          {transaction.gatewayTransactionId && (
                            <div>
                              <span style={{ color: "#6b7280" }}>
                                Gateway Ref:{" "}
                              </span>
                              <strong style={{ fontSize: "0.8rem" }}>
                                {transaction.gatewayTransactionId}
                              </strong>
                            </div>
                          )}
                          {transaction.description && (
                            <div
                              style={{
                                marginTop: "0.5rem",
                                padding: "0.5rem",
                                background: "#f9fafb",
                                borderRadius: "6px",
                              }}
                            >
                              {transaction.description}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Side - Amount and Status */}
                      <div style={{ textAlign: "right", minWidth: "150px" }}>
                        <div style={{ marginBottom: "0.75rem" }}>
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "#6b7280",
                              marginBottom: "0.25rem",
                            }}
                          >
                            Amount
                          </div>
                          <div
                            style={{
                              fontSize: "1.8rem",
                              fontWeight: 700,
                              color:
                                transaction.status === "refunded"
                                  ? "#dc2626"
                                  : "#0066cc",
                            }}
                          >
                            {transaction.status === "refunded" && "- "}
                            {formatCurrency(
                              transaction.amount,
                              transaction.currency,
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                            alignItems: "flex-end",
                          }}
                        >
                          <span
                            style={{
                              padding: "0.4rem 1rem",
                              background: statusStyle.bg,
                              color: statusStyle.color,
                              borderRadius: "12px",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              textTransform: "capitalize",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <span>{statusStyle.icon}</span>
                            {transaction.status}
                          </span>
                          <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                            {formatDateTime(transaction.transactionDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
