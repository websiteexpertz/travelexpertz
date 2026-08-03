"use client";

import React, { useState, useEffect, useRef } from "react";

interface PropertyOwner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  verified?: boolean;
}

interface PropertyOwnerSelectProps {
  value: string | null;
  onChange: (owner: PropertyOwner | null) => void;
  onError?: (error: string) => void;
}

export default function PropertyOwnerSelect({
  value,
  onChange,
  onError,
}: PropertyOwnerSelectProps) {
  const [owners, setOwners] = useState<PropertyOwner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<PropertyOwner[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<PropertyOwner | null>(
    null,
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch property owners on mount
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/property-owners", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              `HTTP ${response.status}: Failed to fetch property owners`,
          );
        }

        const data = await response.json();
        setOwners(data);
        setFilteredOwners(data);

        // If value is provided, set selected owner
        if (value) {
          const selected = data.find(
            (owner: PropertyOwner) => owner._id === value,
          );
          if (selected) {
            setSelectedOwner(selected);
          }
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch owners";
        console.error("PropertyOwnerSelect error:", message);
        onError?.(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwners();
  }, [value, onError]);

  // Handle search filtering
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOwners(owners);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = owners.filter(
      (owner) =>
        owner.name.toLowerCase().includes(term) ||
        owner.email.toLowerCase().includes(term) ||
        owner.phone.includes(term),
    );

    setFilteredOwners(filtered);
  }, [searchTerm, owners]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (owner: PropertyOwner) => {
    setSelectedOwner(owner);
    onChange(owner);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    setSelectedOwner(null);
    onChange(null);
    setSearchTerm("");
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
      {/* Search Input */}
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input
          type="text"
          placeholder={
            selectedOwner ? selectedOwner.name : "Search property owners..."
          }
          value={isOpen ? searchTerm : ""}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm("");
          }}
          onClick={() => setIsOpen(true)}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: "0.75rem",
            border: isOpen ? "2px solid #0B6DFF" : "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "0.95rem",
            backgroundColor: isLoading ? "#f9fafb" : "white",
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
          }}
        />
        {selectedOwner && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              padding: "0.5rem 0.75rem",
              backgroundColor: "#f3f4f6",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              cursor: "pointer",
              color: "#6b7280",
              fontSize: "0.85rem",
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "0.5rem",
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            maxHeight: "300px",
            overflowY: "auto",
            zIndex: 50,
          }}
        >
          {isLoading ? (
            <div
              style={{ padding: "1rem", textAlign: "center", color: "#9ca3af" }}
            >
              Loading...
            </div>
          ) : filteredOwners.length > 0 ? (
            filteredOwners.map((owner) => (
              <div
                key={owner._id}
                onClick={() => handleSelect(owner)}
                style={{
                  padding: "0.75rem 1rem",
                  cursor: "pointer",
                  backgroundColor:
                    selectedOwner?._id === owner._id ? "#eff6ff" : "white",
                  borderBottom: "1px solid #f3f4f6",
                  transition: "backgroundColor 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    selectedOwner?._id === owner._id ? "#eff6ff" : "white";
                }}
              >
                <div style={{ fontWeight: 600, color: "#1f2937" }}>
                  {owner.name}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                  {owner.email}
                </div>
                {owner.phone && (
                  <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                    {owner.phone}
                  </div>
                )}
                {owner.verified && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#10b981",
                      marginTop: "0.25rem",
                    }}
                  >
                    ✓ Verified
                  </div>
                )}
              </div>
            ))
          ) : (
            <div
              style={{ padding: "1rem", textAlign: "center", color: "#9ca3af" }}
            >
              No property owners found
            </div>
          )}
        </div>
      )}

      {/* Hidden input for form submission */}
      <input type="hidden" value={selectedOwner?._id || ""} />
    </div>
  );
}
