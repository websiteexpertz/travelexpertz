"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type CabStatus = "Available" | "On Trip" | "Maintenance";

interface Cab {
  _id: string;
  model: string;
  fuelType?: string;
  color?: string;
  licensePlate: string;
  category: string;
  assignedDriver?: string | null;
  status: CabStatus | string;
  seats?: number;
  baseFare?: number;
  perKmRate?: number;
  driverAllowance?: number;
  taxPercent?: number;
  rating?: number | null;
  luggageCapacity?: number;
  driverName?: string;
  driverPhone?: string;
  driverLicense?: string;
}

interface CabFormData {
  model: string;
  fuelType: string;
  color: string;
  licensePlate: string;
  category: string;
  assignedDriver: string;
  status: CabStatus;
  seats: number;
  baseFare: number;
  perKmRate: number;
  driverAllowance: number;
  taxPercent: number;
  rating: number;
  luggageCapacity: number;
  driverName: string;
  driverPhone: string;
  driverLicense: string;
}

const emptyCabForm: CabFormData = {
  model: "",
  fuelType: "",
  color: "",
  licensePlate: "",
  category: "",
  assignedDriver: "",
  status: "Available",
  seats: 4,
  baseFare: 500,
  perKmRate: 18,
  driverAllowance: 0,
  taxPercent: 0,
  rating: 0,
  luggageCapacity: 2,
  driverName: "",
  driverPhone: "",
  driverLicense: "",
};

const statusStyles: Record<CabStatus, { background: string; color: string }> = {
  Available: { background: "#d4edda", color: "#155724" },
  "On Trip": { background: "#d1ecf1", color: "#0c5460" },
  Maintenance: { background: "#fff3cd", color: "#856404" },
};

function normalizeCabs(data: unknown): Cab[] {
  if (Array.isArray(data)) return data as Cab[];
  if (data && typeof data === "object" && "cabs" in data) {
    const cabs = (data as { cabs: unknown }).cabs;
    return Array.isArray(cabs) ? (cabs as Cab[]) : [];
  }
  return [];
}

