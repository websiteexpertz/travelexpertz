"use client";

import React, { useEffect, useState, useCallback, ChangeEvent, FormEvent } from "react";

interface LocationItem {
  id: string;
  name: string;
  countryId?: string;
  stateName?: string;
  active?: boolean;
}

interface HeroSlide {
  _id: string;
  countryId: string;
  countryName: string;
  stateId: string;
  stateName: string;
  cityId?: string | null;
  cityName?: string;
  locationType?: "STATE" | "CITY";
  destinationName: string;
  tagline: string;
  description: string;
  imageUrl: string;
  imagePublicId?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface SlideFormData {
  destinationName: string;
  tagline: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  imageUrl: string;
}

const emptyFormData: SlideFormData = {
  destinationName: "",
  tagline: "",
  description: "",
  displayOrder: 1,
  isActive: true,
  imageUrl: "",
};

export default function HeroBannersAdmin() {
  // Tabs: State Hero Banners vs City Hero Banners
  const [activeTab, setActiveTab] = useState<"state" | "city">("state");

  // Location selectors
  const [countries, setCountries] = useState<LocationItem[]>([{ id: "india", name: "India" }]);
  const [states, setStates] = useState<LocationItem[]>([]);
  const [cities, setCities] = useState<LocationItem[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<string>("India");
  const [selectedState, setSelectedState] = useState<string>("Uttarakhand");
  const [selectedCity, setSelectedCity] = useState<string>("Dehradun");

  // Slide list state
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Slide Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SlideFormData>(emptyFormData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>("");

  // City Management Modals
  const [isCityModalOpen, setIsCityModalOpen] = useState<boolean>(false);
  const [isEditingCity, setIsEditingCity] = useState<boolean>(false);
  const [cityFormData, setCityFormData] = useState<{ id?: string; name: string; active: boolean }>({
    name: "",
    active: true,
  });
  const [isSavingCity, setIsSavingCity] = useState<boolean>(false);

  // Quick Live Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [previewSlideIndex, setPreviewSlideIndex] = useState<number>(0);

  // 1. Fetch available countries & states
  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch("/api/admin/hero-banners/locations");
        if (res.ok) {
          const data = await res.json();
          if (data.countries && data.countries.length > 0) {
            setCountries(data.countries);
          }
          if (data.states && data.states.length > 0) {
            setStates(data.states);
            const hasUttarakhand = data.states.some((s: LocationItem) => s.name === "Uttarakhand");
            if (hasUttarakhand) {
              setSelectedState("Uttarakhand");
            } else {
              setSelectedState(data.states[0].name);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load locations:", err);
      }
    }
    fetchLocations();
  }, []);

  // 2. Fetch cities when selectedState changes
  const fetchCitiesForState = useCallback(async (stateName: string) => {
    if (!stateName) return;
    try {
      const res = await fetch(`/api/admin/hero-banners/locations?state=${encodeURIComponent(stateName)}`);
      if (res.ok) {
        const data = await res.json();
        const cityList: LocationItem[] = data.cities || [];
        setCities(cityList);

        // Auto select Dehradun if available, else first city or default
        if (cityList.length > 0) {
          const hasDehradun = cityList.some((c) => c.name.toLowerCase() === "dehradun");
          if (hasDehradun) {
            setSelectedCity("Dehradun");
          } else {
            setSelectedCity(cityList[0].name);
          }
        } else {
          setSelectedCity("Dehradun");
        }
      }
    } catch (err) {
      console.error("Failed to load cities for state:", err);
    }
  }, []);

  useEffect(() => {
    if (selectedState) {
      fetchCitiesForState(selectedState);
    }
  }, [selectedState, fetchCitiesForState]);

  // 3. Fetch slides when location or tab changes
  const fetchSlides = useCallback(
    async (tab: "state" | "city", countryName: string, stateName: string, cityName: string) => {
      if (!stateName) return;
      setIsLoading(true);
      setErrorMessage("");
      try {
        let url = `/api/admin/hero-banners?country=${encodeURIComponent(countryName)}&state=${encodeURIComponent(stateName)}`;
        if (tab === "city") {
          url += `&city=${encodeURIComponent(cityName)}&type=CITY`;
        } else {
          url += `&type=STATE`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setSlides(data.slides || []);
          setActiveCount(data.activeCount || 0);
        } else {
          setSlides([]);
          setActiveCount(0);
        }
      } catch (err) {
        console.error("Failed to load slides:", err);
        setErrorMessage("Could not load hero slides. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedState) {
      fetchSlides(activeTab, selectedCountry, selectedState, selectedCity);
    }
  }, [activeTab, selectedCountry, selectedState, selectedCity, fetchSlides]);

  // Handle image file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Invalid image format. Please select a JPG, PNG, or WebP file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File exceeds maximum allowed size of 10MB.");
      return;
    }

    setSelectedFile(file);
    setFilePreviewUrl(URL.createObjectURL(file));
    setErrorMessage("");
  };

  // Open modal for new slide
  const handleOpenAddModal = () => {
    setEditingSlideId(null);
    setFormData({
      ...emptyFormData,
      displayOrder: Math.min(5, slides.length + 1),
      isActive: activeCount < 5,
    });
    setSelectedFile(null);
    setFilePreviewUrl("");
    setErrorMessage("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  // Open modal for edit slide
  const handleOpenEditModal = (slide: HeroSlide) => {
    setEditingSlideId(slide._id);
    setFormData({
      destinationName: slide.destinationName,
      tagline: slide.tagline,
      description: slide.description,
      displayOrder: slide.displayOrder,
      isActive: slide.isActive,
      imageUrl: slide.imageUrl,
    });
    setSelectedFile(null);
    setFilePreviewUrl(slide.imageUrl);
    setErrorMessage("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  // Submit slide form
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.destinationName.trim()) {
      setErrorMessage("Destination Name is required (e.g. Rishikesh – Ganga Valley, Uttarakhand).");
      return;
    }
    if (!formData.tagline.trim()) {
      setErrorMessage("Destination Tagline is required (e.g. The Yoga Capital of the World).");
      return;
    }
    if (!formData.description.trim()) {
      setErrorMessage("Destination Description is required.");
      return;
    }
    if (!selectedFile && !formData.imageUrl) {
      setErrorMessage("Please upload a hero photograph or provide an image URL.");
      return;
    }

    // Client-side check for 5 active slides limit
    if (formData.isActive) {
      const isActivatingExisting =
        editingSlideId && slides.find((s) => s._id === editingSlideId)?.isActive === false;
      const isNewActive = !editingSlideId;

      if ((isNewActive || isActivatingExisting) && activeCount >= 5) {
        const targetEntity = activeTab === "city" ? selectedCity : selectedState;
        setErrorMessage(
          `Maximum 5 active slides allowed for ${targetEntity}. Please deactivate another slide first or set this slide to Inactive.`
        );
        return;
      }
    }

    setIsSaving(true);
    try {
      const formPayload = new FormData();
      formPayload.append("countryName", selectedCountry);
      formPayload.append("stateName", selectedState);
      if (activeTab === "city") {
        formPayload.append("cityName", selectedCity);
        formPayload.append("locationType", "CITY");
      } else {
        formPayload.append("locationType", "STATE");
      }
      formPayload.append("destinationName", formData.destinationName);
      formPayload.append("tagline", formData.tagline);
      formPayload.append("description", formData.description);
      formPayload.append("displayOrder", String(formData.displayOrder));
      formPayload.append("isActive", String(formData.isActive));

      if (selectedFile) {
        formPayload.append("image", selectedFile);
      } else if (formData.imageUrl) {
        formPayload.append("imageUrl", formData.imageUrl);
      }

      const url = editingSlideId
        ? `/api/admin/hero-banners/${editingSlideId}`
        : "/api/admin/hero-banners";
      const method = editingSlideId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formPayload,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save hero slide.");
      }

      setSuccessMessage(
        editingSlideId
          ? "Hero slide updated successfully!"
          : "New hero slide uploaded and saved successfully!"
      );
      setIsModalOpen(false);
      await fetchSlides(activeTab, selectedCountry, selectedState, selectedCity);
    } catch (err: unknown) {
      console.error("Save error:", err);
      const msg = err instanceof Error ? err.message : "Failed to save slide.";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle slide active/inactive
  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      const res = await fetch(`/api/admin/hero-banners/${slide._id}/toggle`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to toggle status.");
        return;
      }
      await fetchSlides(activeTab, selectedCountry, selectedState, selectedCity);
    } catch (err) {
      console.error("Toggle error:", err);
      alert("Failed to toggle slide status.");
    }
  };

  // Delete slide
  const handleDeleteSlide = async (slide: HeroSlide) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete the hero slide for "${slide.destinationName}"?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/hero-banners/${slide._id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete slide.");
      }
      setSuccessMessage("Slide deleted successfully.");
      await fetchSlides(activeTab, selectedCountry, selectedState, selectedCity);
    } catch (err: unknown) {
      console.error("Delete error:", err);
      const msg = err instanceof Error ? err.message : "Failed to delete slide.";
      alert(msg);
    }
  };

