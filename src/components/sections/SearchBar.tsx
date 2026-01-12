/**
 * Search Bar Component - Main search component for homepage
 */

"use client";

import React, { useState } from "react";
import styles from "./SearchBar.module.css";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface SearchBarProps {
  onSearch?: (params: SearchParams) => void;
  variant?: "hero" | "compact";
}

interface SearchParams {
  location: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  variant = "hero",
}) => {
  const [params, setParams] = useState<SearchParams>({
    location: "",
    checkIn: "",
    checkOut: "",
    adults: 2,
    children: 0,
    rooms: 1,
  });

  const handleSearch = () => {
    onSearch?.(params);
  };

  const updateParam = (key: keyof SearchParams, value: any) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`${styles.searchBar} ${styles[variant]}`}>
      {/* Location */}
      <div className={styles.field}>
        <label className={styles.label}>📍 Location</label>
        <Input
          type="text"
          placeholder="City or destination"
          value={params.location}
          onChange={(e) => updateParam("location", e.target.value)}
          variant="default"
        />
      </div>

      {/* Check-in Date */}
      <div className={styles.field}>
        <label className={styles.label}>📅 Check-in</label>
        <Input
          type="date"
          value={params.checkIn}
          onChange={(e) => updateParam("checkIn", e.target.value)}
          variant="default"
        />
      </div>

      {/* Check-out Date */}
      <div className={styles.field}>
        <label className={styles.label}>📅 Check-out</label>
        <Input
          type="date"
          value={params.checkOut}
          onChange={(e) => updateParam("checkOut", e.target.value)}
          variant="default"
        />
      </div>

      {/* Adults */}
      <div className={styles.field}>
        <label className={styles.label}>👤 Adults</label>
        <select
          value={params.adults}
          onChange={(e) => updateParam("adults", parseInt(e.target.value))}
          className={styles.select}
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "Adult" : "Adults"}
            </option>
          ))}
        </select>
      </div>

      {/* Children */}
      <div className={styles.field}>
        <label className={styles.label}>👶 Children</label>
        <select
          value={params.children}
          onChange={(e) => updateParam("children", parseInt(e.target.value))}
          className={styles.select}
        >
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "Child" : "Children"}
            </option>
          ))}
        </select>
      </div>

      {/* Rooms */}
      <div className={styles.field}>
        <label className={styles.label}>🏠 Rooms</label>
        <select
          value={params.rooms}
          onChange={(e) => updateParam("rooms", parseInt(e.target.value))}
          className={styles.select}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "Room" : "Rooms"}
            </option>
          ))}
        </select>
      </div>

      {/* Search Button */}
      <Button
        variant="primary"
        onClick={handleSearch}
        className={styles.searchButton}
      >
        🔍 Search
      </Button>
    </div>
  );
};

export default SearchBar;