export default function AdminCabsPage() {
  const [cabs, setCabs] = useState<Cab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCab, setEditingCab] = useState<Cab | null>(null);
  const [formData, setFormData] = useState<CabFormData>(emptyCabForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCabs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/cabs", {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "The cab fleet API is not available yet."
            : "Could not load the vehicle fleet.",
        );
      }
      setCabs(normalizeCabs(await response.json()));
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Could not load the vehicle fleet.",
      );
      setCabs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCabs();
  }, [fetchCabs]);

  const openCreateForm = () => {
    setEditingCab(null);
    setFormData(emptyCabForm);
    setFormError("");
    setFormOpen(true);
  };

  const openEditForm = (cab: Cab) => {
    setEditingCab(cab);
    setFormData({
      model: cab.model || "",
      fuelType: cab.fuelType || "",
      color: cab.color || "",
      licensePlate: cab.licensePlate || "",
      category: cab.category || "",
      assignedDriver: cab.assignedDriver || "",
      status: cab.status as CabStatus,
      seats: Number(cab.seats) || 4,
      baseFare: Number(cab.baseFare ?? 500),
      perKmRate: Number(cab.perKmRate ?? 18),
      driverAllowance: Number(cab.driverAllowance) || 0,
      taxPercent: Number(cab.taxPercent) || 0,
      rating: Number(cab.rating) || 0,
      luggageCapacity: cab.luggageCapacity === undefined ? 2 : Number(cab.luggageCapacity),
      driverName: cab.driverName || cab.assignedDriver || "",
      driverPhone: cab.driverPhone || "",
      driverLicense: cab.driverLicense || "",
    });
    setFormError("");
    setFormOpen(true);
  };

  const handleSaveCab = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const response = await fetch(
        editingCab
          ? `/api/admin/cabs?id=${encodeURIComponent(editingCab._id)}`
          : "/api/admin/cabs",
        {
          method: editingCab ? "PUT" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Could not save this vehicle.");
      }
      setFormOpen(false);
      await fetchCabs();
    } catch (saveError) {
      setFormError(
        saveError instanceof Error ? saveError.message : "Could not save this vehicle.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCab = async (cab: Cab) => {
    if (!confirm(`Delete ${cab.model} (${cab.licensePlate}) from the fleet?`)) return;
    try {
      const response = await fetch(
        `/api/admin/cabs?id=${encodeURIComponent(cab._id)}`,
        { method: "DELETE", credentials: "include" },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not delete this vehicle.");
      await fetchCabs();
    } catch (deleteError) {
      alert(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete this vehicle.",
      );
    }
  };

  const categories = useMemo(
    () => [...new Set(cabs.map((cab) => cab.category).filter(Boolean))].sort(),
    [cabs],
  );

  const filteredCabs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return cabs.filter((cab) => {
      const matchesQuery =
        !query ||
        [cab.model, cab.licensePlate, cab.category, cab.driverName, cab.assignedDriver, cab.driverPhone, cab.driverLicense]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query));
      const matchesStatus =
        statusFilter === "all" || cab.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || cab.category === categoryFilter;
      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [cabs, categoryFilter, search, statusFilter]);

  const availableCount = cabs.filter(
    (cab) => cab.status === "Available",
  ).length;
  const onTripCount = cabs.filter((cab) => cab.status === "On Trip").length;
  const maintenanceCount = cabs.filter(
    (cab) => cab.status === "Maintenance",
  ).length;

  return (
    <section style={{ padding: "2rem", color: "#1e293b" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 0.25rem",
              color: "#64748b",
              fontSize: "0.875rem",
            }}
          >
            Fleet operations
          </p>
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800 }}>
            Cab Booking &amp; Fleet Management
          </h1>
        </div>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <button type="button" onClick={() => void fetchCabs()} disabled={loading} style={secondaryButtonStyle}>
            <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>
              refresh
            </span>
            Refresh fleet
          </button>
          <button type="button" onClick={openCreateForm} style={primaryButtonStyle}>
            <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>
              add
            </span>
            Add vehicle
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {[
          { label: "Total vehicles", count: cabs.length, color: "#0a66c2" },
          { label: "Available", count: availableCount, color: "#198754" },
          { label: "On trip", count: onTripCount, color: "#0c7890" },
          { label: "Maintenance", count: maintenanceCount, color: "#b7791f" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "white",
              padding: "1rem 1.25rem",
              border: "1px solid #e2e8f0",
              borderRadius: "0.5rem",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
            }}
          >
            <p
              style={{
                margin: "0 0 0.35rem",
                color: "#64748b",
                fontSize: "0.875rem",
              }}
            >
              {stat.label}
            </p>
            <strong style={{ color: stat.color, fontSize: "1.5rem" }}>
              {loading ? "-" : stat.count}
            </strong>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
          padding: "1rem",
          marginBottom: "1rem",
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "0.5rem",
        }}
      >
        <label
          style={{
            flex: "1 1 240px",
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0 0.75rem",
            border: "1px solid #cbd5e1",
            borderRadius: "0.5rem",
            color: "#64748b",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "1.2rem" }}>
            search
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search model, plate, driver..."
            aria-label="Search vehicles"
            style={{
              width: "100%",
              minWidth: 0,
              padding: "0.7rem 0",
              border: 0,
              outline: 0,
              color: "#1e293b",
              font: "inherit",
              fontSize: "0.9rem",
            }}
          />
        </label>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter by status"
          style={filterSelectStyle}
        >
          <option value="all">All statuses</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="Maintenance">Maintenance</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          aria-label="Filter by category"
          style={filterSelectStyle}
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "0.5rem",
          overflow: "hidden",
        }}
      >
        {error ? (
          <div
            role="alert"
            style={{ padding: "2rem", textAlign: "center", color: "#721c24" }}
          >
            <p style={{ margin: "0 0 1rem" }}>{error}</p>
            <button type="button" onClick={() => void fetchCabs()} style={retryButtonStyle}>
              Try again
            </button>
          </div>
        ) : loading ? (
          <p style={{ padding: "3rem 1rem", textAlign: "center", color: "#64748b" }}>
            Loading fleet...
          </p>
        ) : filteredCabs.length === 0 ? (
          <div style={{ padding: "3rem 1rem", textAlign: "center" }}>
            <span
              className="material-symbols-outlined"
              style={{ color: "#94a3b8", fontSize: "2rem" }}
            >
              directions_car
            </span>
            <p style={{ margin: "0.5rem 0 0", color: "#64748b" }}>
              {cabs.length === 0
                ? "No vehicles have been added to the fleet yet."
                : "No vehicles match these filters."}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "720px" }}>
              <thead>
                <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #dee2e6" }}>
                  {[
                    "Car model",
                    "License plate",
                    "Car type",
                    "Fuel / color",
                    "Assigned driver",
                    "Capacity",
                    "Rates",
                    "Operational status",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      style={{
                        padding: "0.9rem 1rem",
                        textAlign: "left",
                        color: "#475569",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCabs.map((cab) => {
                  const statusStyle =
                    statusStyles[cab.status as CabStatus] ?? {
                      background: "#e2e3e5",
                      color: "#383d41",
                    };
                  return (
                    <tr key={cab._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={cellStyle}>
                        <strong style={{ color: "#1e293b", fontWeight: 600 }}>
                          {cab.model || "Unnamed vehicle"}
                        </strong>
                      </td>
                      <td style={{ ...cellStyle, fontWeight: 600, color: "#334155" }}>
                        {cab.licensePlate || "-"}
                      </td>
                      <td style={cellStyle}>{cab.category || "-"}</td>
                      <td style={cellStyle}>{cab.fuelType || "Not specified"}<br /><span style={{ color: "#64748b" }}>{cab.color || "Color not specified"}</span></td>
                      <td style={cellStyle}>
                        <strong>{cab.driverName || cab.assignedDriver || "Unassigned"}</strong>
                        {cab.driverPhone && <><br /><span>{cab.driverPhone}</span></>}
                        {cab.driverLicense && <><br /><span style={{ color: "#64748b" }}>DL {cab.driverLicense}</span></>}
                      </td>
                      <td style={cellStyle}>{cab.seats || 4} seats<br />{cab.luggageCapacity ?? 2} bags</td>
                      <td style={cellStyle}>
                        ₹{cab.baseFare ?? 500} + ₹{cab.perKmRate ?? 18}/km<br />
                        Driver ₹{cab.driverAllowance || 0} · Tax {cab.taxPercent ?? 0}%<br />
                        {cab.rating ? `Rating ${cab.rating.toFixed(1)} / 5` : "Not rated"}
                      </td>
                      <td style={cellStyle}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "999px",
                            background: statusStyle.background,
                            color: statusStyle.color,
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {cab.status || "Unknown"}
                        </span>
                      </td>
                      <td style={{ ...cellStyle, whiteSpace: "nowrap" }}>
                        <button
                          type="button"
                          title={`Edit ${cab.model}`}
                          aria-label={`Edit ${cab.model}`}
                          onClick={() => openEditForm(cab)}
                          style={iconButtonStyle}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "1.15rem" }}>
                            edit
                          </span>
                        </button>
                        <button
                          type="button"
                          title={`Delete ${cab.model}`}
                          aria-label={`Delete ${cab.model}`}
                          onClick={() => void handleDeleteCab(cab)}
                          style={{ ...iconButtonStyle, color: "#b42318" }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "1.15rem" }}>
                            delete
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!error && !loading && filteredCabs.length > 0 && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderTop: "1px solid #e2e8f0",
              color: "#64748b",
              fontSize: "0.8rem",
            }}
          >
            Showing {filteredCabs.length} of {cabs.length} vehicles
          </div>
        )}
      </div>

      {formOpen && (
        <div
          onClick={(event) => {
            if (event.target === event.currentTarget && !saving) setFormOpen(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            background: "rgba(15, 23, 42, 0.48)",
          }}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="cab-form-title"
            onSubmit={handleSaveCab}
            style={{
              width: "min(100%, 520px)",
              maxHeight: "calc(100vh - 2rem)",
              overflowY: "auto",
              padding: "1.5rem",
              background: "white",
              borderRadius: "0.5rem",
              boxShadow: "0 20px 50px rgba(15, 23, 42, 0.24)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "1.25rem" }}>
              <div>
                <h2 id="cab-form-title" style={{ margin: 0, fontSize: "1.25rem" }}>
                  {editingCab ? "Edit vehicle" : "Add vehicle"}
                </h2>
                <p style={{ margin: "0.35rem 0 0", color: "#64748b", fontSize: "0.875rem" }}>
                  Vehicle details are stored in your fleet management system.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close form"
                disabled={saving}
                onClick={() => setFormOpen(false)}
                style={iconButtonStyle}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "0.9rem" }}>
              <CabField label="Car model" required>
                <input
                  required
                  maxLength={100}
                  value={formData.model}
                  onChange={(event) => setFormData({ ...formData, model: event.target.value })}
                  placeholder="e.g. Toyota Innova Crysta"
                  style={formInputStyle}
                />
              </CabField>
              <CabField label="Fuel type" required={!editingCab || Boolean(editingCab.fuelType)}>
                <select
                  required={!editingCab || Boolean(editingCab.fuelType)}
                  value={formData.fuelType}
                  onChange={(event) => setFormData({ ...formData, fuelType: event.target.value })}
                  style={formInputStyle}
                >
                  <option value="">Select fuel type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="CNG">CNG</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </CabField>
              <CabField label="Car color" required={!editingCab || Boolean(editingCab.color)}>
                <input
                  required={!editingCab || Boolean(editingCab.color)}
                  list="cab-color-options"
                  maxLength={40}
                  value={formData.color}
                  onChange={(event) => setFormData({ ...formData, color: event.target.value })}
                  placeholder="e.g. White, Silver, Midnight blue"
                  style={formInputStyle}
                />
                <datalist id="cab-color-options">
                  {["White", "Black", "Silver", "Grey", "Red", "Blue", "Green", "Brown"].map((color) => (
                    <option key={color} value={color} />
                  ))}
                </datalist>
              </CabField>
              <CabField label="License plate" required>
                <input
                  required
                  maxLength={20}
                  value={formData.licensePlate}
                  onChange={(event) => setFormData({ ...formData, licensePlate: event.target.value })}
                  placeholder="e.g. DL 01 AB 1234"
                  style={formInputStyle}
                />
              </CabField>
              <CabField label="Car type" required>
                <input
                  required
                  list="cab-type-options"
                  maxLength={60}
                  value={formData.category}
                  onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                  placeholder="Select or enter a car type"
                  style={formInputStyle}
                />
                <datalist id="cab-type-options">
                  {["Hatchback", "Sedan", "SUV", "MUV", "Luxury", "Tempo Traveller"].map((type) => (
                    <option key={type} value={type} />
                  ))}
                </datalist>
              </CabField>
              <CabField label="Driver name">
                <input
                  maxLength={100}
                  value={formData.driverName}
                  onChange={(event) => setFormData({ ...formData, driverName: event.target.value, assignedDriver: event.target.value })}
                  placeholder="Driver name (optional)"
                  style={formInputStyle}
                />
              </CabField>
              <CabField label="Driver phone">
                <input
                  type="tel"
                  maxLength={30}
                  value={formData.driverPhone}
                  onChange={(event) => setFormData({ ...formData, driverPhone: event.target.value })}
                  placeholder="Contact number"
                  style={formInputStyle}
                />
              </CabField>
              <CabField label="Driver license number">
                <input
                  maxLength={50}
                  value={formData.driverLicense}
                  onChange={(event) => setFormData({ ...formData, driverLicense: event.target.value })}
                  placeholder="License number"
                  style={formInputStyle}
                />
              </CabField>
              <CabField label="Operational status" required>
                <select
                  required
                  value={formData.status}
                  onChange={(event) => setFormData({ ...formData, status: event.target.value as CabStatus })}
                  style={formInputStyle}
                >
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </CabField>
              <CabField label="Passenger capacity" required>
                <input
                  required
                  type="number"
                  min={1}
                  max={20}
                  value={formData.seats}
                  onChange={(event) => setFormData({ ...formData, seats: Number(event.target.value) })}
                  style={formInputStyle}
                />
              </CabField>
              <CabField label="Luggage capacity (bags)" required>
                <input
                  required
                  type="number"
                  min={0}
                  max={50}
                  value={formData.luggageCapacity}
                  onChange={(event) => setFormData({ ...formData, luggageCapacity: Number(event.target.value) })}
                  style={formInputStyle}
                />
              </CabField>
              <CabField label="Base fare (INR)" required>
                <input
                  required
                  type="number"
                  min={0}
                  max={100000}
                  value={formData.baseFare}
                  onChange={(event) => setFormData({ ...formData, baseFare: Number(event.target.value) })}
                  style={formInputStyle}
                />
              </CabField>
              <CabField label="Rate per km (INR)" required>
                <input
                  required
                  type="number"
                  min={0}
                  max={10000}
                  value={formData.perKmRate}
                  onChange={(event) => setFormData({ ...formData, perKmRate: Number(event.target.value) })}
                  style={formInputStyle}
                />
              </CabField>
              <CabField label="Driver allowance per trip (INR)" required>
                <input
                  required
                  type="number"
                  min={0}
                  max={100000}
                  value={formData.driverAllowance}
                  onChange={(event) => setFormData({ ...formData, driverAllowance: Number(event.target.value) })}
                  style={formInputStyle}
                />
              </CabField>
              <CabField label="Customer rating (0 = not rated)">
                <input
                  type="number"
                  min={0}
                  max={5}
                  step="0.1"
                  value={formData.rating}
                  onChange={(event) => setFormData({ ...formData, rating: Number(event.target.value) })}
                  style={formInputStyle}
                />
              </CabField>
              <CabField label="Government tax (%)" required>
                <input
                  required
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={formData.taxPercent}
                  onChange={(event) => setFormData({ ...formData, taxPercent: Number(event.target.value) })}
                  style={formInputStyle}
                />
              </CabField>
            </div>
            {formError && (
              <p role="alert" style={{ margin: "1rem 0 0", color: "#b42318", fontSize: "0.875rem" }}>
                {formError}
              </p>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", marginTop: "1.5rem" }}>
              <button type="button" disabled={saving} onClick={() => setFormOpen(false)} style={secondaryButtonStyle}>
                Cancel
              </button>
              <button type="submit" disabled={saving} style={primaryButtonStyle}>
                {saving ? "Saving..." : editingCab ? "Save changes" : "Add vehicle"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function CabField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: "0.35rem", color: "#334155", fontSize: "0.85rem", fontWeight: 600 }}>
      {label}{required ? " *" : ""}
      {children}
    </label>
  );
}

const filterSelectStyle: React.CSSProperties = {
  minHeight: "42px",
  padding: "0.6rem 2rem 0.6rem 0.75rem",
  border: "1px solid #cbd5e1",
  borderRadius: "0.5rem",
  background: "white",
  color: "#334155",
  font: "inherit",
  fontSize: "0.875rem",
};

const retryButtonStyle: React.CSSProperties = {
  padding: "0.55rem 0.9rem",
  border: "1px solid #0a66c2",
  borderRadius: "0.5rem",
  background: "white",
  color: "#0a66c2",
  font: "inherit",
  fontWeight: 600,
  cursor: "pointer",
};

const cellStyle: React.CSSProperties = {
  padding: "0.9rem 1rem",
  color: "#475569",
  fontSize: "0.875rem",
};

const primaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.45rem",
  minHeight: "42px",
  padding: "0.6rem 0.9rem",
  border: "1px solid #0a66c2",
  borderRadius: "0.5rem",
  background: "#0a66c2",
  color: "white",
  font: "inherit",
  fontSize: "0.875rem",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.45rem",
  minHeight: "42px",
  padding: "0.6rem 0.9rem",
  border: "1px solid #cbd5e1",
  borderRadius: "0.5rem",
  background: "white",
  color: "#334155",
  font: "inherit",
  fontSize: "0.875rem",
  fontWeight: 600,
  cursor: "pointer",
};

const iconButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "36px",
  height: "36px",
  marginRight: "0.25rem",
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  background: "white",
  color: "#475569",
  cursor: "pointer",
};

const formInputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "42px",
  padding: "0.6rem 0.7rem",
  border: "1px solid #cbd5e1",
  borderRadius: "0.5rem",
  background: "white",
  color: "#1e293b",
  font: "inherit",
  fontSize: "0.875rem",
};