  // Reorder slide up/down
  const handleMoveOrder = async (slideIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? slideIndex - 1 : slideIndex + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const newSlides = [...slides];
    const current = newSlides[slideIndex];
    const target = newSlides[targetIndex];

    const tempOrder = current.displayOrder;
    current.displayOrder = target.displayOrder;
    target.displayOrder = tempOrder;

    setSlides(newSlides);

    try {
      await fetch("/api/admin/hero-banners/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orders: [
            { id: current._id, displayOrder: current.displayOrder },
            { id: target._id, displayOrder: target.displayOrder },
          ],
        }),
      });
      await fetchSlides(activeTab, selectedCountry, selectedState, selectedCity);
    } catch (err) {
      console.error("Reorder error:", err);
      await fetchSlides(activeTab, selectedCountry, selectedState, selectedCity);
    }
  };

  // City Management: Add New City
  const handleOpenAddCityModal = () => {
    setIsEditingCity(false);
    setCityFormData({ name: "", active: true });
    setIsCityModalOpen(true);
  };

  // City Management: Edit Current City
  const handleOpenEditCityModal = () => {
    const currentCityObj = cities.find((c) => c.name === selectedCity);
    setIsEditingCity(true);
    setCityFormData({
      id: currentCityObj?.id,
      name: selectedCity,
      active: currentCityObj?.active !== false,
    });
    setIsCityModalOpen(true);
  };

  // City Management: Submit Add/Edit City
  const handleCityFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!cityFormData.name.trim()) {
      alert("City name cannot be empty.");
      return;
    }

    setIsSavingCity(true);
    try {
      if (isEditingCity && cityFormData.id) {
        // PUT update
        const res = await fetch(`/api/admin/cities/${cityFormData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cityName: cityFormData.name.trim(),
            active: cityFormData.active,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update city.");

        setSuccessMessage(`City "${cityFormData.name.trim()}" updated successfully!`);
        setSelectedCity(cityFormData.name.trim());
      } else {
        // POST create
        const res = await fetch("/api/admin/cities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cityName: cityFormData.name.trim(),
            stateName: selectedState,
            countryName: selectedCountry,
            active: cityFormData.active,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create city.");

        setSuccessMessage(`City "${cityFormData.name.trim()}" created successfully!`);
        setSelectedCity(cityFormData.name.trim());
      }

      setIsCityModalOpen(false);
      await fetchCitiesForState(selectedState);
    } catch (err: any) {
      console.error("City save error:", err);
      alert(err.message || "Failed to save city.");
    } finally {
      setIsSavingCity(false);
    }
  };

  // City Management: Delete Current City
  const handleDeleteCurrentCity = async () => {
    const currentCityObj = cities.find((c) => c.name === selectedCity);
    if (!currentCityObj?.id) {
      alert("Please select a valid city to delete.");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete "${selectedCity}" from ${selectedState}? This will only succeed if no properties are currently linked to this city.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/cities/${currentCityObj.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Cannot delete city: linked properties or slides exist.");
        return;
      }
      setSuccessMessage(`City "${selectedCity}" deleted successfully.`);
      await fetchCitiesForState(selectedState);
    } catch (err: any) {
      console.error("Delete city error:", err);
      alert(err.message || "Failed to delete city.");
    }
  };

  const currentPreviewSlide = slides[previewSlideIndex] || slides[0];

  return (
    <div
      style={{
        padding: "2rem",
        paddingTop: "2.5rem",
        maxWidth: "1400px",
        margin: "0 auto",
        minHeight: "100vh",
        background: "#f9fafb",
      }}
    >
      {/* Top Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          padding: "1.5rem 2rem",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#ffffff",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <span className="material-symbols-outlined" style={{ color: "#F2C65D" }}>
              photo_library
            </span>
            Hero Banners Management
          </h1>
          <p style={{ margin: "0.35rem 0 0", color: "#94a3b8", fontSize: "0.9rem" }}>
            Upload, customize, and reorder cinematic hero slides for States and Cities.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {slides.length > 0 && (
            <button
              onClick={() => {
                setPreviewSlideIndex(0);
                setIsPreviewOpen(true);
              }}
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                padding: "0.75rem 1.25rem",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.2s ease",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "1.2rem", color: "#F2C65D" }}>
                visibility
              </span>
              Quick Live Preview
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            style={{
              background: "linear-gradient(135deg, #F2C65D 0%, #D4A017 100%)",
              color: "#1e293b",
              padding: "0.75rem 1.5rem",
              borderRadius: "12px",
              border: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 15px rgba(242, 198, 93, 0.4)",
              transition: "all 0.2s ease",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>
              add_photo_alternate
            </span>
            Upload Hero Image
          </button>
        </div>
      </div>

      {/* TABS: State Hero Banners vs City Hero Banners */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          borderBottom: "2px solid #e2e8f0",
          marginBottom: "1.75rem",
        }}
      >
        <button
          onClick={() => setActiveTab("state")}
          style={{
            padding: "0.85rem 1.75rem",
            fontSize: "1rem",
            fontWeight: 700,
            cursor: "pointer",
            background: "none",
            border: "none",
            borderBottom: activeTab === "state" ? "3px solid #F2C65D" : "3px solid transparent",
            color: activeTab === "state" ? "#0f172a" : "#64748b",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "-2px",
            transition: "all 0.15s ease",
          }}
        >
          <span className="material-symbols-outlined" style={{ color: activeTab === "state" ? "#d97706" : "#94a3b8" }}>
            map
          </span>
          State Hero Banners
        </button>

        <button
          onClick={() => setActiveTab("city")}
          style={{
            padding: "0.85rem 1.75rem",
            fontSize: "1rem",
            fontWeight: 700,
            cursor: "pointer",
            background: "none",
            border: "none",
            borderBottom: activeTab === "city" ? "3px solid #F2C65D" : "3px solid transparent",
            color: activeTab === "city" ? "#0f172a" : "#64748b",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "-2px",
            transition: "all 0.15s ease",
          }}
        >
          <span className="material-symbols-outlined" style={{ color: activeTab === "city" ? "#d97706" : "#94a3b8" }}>
            location_city
          </span>
          City Hero Banners
        </button>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "12px",
            color: "#991b1b",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <span className="material-symbols-outlined">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "#dcfce7",
            border: "1px solid #86efac",
            borderRadius: "12px",
            color: "#166534",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <span className="material-symbols-outlined">check_circle</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Location Selectors Card (Hierarchy: Country -> State -> City) */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "1.5rem 2rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          marginBottom: "2rem",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              activeTab === "city"
                ? "repeat(auto-fit, minmax(240px, 1fr))"
                : "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.25rem",
            alignItems: "flex-end",
          }}
        >
          {/* Country Selection */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "0.5rem",
              }}
            >
              Select Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                border: "1.5px solid #cbd5e1",
                fontSize: "0.95rem",
                backgroundColor: "#ffffff",
                color: "#1e293b",
                fontWeight: 500,
              }}
            >
              {countries.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* State Selection */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "0.5rem",
              }}
            >
              Select State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                border: "1.5px solid #cbd5e1",
                fontSize: "0.95rem",
                backgroundColor: "#ffffff",
                color: "#1e293b",
                fontWeight: 500,
              }}
            >
              {states.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Selection (Only in City Hero Tab) */}
          {activeTab === "city" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                <label
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#475569",
                  }}
                >
                  Select City
                </label>
                <button
                  type="button"
                  onClick={handleOpenAddCityModal}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.2rem",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>
                    add
                  </span>
                  Add City
                </button>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.95rem",
                    backgroundColor: "#ffffff",
                    color: "#1e293b",
                    fontWeight: 600,
                  }}
                >
                  {cities.map((c) => (
                    <option key={c.id || c.name} value={c.name}>
                      {c.name} {c.active === false ? "(Inactive)" : ""}
                    </option>
                  ))}
                  {cities.length === 0 && <option value="Dehradun">Dehradun</option>}
                </select>

                <button
                  type="button"
                  onClick={handleOpenEditCityModal}
                  title="Edit Selected City"
                  style={{
                    padding: "0.75rem",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    color: "#475569",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>
                    edit
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteCurrentCity}
                  title="Delete Selected City"
                  style={{
                    padding: "0.75rem",
                    borderRadius: "10px",
                    border: "1px solid #fecaca",
                    background: "#fee2e2",
                    color: "#dc2626",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>
                    delete
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Active Status Badge */}
          <div
            style={{
              padding: "0.75rem 1.25rem",
              borderRadius: "12px",
              background: activeCount >= 5 ? "#fef3c7" : "#ecfdf5",
              border: `1px solid ${activeCount >= 5 ? "#fde68a" : "#a7f3d0"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                {activeTab === "city" ? `${selectedCity.toUpperCase()} SLIDES` : `${selectedState.toUpperCase()} SLIDES`}
              </div>
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: activeCount >= 5 ? "#b45309" : "#047857",
                }}
              >
                {activeCount} / 5 active
              </div>
            </div>
            <span
              style={{
                fontSize: "0.8rem",
                padding: "0.25rem 0.6rem",
                borderRadius: "9999px",
                background: activeCount >= 5 ? "#f59e0b" : "#10b981",
                color: "#ffffff",
                fontWeight: 600,
              }}
            >
              {activeCount >= 5 ? "Full (Max 5)" : `${5 - activeCount} slots open`}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Banners Grid / List */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "1.5rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "1.25rem",
            borderBottom: "1px solid #e2e8f0",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#1e293b",
              }}
            >
              Hero Slides for {activeTab === "city" ? `${selectedCity}, ${selectedState}` : selectedState} ({slides.length})
            </h2>
            <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
              {activeTab === "city"
                ? `When users search for ${selectedCity}, these hero slides take priority over the state fallback.`
                : `Active slides for ${selectedState} will be displayed on the property search page when state is searched.`}
            </p>
          </div>

          <a
            href={
              activeTab === "city"
                ? `/hotels/search?location=${encodeURIComponent(selectedCity + ", " + selectedState)}`
                : `/hotels/search?location=${encodeURIComponent(selectedState)}`
            }
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#2563eb",
              textDecoration: "none",
              padding: "0.5rem 0.9rem",
              borderRadius: "8px",
              border: "1px solid #bfdbfe",
              background: "#eff6ff",
            }}
          >
            <span>Preview Search Page</span>
            <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>
              open_in_new
            </span>
          </a>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "#64748b" }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "2.5rem", animation: "spin 1s linear infinite" }}
            >
              refresh
            </span>
            <p style={{ marginTop: "0.5rem" }}>
              Loading {activeTab === "city" ? selectedCity : selectedState} hero slides...
            </p>
          </div>
        ) : slides.length === 0 ? (
          /* Empty State */
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              background: "#f8fafc",
              borderRadius: "12px",
              border: "2px dashed #cbd5e1",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "3rem", color: "#94a3b8" }}
            >
              landscape
            </span>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#334155", margin: "0.75rem 0 0.25rem" }}>
              No hero slides configured for {activeTab === "city" ? selectedCity : selectedState}
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.9rem", maxWidth: "450px", margin: "0 auto 1.5rem" }}>
              {activeTab === "city"
                ? `When no custom city slides are active, YatraExpertz automatically falls back to ${selectedState}'s state slides.`
                : `When no custom slides are active, YatraExpertz shows the generic destination banner. Click below to add the first slide!`}
            </p>
            <button
              onClick={handleOpenAddModal}
              style={{
                background: "#0f172a",
                color: "#ffffff",
                padding: "0.6rem 1.25rem",
                borderRadius: "10px",
                border: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              + Add First Slide for {activeTab === "city" ? selectedCity : selectedState}
            </button>
          </div>
        ) : (
          /* Slides Grid / List */
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {slides.map((slide, index) => (
              <div
                key={slide._id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "180px 1fr auto",
                  gap: "1.5rem",
                  padding: "1.25rem",
                  borderRadius: "14px",
                  background: slide.isActive ? "#ffffff" : "#f8fafc",
                  border: `1.5px solid ${slide.isActive ? "#e2e8f0" : "#f1f5f9"}`,
                  boxShadow: slide.isActive ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
                  alignItems: "center",
                  opacity: slide.isActive ? 1 : 0.75,
                }}
              >
                {/* Thumbnail Preview */}
                <div
                  style={{
                    position: "relative",
                    width: "180px",
                    height: "110px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    backgroundColor: "#0f172a",
                  }}
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.destinationName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {/* Order Badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "6px",
                      left: "6px",
                      background: "rgba(15, 23, 42, 0.8)",
                      color: "#F2C65D",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      padding: "2px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    #{slide.displayOrder}
                  </div>
                </div>

                {/* Content Details */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <span style={{ fontSize: "1rem" }}>📍</span>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      {slide.destinationName}
                    </h3>
                  </div>

                  <div
                    style={{
                      fontFamily: "Georgia, serif",
                      fontStyle: "italic",
                      color: "#b45309",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    &ldquo;{slide.tagline}&rdquo;
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      color: "#64748b",
                      lineHeight: "1.5",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {slide.description}
                  </p>
                </div>

                {/* Actions & Status */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "0.75rem",
                  }}
                >
                  {/* Status Toggle Badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: slide.isActive ? "#15803d" : "#64748b",
                      }}
                    >
                      {slide.isActive ? "Active" : "Inactive"}
                    </span>
                    <button
                      onClick={() => handleToggleActive(slide)}
                      style={{
                        background: slide.isActive ? "#10b981" : "#cbd5e1",
                        border: "none",
                        width: "44px",
                        height: "24px",
                        borderRadius: "12px",
                        position: "relative",
                        cursor: "pointer",
                        transition: "background 0.2s ease",
                      }}
                      title={slide.isActive ? "Deactivate slide" : "Activate slide"}
                    >
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          background: "#ffffff",
                          position: "absolute",
                          top: "3px",
                          left: slide.isActive ? "23px" : "3px",
                          transition: "left 0.2s ease",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      />
                    </button>
                  </div>

                  {/* Reorder Up/Down */}
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <button
                      onClick={() => handleMoveOrder(index, "up")}
                      disabled={index === 0}
                      style={{
                        padding: "0.3rem 0.5rem",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        background: index === 0 ? "#f1f5f9" : "#ffffff",
                        color: index === 0 ? "#cbd5e1" : "#334155",
                        cursor: index === 0 ? "not-allowed" : "pointer",
                        fontSize: "0.8rem",
                      }}
                      title="Move slide up"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleMoveOrder(index, "down")}
                      disabled={index === slides.length - 1}
                      style={{
                        padding: "0.3rem 0.5rem",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        background: index === slides.length - 1 ? "#f1f5f9" : "#ffffff",
                        color: index === slides.length - 1 ? "#cbd5e1" : "#334155",
                        cursor: index === slides.length - 1 ? "not-allowed" : "pointer",
                        fontSize: "0.8rem",
                      }}
                      title="Move slide down"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Edit / Delete Buttons */}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => handleOpenEditModal(slide)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: "0.4rem 0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#0f172a",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>
                        edit
                      </span>
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteSlide(slide)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: "0.4rem 0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #fecaca",
                        background: "#fee2e2",
                        color: "#dc2626",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>
                        delete
                      </span>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: UPLOAD / EDIT HERO SLIDE
          ========================================================================= */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              maxWidth: "680px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "1.25rem 1.75rem",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#0f172a",
                borderTopLeftRadius: "20px",
                borderTopRightRadius: "20px",
                color: "#ffffff",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span className="material-symbols-outlined" style={{ color: "#F2C65D" }}>
                  {editingSlideId ? "edit" : "add_photo_alternate"}
                </span>
                {editingSlideId
                  ? "Edit Hero Slide"
                  : activeTab === "city"
                  ? `Upload Hero Image for ${selectedCity}, ${selectedState}`
                  : `Upload Hero Image for ${selectedState}`}
              </h2>

              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "1.5rem",
                  padding: "0.25rem",
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} style={{ padding: "1.75rem" }}>
              {/* Hierarchy Display (Read-only reference) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: activeTab === "city" ? "1fr 1fr 1fr" : "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.25rem",
                }}
              >
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "0.35rem" }}>
                    Country
                  </label>
                  <input
                    type="text"
                    value={selectedCountry}
                    disabled
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.9rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#f1f5f9",
                      color: "#64748b",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "0.35rem" }}>
                    State
                  </label>
                  <input
                    type="text"
                    value={selectedState}
                    disabled
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.9rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#f1f5f9",
                      color: "#64748b",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
                {activeTab === "city" && (
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "0.35rem" }}>
                      City
                    </label>
                    <input
                      type="text"
                      value={selectedCity}
                      disabled
                      style={{
                        width: "100%",
                        padding: "0.65rem 0.9rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        background: "#f1f5f9",
                        color: "#64748b",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Destination Name */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.35rem" }}>
                  Destination Location & Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder={
                    activeTab === "city"
                      ? `e.g. Robber's Cave – ${selectedCity}, ${selectedState}`
                      : `e.g. Rishikesh – Ganga Valley, ${selectedState}`
                  }
                  value={formData.destinationName}
                  onChange={(e) => setFormData({ ...formData, destinationName: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.95rem",
                  }}
                />
                <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem", display: "block" }}>
                  Displayed alongside the location pin icon on the right side of the hero banner.
                </span>
              </div>

              {/* Tagline */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.35rem" }}>
                  Destination Tagline <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder={
                    activeTab === "city"
                      ? "e.g. The Hidden Wonder of the Doon Valley"
                      : "e.g. The Yoga Capital of the World"
                  }
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.95rem",
                    color: "#b45309",
                    fontWeight: 600,
                  }}
                />
                <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem", display: "block" }}>
                  Rendered in golden italic serif typography below the gold divider.
                </span>
              </div>

              {/* Description */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.35rem" }}>
                  Destination Description <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    activeTab === "city"
                      ? "e.g. Discover the natural beauty of Robber's Cave, where cool streams flow through narrow limestone formations..."
                      : "e.g. Where the Ganges rushes down from the Himalayas, Rishikesh beckons with sacred ghats, thrilling white-water rafting..."
                  }
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.95rem",
                    fontFamily: "inherit",
                    lineHeight: "1.5",
                  }}
                />
                <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem", display: "block" }}>
                  Rendered on the right side over the cinematic dark gradient.
                </span>
              </div>

              {/* Hero Image Upload & Preview */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.35rem" }}>
                  Hero Image <span style={{ color: "#ef4444" }}>*</span>
                </label>

                <div
                  style={{
                    border: "2px dashed #cbd5e1",
                    borderRadius: "12px",
                    padding: "1.25rem",
                    textAlign: "center",
                    backgroundColor: "#f8fafc",
                    marginBottom: "0.75rem",
                  }}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    id="hero-file-input"
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="hero-file-input"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.6rem 1.25rem",
                      borderRadius: "8px",
                      background: "#0f172a",
                      color: "#ffffff",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>
                      cloud_upload
                    </span>
                    Choose Photograph (JPG, PNG, WebP)
                  </label>
                  <p style={{ margin: "0.5rem 0 0", color: "#64748b", fontSize: "0.75rem" }}>
                    Recommended dimensions: 1920 × 1080 px • Max file size: 10MB
                  </p>
                </div>

                {/* Image Preview Box */}
                {filePreviewUrl && (
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "180px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      border: "1px solid #cbd5e1",
                      backgroundColor: "#0f172a",
                    }}
                  >
                    <img
                      src={filePreviewUrl}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "8px",
                        left: "8px",
                        background: "rgba(15, 23, 42, 0.75)",
                        color: "#ffffff",
                        fontSize: "0.75rem",
                        padding: "3px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      Image Preview
                    </div>
                  </div>
                )}
              </div>

              {/* Display Order & Active Status */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.25rem",
                  marginBottom: "1.75rem",
                  alignItems: "center",
                }}
              >
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.35rem" }}>
                    Display Order (1 to 5)
                  </label>
                  <select
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 1 })}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.9rem",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        Slide #{num}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.35rem" }}>
                    Status
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      cursor: "pointer",
                      padding: "0.6rem 0.9rem",
                      borderRadius: "8px",
                      background: formData.isActive ? "#ecfdf5" : "#f1f5f9",
                      border: `1.5px solid ${formData.isActive ? "#10b981" : "#cbd5e1"}`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{ width: "18px", height: "18px", cursor: "pointer" }}
                    />
                    <span style={{ fontWeight: 600, fontSize: "0.9rem", color: formData.isActive ? "#047857" : "#64748b" }}>
                      {formData.isActive ? "Active (Visible in hero)" : "Inactive (Draft/Seasonal)"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  style={{
                    padding: "0.75rem 1.25rem",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#475569",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    padding: "0.75rem 1.75rem",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #F2C65D 0%, #D4A017 100%)",
                    color: "#0f172a",
                    fontWeight: 700,
                    cursor: isSaving ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 12px rgba(242, 198, 93, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {isSaving && (
                    <span className="material-symbols-outlined" style={{ animation: "spin 1s linear infinite" }}>
                      refresh
                    </span>
                  )}
                  {isSaving ? "Saving..." : editingSlideId ? "Save Changes" : "Save & Publish Slide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT CITY
          ========================================================================= */}
      {isCityModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            zIndex: 1060,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "480px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "1.25rem 1.5rem",
                background: "#0f172a",
                color: "#ffffff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="material-symbols-outlined" style={{ color: "#F2C65D" }}>
                  location_city
                </span>
                {isEditingCity ? `Edit City "${selectedCity}"` : `Add New City to ${selectedState}`}
              </h3>
              <button
                onClick={() => setIsCityModalOpen(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.25rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCityFormSubmit} style={{ padding: "1.5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "0.25rem" }}>
                  State (Parent)
                </label>
                <input
                  type="text"
                  value={selectedState}
                  disabled
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.9rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#f1f5f9",
                    color: "#64748b",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.35rem" }}>
                  City Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dehradun, Mussoorie, Rishikesh..."
                  value={cityFormData.name}
                  onChange={(e) => setCityFormData({ ...cityFormData, name: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    cursor: "pointer",
                    padding: "0.6rem 0.9rem",
                    borderRadius: "8px",
                    background: cityFormData.active ? "#ecfdf5" : "#f1f5f9",
                    border: `1.5px solid ${cityFormData.active ? "#10b981" : "#cbd5e1"}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={cityFormData.active}
                    onChange={(e) => setCityFormData({ ...cityFormData, active: e.target.checked })}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span style={{ fontWeight: 600, fontSize: "0.9rem", color: cityFormData.active ? "#047857" : "#64748b" }}>
                    {cityFormData.active ? "City is Active" : "City is Inactive"}
                  </span>
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setIsCityModalOpen(false)}
                  disabled={isSavingCity}
                  style={{
                    padding: "0.65rem 1.25rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#475569",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCity}
                  style={{
                    padding: "0.65rem 1.5rem",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #F2C65D 0%, #D4A017 100%)",
                    color: "#0f172a",
                    fontWeight: 700,
                    cursor: isSavingCity ? "not-allowed" : "pointer",
                  }}
                >
                  {isSavingCity ? "Saving..." : isEditingCity ? "Update City" : "Add City"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: QUICK LIVE HERO PREVIEW
          ========================================================================= */}
      {isPreviewOpen && currentPreviewSlide && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.85)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            style={{
              background: "#0f172a",
              borderRadius: "20px",
              maxWidth: "1280px",
              width: "100%",
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Preview Top Bar */}
            <div
              style={{
                padding: "1rem 1.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span className="material-symbols-outlined" style={{ color: "#F2C65D" }}>
                  preview
                </span>
                <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                  Hero Banner Preview • {activeTab === "city" ? `${selectedCity}, ${selectedState}` : selectedState}
                </span>
                <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                  (Slide {previewSlideIndex + 1} of {slides.length})
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPreviewSlideIndex(i)}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "6px",
                      border: "none",
                      background: previewSlideIndex === i ? "#F2C65D" : "rgba(255,255,255,0.15)",
                      color: previewSlideIndex === i ? "#0f172a" : "#ffffff",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  style={{
                    marginLeft: "1rem",
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    fontSize: "1.5rem",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Exact Hero Banner Presentation (560px height, right-side content, gold divider) */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "560px",
                overflow: "hidden",
                backgroundColor: "#020617",
              }}
            >
              {/* Background Image */}
              <img
                src={currentPreviewSlide.imageUrl}
                alt={currentPreviewSlide.destinationName}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />

              {/* Exact Dark Gradient Overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 40%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.45) 100%), linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.05) 80%)",
                }}
              />

              {/* Top Accent Line */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: "linear-gradient(90deg, #F2C65D, #ffffff, #F2C65D)",
                  zIndex: 10,
                }}
              />

              {/* Content Grid */}
              <div
                style={{
                  position: "relative",
                  zIndex: 10,
                  height: "100%",
                  maxWidth: "1400px",
                  margin: "0 auto",
                  padding: "2rem 2.5rem",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  boxSizing: "border-box",
                }}
              >
                {/* Left Side: Destination Overview */}
                <div style={{ maxWidth: "600px", flex: "1 1 360px" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.35rem 0.85rem",
                      borderRadius: "9999px",
                      background: "rgba(242, 198, 93, 0.15)",
                      border: "1px solid rgba(242, 198, 93, 0.4)",
                      color: "#F2C65D",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      marginBottom: "0.75rem",
                    }}
                  >
                    <span>🇮🇳</span>
                    <span>{selectedCountry}</span>
                    <span>›</span>
                    <span>{selectedState}</span>
                    {activeTab === "city" && (
                      <>
                        <span>›</span>
                        <span style={{ color: "#ffffff" }}>{selectedCity}</span>
                      </>
                    )}
                  </div>

                  <h1
                    style={{
                      color: "#ffffff",
                      fontSize: "2.4rem",
                      fontWeight: 800,
                      lineHeight: 1.15,
                      margin: "0 0 0.5rem",
                      textShadow: "0 4px 20px rgba(0,0,0,0.8)",
                    }}
                  >
                    Explore Stays in {activeTab === "city" ? selectedCity : selectedState}
                  </h1>

                  <p
                    style={{
                      color: "rgba(255,255,255,0.85)",
                      fontSize: "0.95rem",
                      margin: 0,
                      textShadow: "0 2px 10px rgba(0,0,0,0.7)",
                    }}
                  >
                    Browse handpicked luxury villas, royal palaces, and boutique resorts across{" "}
                    {activeTab === "city" ? selectedCity : selectedState}.
                  </p>
                </div>

                {/* Right Side: Location, Gold Line, Italic Tagline, Description */}
                {currentPreviewSlide && (
                  <div
                    style={{
                      maxWidth: "460px",
                      flex: "1 1 320px",
                      textAlign: "left",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    {/* Location Pin & Name */}
                    {currentPreviewSlide.destinationName && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          color: "rgba(255, 255, 255, 0.95)",
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          textShadow: "0 2px 10px rgba(0, 0, 0, 0.8)",
                          marginBottom: "0.6rem",
                        }}
                      >
                        <span style={{ color: "#f87171", fontSize: "1.1rem" }}>📍</span>
                        <span>{currentPreviewSlide.destinationName}</span>
                      </div>
                    )}

                    {/* Golden Horizontal Divider Line */}
                    <div
                      style={{
                        width: "55px",
                        height: "1.5px",
                        backgroundColor: "#F2C65D",
                        marginBottom: "0.85rem",
                        borderRadius: "1px",
                        boxShadow: "0 0 6px rgba(242, 198, 93, 0.5)",
                      }}
                    />

                    {/* Tagline in Golden Italic Serif */}
                    {currentPreviewSlide.tagline && (
                      <h2
                        style={{
                          margin: "0 0 0.75rem 0",
                          fontFamily: "Georgia, 'Times New Roman', serif",
                          fontStyle: "italic",
                          color: "#F2C65D",
                          fontSize: "clamp(1.4rem, 2vw, 1.75rem)",
                          fontWeight: 400,
                          lineHeight: 1.3,
                          letterSpacing: "-0.01em",
                          textShadow: "0 2px 10px rgba(0, 0, 0, 0.8)",
                        }}
                      >
                        {currentPreviewSlide.tagline}
                      </h2>
                    )}

                    {/* Description */}
                    {currentPreviewSlide.description && (
                      <p
                        style={{
                          margin: 0,
                          color: "rgba(255, 255, 255, 0.85)",
                          fontSize: "0.875rem",
                          lineHeight: 1.6,
                          fontWeight: 300,
                          maxWidth: "440px",
                          textShadow: "0 2px 8px rgba(0, 0, 0, 0.8)",
                        }}
                      >
                        {currentPreviewSlide.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
