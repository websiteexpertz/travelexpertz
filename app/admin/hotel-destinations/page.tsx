"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface DestinationItem {
  name: string;
  description: string;
  images: string[];
  profileImage?: string;
}

interface DestinationCategory {
  thingsToDo: DestinationItem[];
  famousCafes?: DestinationItem[];
  famousAttractions?: DestinationItem[];
  shopping?: DestinationItem[];
  topDestinations?: DestinationItem[];
  topAttractions?: DestinationItem[];
}

interface SubareaData extends DestinationCategory {
  name: string;
}

interface AreaData extends DestinationCategory {
  name: string;
  subareas: SubareaData[];
}

interface HotelDestinationHierarchy {
  _id?: string;
  stateName: string;
  stateProfileImage?: string;
  stateData: {
    topDestinations: DestinationItem[];
    topAttractions: DestinationItem[];
    thingsToDo: DestinationItem[];
  };
  cityName: string;
  cityData: {
    thingsToDo: DestinationItem[];
    famousCafes: DestinationItem[];
    famousAttractions: DestinationItem[];
    shopping: DestinationItem[];
  };
  areas: AreaData[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const emptyDestination: HotelDestinationHierarchy = {
  stateName: "",
  stateData: {
    topDestinations: [],
    topAttractions: [],
    thingsToDo: [],
  },
  cityName: "",
  cityData: {
    thingsToDo: [],
    famousCafes: [],
    famousAttractions: [],
    shopping: [],
  },
  areas: [],
  active: true,
};

const emptyDestinationItem: DestinationItem = {
  name: "",
  description: "",
  images: [],
};

export default function HotelDestinationsAdmin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [page, setPage] = useState<"list" | "form">(editId ? "form" : "list");
  const [destinations, setDestinations] = useState<HotelDestinationHierarchy[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] =
    useState<HotelDestinationHierarchy>(emptyDestination);
  const [saving, setSaving] = useState(false);

  // Tab states
  const [activeTab, setActiveTab] = useState<
    "state" | "city" | "areas" | "subareas"
  >("state");
  const [selectedAreaIdx, setSelectedAreaIdx] = useState(0);
  const [selectedSubareaIdx, setSelectedSubareaIdx] = useState(0);
  const [selectedCategory, setSelectedCategory] =
    useState<keyof DestinationCategory>("thingsToDo");
  const [selectedItemIdx, setSelectedItemIdx] = useState<number | null>(null);
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);

  // Form input states
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemImageFiles, setItemImageFiles] = useState<File[]>([]);
  const [itemImagePreviews, setItemImagePreviews] = useState<string[]>([]);
  const [itemProfileImageFile, setItemProfileImageFile] = useState<File | null>(
    null,
  );
  const [itemProfileImagePreview, setItemProfileImagePreview] =
    useState<string>("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");

  // Deprecated - kept for reference only, use itemImageFiles and itemImagePreviews instead
  // const [itemImageFile, setItemImageFile] = useState<File | null>(null);
  // const [itemImagePreview, setItemImagePreview] = useState("");

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    if (editId && destinations.length > 0) {
      const destination = destinations.find((d) => d._id === editId);
      if (destination) {
        setFormData(destination);
        if (destination.stateProfileImage) {
          setProfileImagePreview(destination.stateProfileImage);
        }
        setPage("form");
      }
    }
  }, [editId, destinations]);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hotel-destinations");
      const data = await res.json();
      setDestinations(data || []);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      alert("Failed to fetch destinations");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setFormData({ ...emptyDestination });
    setActiveTab("state");
    setSelectedAreaIdx(0);
    setSelectedSubareaIdx(0);
    setSelectedCategory("thingsToDo");
    setSelectedItemIdx(null);
    setItemName("");
    setItemDescription("");
    setItemImageFiles([]);
    setItemImagePreviews([]);
    setProfileImageFile(null);
    setProfileImagePreview("");
    setPage("form");
  };

  const handleEdit = (destination: HotelDestinationHierarchy) => {
    setFormData(destination);
    setActiveTab("state");
    setPage("form");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this destination?")) return;

    try {
      const res = await fetch(`/api/hotel-destinations?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDestinations((prev) => prev.filter((d) => d._id !== id));
        alert("Destination deleted successfully");
      } else {
        alert("Failed to delete destination");
      }
    } catch (error) {
      console.error("Error deleting destination:", error);
      alert("Error deleting destination");
    }
  };

  const getCurrentData = () => {
    if (activeTab === "state") {
      return formData.stateData;
    } else if (activeTab === "city") {
      return formData.cityData;
    } else if (activeTab === "areas") {
      return formData.areas[selectedAreaIdx];
    } else if (activeTab === "subareas") {
      return formData.areas[selectedAreaIdx]?.subareas[selectedSubareaIdx];
    }
  };

  const getCurrentCategory = (): DestinationCategory | undefined => {
    const current = getCurrentData();
    if (current) {
      return current as any;
    }
    return undefined;
  };

  // Helper function for image upload UI
  const renderImageUploadSection = () => (
    <div style={{ marginBottom: "1rem" }}>
      <label
        style={{
          display: "block",
          marginBottom: "0.5rem",
          fontWeight: "600",
        }}
      >
        Upload Gallery Images (Multiple)
      </label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          setItemImageFiles(files);

          // Create previews for all files
          const previews: string[] = [];
          let loadedCount = 0;

          files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              previews.push(event.target?.result as string);
              loadedCount++;
              if (loadedCount === files.length) {
                setItemImagePreviews(previews);
              }
            };
            reader.readAsDataURL(file);
          });

          if (files.length === 0) {
            setItemImagePreviews([]);
          }
        }}
        style={{
          width: "100%",
          padding: "0.75rem",
          border: "2px solid #e0e0e0",
          borderRadius: "8px",
          boxSizing: "border-box",
        }}
      />
      {itemImagePreviews.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <div
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
              color: "#374151",
            }}
          >
            📷 {itemImagePreviews.length} image(s) selected
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {itemImagePreviews.map((preview, idx) => (
              <div
                key={idx}
                style={{
                  position: "relative",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "2px solid #e0e0e0",
                  aspectRatio: "1/1",
                }}
              >
                <img
                  src={preview}
                  alt={`Preview ${idx + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newPreviews = itemImagePreviews.filter(
                      (_, i) => i !== idx,
                    );
                    const newFiles = itemImageFiles.filter((_, i) => i !== idx);
                    setItemImagePreviews(newPreviews);
                    setItemImageFiles(newFiles);
                  }}
                  style={{
                    position: "absolute",
                    top: "2px",
                    right: "2px",
                    background: "rgba(255, 0, 0, 0.8)",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  const addNewArea = () => {
    const newArea: AreaData = {
      name: `Area ${formData.areas.length + 1}`,
      thingsToDo: [],
      famousCafes: [],
      famousAttractions: [],
      shopping: [],
      subareas: [],
    };
    const updatedAreas = [...formData.areas, newArea];
    setFormData((prev) => ({
      ...prev,
      areas: updatedAreas,
    }));
    setSelectedAreaIdx(updatedAreas.length - 1);
    setActiveTab("areas");
  };

  const addNewSubarea = () => {
    if (selectedAreaIdx >= formData.areas.length) return;

    const newSubarea: SubareaData = {
      name: `Subarea ${formData.areas[selectedAreaIdx].subareas.length + 1}`,
      thingsToDo: [],
      famousCafes: [],
      famousAttractions: [],
      shopping: [],
    };

    const updatedAreas = [...formData.areas];
    updatedAreas[selectedAreaIdx].subareas.push(newSubarea);
    setFormData((prev) => ({
      ...prev,
      areas: updatedAreas,
    }));
    setSelectedSubareaIdx(updatedAreas[selectedAreaIdx].subareas.length - 1);
  };

  const addItemToCurrentCategory = () => {
    if (!itemName.trim()) {
      alert("Please enter item name");
      return;
    }

    const newItem: DestinationItem = {
      name: itemName,
      description: itemDescription,
      images: itemImagePreviews.length > 0 ? itemImagePreviews : [],
      profileImage: itemProfileImagePreview,
    };

    // Check if we're editing an existing item
    if (editingItemIdx !== null) {
      // Update existing item
      if (activeTab === "state") {
        setFormData((prev) => {
          const updatedStateData = {
            ...prev.stateData,
            [selectedCategory]: [
              ...(prev.stateData[
                selectedCategory as keyof typeof prev.stateData
              ] as DestinationItem[]),
            ],
          };
          updatedStateData[selectedCategory as keyof typeof updatedStateData][
            editingItemIdx
          ] = newItem;
          return {
            ...prev,
            stateData: updatedStateData,
          };
        });
      } else if (activeTab === "city") {
        setFormData((prev) => {
          const updatedCityData = {
            ...prev.cityData,
            [selectedCategory]: [
              ...(prev.cityData[
                selectedCategory as keyof typeof prev.cityData
              ] as DestinationItem[]),
            ],
          };
          updatedCityData[selectedCategory as keyof typeof updatedCityData][
            editingItemIdx
          ] = newItem;
          return {
            ...prev,
            cityData: updatedCityData,
          };
        });
      } else if (activeTab === "areas") {
        const updatedAreas = [...formData.areas];
        const areaItems = updatedAreas[selectedAreaIdx][
          selectedCategory
        ] as DestinationItem[];
        areaItems[editingItemIdx] = newItem;
        setFormData((prev) => ({
          ...prev,
          areas: updatedAreas,
        }));
      } else if (activeTab === "subareas") {
        const updatedAreas = [...formData.areas];
        const subareaItems = updatedAreas[selectedAreaIdx].subareas[
          selectedSubareaIdx
        ][selectedCategory] as DestinationItem[];
        subareaItems[editingItemIdx] = newItem;
        setFormData((prev) => ({
          ...prev,
          areas: updatedAreas,
        }));
      }
      setEditingItemIdx(null);
    } else {
      // Add new item
      if (activeTab === "state") {
        setFormData((prev) => ({
          ...prev,
          stateData: {
            ...prev.stateData,
            [selectedCategory]: [
              ...(prev.stateData[
                selectedCategory as keyof typeof prev.stateData
              ] as DestinationItem[]),
              newItem,
            ],
          },
        }));
      } else if (activeTab === "city") {
        setFormData((prev) => ({
          ...prev,
          cityData: {
            ...prev.cityData,
            [selectedCategory]: [
              ...(prev.cityData[
                selectedCategory as keyof typeof prev.cityData
              ] as DestinationItem[]),
              newItem,
            ],
          },
        }));
      } else if (activeTab === "areas") {
        const updatedAreas = [...formData.areas];
        if (!updatedAreas[selectedAreaIdx][selectedCategory]) {
          updatedAreas[selectedAreaIdx][selectedCategory] = [];
        }
        (
          updatedAreas[selectedAreaIdx][selectedCategory] as DestinationItem[]
        ).push(newItem);
        setFormData((prev) => ({
          ...prev,
          areas: updatedAreas,
        }));
      } else if (activeTab === "subareas") {
        const updatedAreas = [...formData.areas];
        if (
          !updatedAreas[selectedAreaIdx].subareas[selectedSubareaIdx][
            selectedCategory
          ]
        ) {
          updatedAreas[selectedAreaIdx].subareas[selectedSubareaIdx][
            selectedCategory
          ] = [];
        }
        (
          updatedAreas[selectedAreaIdx].subareas[selectedSubareaIdx][
            selectedCategory
          ] as DestinationItem[]
        ).push(newItem);
        setFormData((prev) => ({
          ...prev,
          areas: updatedAreas,
        }));
      }
    }

    setItemName("");
    setItemDescription("");
    setItemImageFiles([]);
    setItemImagePreviews([]);
    setItemProfileImageFile(null);
    setItemProfileImagePreview("");
  };

  const removeItem = (index: number) => {
    if (activeTab === "state") {
      setFormData((prev) => ({
        ...prev,
        stateData: {
          ...prev.stateData,
          [selectedCategory]: (
            prev.stateData[
              selectedCategory as keyof typeof prev.stateData
            ] as DestinationItem[]
          ).filter((_, i) => i !== index),
        },
      }));
    } else if (activeTab === "city") {
      setFormData((prev) => ({
        ...prev,
        cityData: {
          ...prev.cityData,
          [selectedCategory]: (
            prev.cityData[
              selectedCategory as keyof typeof prev.cityData
            ] as DestinationItem[]
          ).filter((_, i) => i !== index),
        },
      }));
    } else if (activeTab === "areas") {
      const updatedAreas = [...formData.areas];
      updatedAreas[selectedAreaIdx][selectedCategory] = (
        updatedAreas[selectedAreaIdx][selectedCategory] as DestinationItem[]
      ).filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, areas: updatedAreas }));
    } else if (activeTab === "subareas") {
      const updatedAreas = [...formData.areas];
      updatedAreas[selectedAreaIdx].subareas[selectedSubareaIdx][
        selectedCategory
      ] = (
        updatedAreas[selectedAreaIdx].subareas[selectedSubareaIdx][
          selectedCategory
        ] as DestinationItem[]
      ).filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, areas: updatedAreas }));
    }
    setSelectedItemIdx(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.stateName.trim()) {
      alert("Please enter State name");
      return;
    }

    if (!formData.cityName.trim()) {
      alert("Please enter City name");
      return;
    }

    try {
      setSaving(true);

      // Handle profile image upload
      let updatedFormData = { ...formData };
      if (profileImageFile) {
        const reader = new FileReader();
        await new Promise((resolve) => {
          reader.onload = (event) => {
            updatedFormData.stateProfileImage = event.target?.result as string;
            resolve(null);
          };
          reader.readAsDataURL(profileImageFile);
        });
      }

      const url = formData._id
        ? `/api/hotel-destinations?id=${formData._id}`
        : "/api/hotel-destinations";
      const method = formData._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFormData),
      });

      if (res.ok) {
        alert(
          formData._id
            ? "Destination updated successfully"
            : "Destination created successfully",
        );
        setPage("list");
        router.push("/admin/hotel-destinations");
        fetchDestinations();
      } else {
        alert("Failed to save destination");
      }
    } catch (error) {
      console.error("Error saving destination:", error);
      alert("Error saving destination");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPage("list");
    router.push("/admin/hotel-destinations");
  };

  const tabButtonStyle = (isActive: boolean) => ({
    padding: "0.75rem 1.5rem",
    background: isActive
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : "#fff",
    color: isActive ? "#fff" : "#374151",
    border: isActive ? "2px solid #667eea" : "2px solid #e0e0e0",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  });

  const categoryButtonStyle = (category: string, isActive: boolean) => ({
    padding: "0.5rem 1rem",
    background: isActive ? "#667eea" : "#f3f4f6",
    color: isActive ? "#fff" : "#374151",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
    transition: "all 0.2s ease",
  });

  // FORM PAGE
  if (page === "form") {
    const currentData = getCurrentData();
    const currentCategory = getCurrentCategory();
    const categoryItems = currentCategory?.[selectedCategory] || [];

    return (
      <div
        style={{
          padding: "2rem",
          paddingTop: "5rem",
          maxWidth: "1200px",
          margin: "0 auto",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)",
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <button
            onClick={handleCancel}
            style={{
              background: "#e5e7eb",
              color: "#374151",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.95rem",
              transition: "all 0.3s ease",
            }}
          >
            ← Back to List
          </button>
          <h1
            style={{
              margin: 0,
              fontSize: "1.75rem",
              fontWeight: "700",
              color: "#1a1a2e",
            }}
          >
            {formData._id ? "✏️ Edit Destination" : "➕ Add New Destination"}
          </h1>
        </div>

        {/* Form Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "2.5rem",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Main Tabs */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "2rem",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("state")}
                style={tabButtonStyle(activeTab === "state")}
              >
                🏔️ STATE
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("city")}
                style={tabButtonStyle(activeTab === "city")}
              >
                🏙️ CITY
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("areas")}
                style={tabButtonStyle(activeTab === "areas")}
              >
                ⭐ AREAS
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!formData?.areas || formData.areas.length === 0) {
                    alert("Please add an area first");
                    return;
                  }
                  setActiveTab("subareas");
                }}
                style={tabButtonStyle(activeTab === "subareas")}
              >
                📍 SUBAREAS
              </button>
            </div>

            {/* STATE TAB */}
            {activeTab === "state" && (
              <div style={{ marginBottom: "2rem" }}>
                <h2
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: "700",
                    color: "#1a1a2e",
                    marginBottom: "1.5rem",
                  }}
                >
                  🏔️ State Information
                </h2>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                    }}
                  >
                    State Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Rajasthan"
                    value={formData.stateName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stateName: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "0.95rem",
                      boxSizing: "border-box",
                    }}
                    required
                  />
                </div>

                {/* Categories for State */}
                <div style={{ marginBottom: "2rem" }}>
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "700",
                      marginBottom: "1rem",
                    }}
                  >
                    Add State Level Content
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      marginBottom: "1.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {(
                      [
                        "topDestinations",
                        "topAttractions",
                        "thingsToDo",
                      ] as const
                    ).map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        style={categoryButtonStyle(
                          category,
                          selectedCategory === category,
                        )}
                      >
                        {category === "topDestinations" &&
                          "🏛️ Top Destinations"}
                        {category === "topAttractions" && "✨ Top Attractions"}
                        {category === "thingsToDo" && "🎯 Things to Do"}
                      </button>
                    ))}
                  </div>

                  {/* Item Input */}
                  <div
                    style={{
                      padding: "1.5rem",
                      background: "#f9fafb",
                      borderRadius: "8px",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <h4 style={{ marginTop: 0, marginBottom: "1rem" }}>
                      Add New{" "}
                      {selectedCategory === "topDestinations"
                        ? "Top Destination"
                        : selectedCategory === "topAttractions"
                          ? "Top Attraction"
                          : "Thing to Do"}
                    </h4>

                    <div style={{ marginBottom: "1rem" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "600",
                        }}
                      >
                        Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Item name"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "2px solid #e0e0e0",
                          borderRadius: "8px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "600",
                        }}
                      >
                        Description
                      </label>
                      <textarea
                        placeholder="Item description"
                        value={itemDescription}
                        onChange={(e) => setItemDescription(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "2px solid #e0e0e0",
                          borderRadius: "8px",
                          boxSizing: "border-box",
                          minHeight: "80px",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "600",
                        }}
                      >
                        Profile Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setItemProfileImageFile(file);
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setItemProfileImagePreview(
                                event.target?.result as string,
                              );
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "2px solid #e0e0e0",
                          borderRadius: "8px",
                          boxSizing: "border-box",
                        }}
                      />
                      {itemProfileImagePreview && (
                        <div style={{ marginTop: "0.75rem" }}>
                          <img
                            src={itemProfileImagePreview}
                            alt="Profile Preview"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "120px",
                              borderRadius: "8px",
                              objectFit: "cover",
                              border: "2px solid #e0e0e0",
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {renderImageUploadSection()}

                    <button
                      type="button"
                      onClick={addItemToCurrentCategory}
                      style={{
                        background: "#667eea",
                        color: "#fff",
                        border: "none",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      + Add Item
                    </button>
                  </div>

                  {/* Display Items */}
                  {categoryItems.length > 0 && (
                    <div>
                      <h4 style={{ marginBottom: "1rem" }}>Items Added:</h4>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(250px, 1fr))",
                          gap: "1rem",
                        }}
                      >
                        {(categoryItems as DestinationItem[]).map(
                          (item, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: "1rem",
                                background: "#fff",
                                border: "1px solid #e0e0e0",
                                borderRadius: "8px",
                              }}
                            >
                              {item.profileImage && (
                                <img
                                  src={item.profileImage}
                                  alt={item.name}
                                  style={{
                                    width: "100%",
                                    height: "120px",
                                    objectFit: "cover",
                                    borderRadius: "6px",
                                    marginBottom: "0.75rem",
                                  }}
                                />
                              )}
                              <h5 style={{ margin: "0 0 0.5rem 0" }}>
                                {item.name}
                              </h5>
                              <p
                                style={{
                                  margin: "0 0 0.5rem 0",
                                  fontSize: "0.9rem",
                                  color: "#666",
                                }}
                              >
                                {item.description}
                              </p>
                              {item.images.length > 0 && (
                                <div
                                  style={{
                                    marginBottom: "0.75rem",
                                    fontSize: "0.85rem",
                                    color: "#666",
                                  }}
                                >
                                  📷 {item.images.length} image(s)
                                </div>
                              )}
                              <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setItemName(item.name);
                                    setItemDescription(item.description);
                                    setItemProfileImagePreview(
                                      item.profileImage || "",
                                    );
                                    setEditingItemIdx(idx);
                                  }}
                                  style={{
                                    background: "#3b82f6",
                                    color: "#fff",
                                    border: "none",
                                    padding: "0.4rem 0.8rem",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "0.85rem",
                                    fontWeight: "600",
                                    flex: 1,
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeItem(idx)}
                                  style={{
                                    background: "#ef4444",
                                    color: "#fff",
                                    border: "none",
                                    padding: "0.4rem 0.8rem",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "0.85rem",
                                    fontWeight: "600",
                                    flex: 1,
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CITY TAB */}
            {activeTab === "city" && (
              <div style={{ marginBottom: "2rem" }}>
                <h2
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: "700",
                    color: "#1a1a2e",
                    marginBottom: "1.5rem",
                  }}
                >
                  🏙️ City Information
                </h2>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                    }}
                  >
                    City Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Jaipur"
                    value={formData.cityName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cityName: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "0.95rem",
                      boxSizing: "border-box",
                    }}
                    required
                  />
                </div>

                {/* Categories for City */}
                <div style={{ marginBottom: "2rem" }}>
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "700",
                      marginBottom: "1rem",
                    }}
                  >
                    Add City Level Content
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      marginBottom: "1.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {(
                      [
                        "thingsToDo",
                        "famousCafes",
                        "famousAttractions",
                        "shopping",
                      ] as const
                    ).map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        style={categoryButtonStyle(
                          category,
                          selectedCategory === category,
                        )}
                      >
                        {category === "thingsToDo" && "🎯 Things to Do"}
                        {category === "famousCafes" &&
                          "☕ Famous Cafés & Restaurants"}
                        {category === "famousAttractions" &&
                          "✨ Famous Attractions"}
                        {category === "shopping" && "🛍️ Shopping"}
                      </button>
                    ))}
                  </div>

                  {/* Item Input */}
                  <div
                    style={{
                      padding: "1.5rem",
                      background: "#f9fafb",
                      borderRadius: "8px",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <h4 style={{ marginTop: 0, marginBottom: "1rem" }}>
                      Add New{" "}
                      {selectedCategory === "thingsToDo"
                        ? "Thing to Do"
                        : selectedCategory === "famousCafes"
                          ? "Famous Café/Restaurant"
                          : selectedCategory === "famousAttractions"
                            ? "Attraction"
                            : "Shopping Item"}
                    </h4>

                    <div style={{ marginBottom: "1rem" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "600",
                        }}
                      >
                        Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Item name"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "2px solid #e0e0e0",
                          borderRadius: "8px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "600",
                        }}
                      >
                        Description
                      </label>
                      <textarea
                        placeholder="Item description"
                        value={itemDescription}
                        onChange={(e) => setItemDescription(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "2px solid #e0e0e0",
                          borderRadius: "8px",
                          boxSizing: "border-box",
                          minHeight: "80px",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "600",
                        }}
                      >
                        Profile Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setItemProfileImageFile(file);
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setItemProfileImagePreview(
                                event.target?.result as string,
                              );
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "2px solid #e0e0e0",
                          borderRadius: "8px",
                          boxSizing: "border-box",
                        }}
                      />
                      {itemProfileImagePreview && (
                        <div style={{ marginTop: "0.75rem" }}>
                          <img
                            src={itemProfileImagePreview}
                            alt="Profile Preview"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "120px",
                              borderRadius: "8px",
                              objectFit: "cover",
                              border: "2px solid #e0e0e0",
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {renderImageUploadSection()}

                    <button
                      type="button"
                      onClick={addItemToCurrentCategory}
                      style={{
                        background:
                          editingItemIdx !== null ? "#10b981" : "#667eea",
                        color: "#fff",
                        border: "none",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      {editingItemIdx !== null ? "✓ Update Item" : "+ Add Item"}
                    </button>
                    {editingItemIdx !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItemIdx(null);
                          setItemName("");
                          setItemDescription("");
                          setItemProfileImagePreview("");
                          setItemImagePreviews([]);
                        }}
                        style={{
                          background: "#6b7280",
                          color: "#fff",
                          border: "none",
                          padding: "0.75rem 1.5rem",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "600",
                          marginLeft: "0.5rem",
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {/* Display Items */}
                  {categoryItems.length > 0 && (
                    <div>
                      <h4 style={{ marginBottom: "1rem" }}>Items Added:</h4>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(250px, 1fr))",
                          gap: "1rem",
                        }}
                      >
                        {(categoryItems as DestinationItem[]).map(
                          (item, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: "1rem",
                                background: "#fff",
                                border: "1px solid #e0e0e0",
                                borderRadius: "8px",
                              }}
                            >
                              {item.profileImage && (
                                <img
                                  src={item.profileImage}
                                  alt={item.name}
                                  style={{
                                    width: "100%",
                                    height: "120px",
                                    objectFit: "cover",
                                    borderRadius: "6px",
                                    marginBottom: "0.75rem",
                                  }}
                                />
                              )}
                              <h5 style={{ margin: "0 0 0.5rem 0" }}>
                                {item.name}
                              </h5>
                              <p
                                style={{
                                  margin: "0 0 0.5rem 0",
                                  fontSize: "0.9rem",
                                  color: "#666",
                                }}
                              >
                                {item.description}
                              </p>
                              {item.images.length > 0 && (
                                <div
                                  style={{
                                    marginBottom: "0.75rem",
                                    fontSize: "0.85rem",
                                    color: "#666",
                                  }}
                                >
                                  📷 {item.images.length} image(s)
                                </div>
                              )}
                              <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setItemName(item.name);
                                    setItemDescription(item.description);
                                    setItemProfileImagePreview(
                                      item.profileImage || "",
                                    );
                                    setEditingItemIdx(idx);
                                  }}
                                  style={{
                                    background: "#3b82f6",
                                    color: "#fff",
                                    border: "none",
                                    padding: "0.4rem 0.8rem",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "0.85rem",
                                    fontWeight: "600",
                                    flex: 1,
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeItem(idx)}
                                  style={{
                                    background: "#ef4444",
                                    color: "#fff",
                                    border: "none",
                                    padding: "0.4rem 0.8rem",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "0.85rem",
                                    fontWeight: "600",
                                    flex: 1,
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AREAS TAB */}
            {activeTab === "areas" && (
              <div style={{ marginBottom: "2rem" }}>
                <h2
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: "700",
                    color: "#1a1a2e",
                    marginBottom: "1.5rem",
                  }}
                >
                  ⭐ Areas
                </h2>

                {formData.areas.length === 0 ? (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <p style={{ color: "#666" }}>No areas added yet.</p>
                    <button
                      type="button"
                      onClick={addNewArea}
                      style={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "#fff",
                        border: "none",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      + Add First Area
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginBottom: "1.5rem",
                        flexWrap: "wrap",
                      }}
                    >
                      {formData.areas.map((area, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedAreaIdx(idx);
                            setSelectedSubareaIdx(0);
                          }}
                          style={{
                            padding: "0.6rem 1rem",
                            background:
                              selectedAreaIdx === idx ? "#667eea" : "#f3f4f6",
                            color: selectedAreaIdx === idx ? "#fff" : "#374151",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "600",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {area.name}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={addNewArea}
                        style={{
                          padding: "0.6rem 1rem",
                          background: "#e0f2fe",
                          color: "#0284c7",
                          border: "2px solid #0284c7",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        + Add Area
                      </button>
                    </div>

                    {formData.areas[selectedAreaIdx] && (
                      <div style={{ marginBottom: "2rem" }}>
                        <div style={{ marginBottom: "1.5rem" }}>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "0.5rem",
                              fontWeight: "600",
                            }}
                          >
                            Area Name
                          </label>
                          <input
                            type="text"
                            value={formData.areas[selectedAreaIdx].name}
                            onChange={(e) => {
                              const updatedAreas = [...formData.areas];
                              updatedAreas[selectedAreaIdx].name =
                                e.target.value;
                              setFormData({
                                ...formData,
                                areas: updatedAreas,
                              });
                            }}
                            style={{
                              width: "100%",
                              padding: "0.75rem",
                              border: "2px solid #e0e0e0",
                              borderRadius: "8px",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>

                        {/* Categories for Area */}
                        <div style={{ marginBottom: "2rem" }}>
                          <h3
                            style={{
                              fontSize: "1.1rem",
                              fontWeight: "700",
                              marginBottom: "1rem",
                            }}
                          >
                            Add Area Level Content
                          </h3>

                          <div
                            style={{
                              display: "flex",
                              gap: "0.75rem",
                              marginBottom: "1.5rem",
                              flexWrap: "wrap",
                            }}
                          >
                            {(
                              [
                                "thingsToDo",
                                "famousCafes",
                                "famousAttractions",
                                "shopping",
                              ] as const
                            ).map((category) => (
                              <button
                                key={category}
                                type="button"
                                onClick={() => setSelectedCategory(category)}
                                style={categoryButtonStyle(
                                  category,
                                  selectedCategory === category,
                                )}
                              >
                                {category === "thingsToDo" && "🎯 Things to Do"}
                                {category === "famousCafes" &&
                                  "☕ Famous Cafés & Restaurants"}
                                {category === "famousAttractions" &&
                                  "✨ Famous Attractions"}
                                {category === "shopping" && "🛍️ Shopping"}
                              </button>
                            ))}
                          </div>

                          {/* Item Input */}
                          <div
                            style={{
                              padding: "1.5rem",
                              background: "#f9fafb",
                              borderRadius: "8px",
                              marginBottom: "1.5rem",
                            }}
                          >
                            <h4 style={{ marginTop: 0, marginBottom: "1rem" }}>
                              Add New{" "}
                              {selectedCategory === "thingsToDo"
                                ? "Thing to Do"
                                : selectedCategory === "famousCafes"
                                  ? "Famous Café/Restaurant"
                                  : selectedCategory === "famousAttractions"
                                    ? "Attraction"
                                    : "Shopping Item"}
                            </h4>

                            <div style={{ marginBottom: "1rem" }}>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "0.5rem",
                                  fontWeight: "600",
                                }}
                              >
                                Name *
                              </label>
                              <input
                                type="text"
                                placeholder="Item name"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "0.75rem",
                                  border: "2px solid #e0e0e0",
                                  borderRadius: "8px",
                                  boxSizing: "border-box",
                                }}
                              />
                            </div>

                            <div style={{ marginBottom: "1rem" }}>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "0.5rem",
                                  fontWeight: "600",
                                }}
                              >
                                Description
                              </label>
                              <textarea
                                placeholder="Item description"
                                value={itemDescription}
                                onChange={(e) =>
                                  setItemDescription(e.target.value)
                                }
                                style={{
                                  width: "100%",
                                  padding: "0.75rem",
                                  border: "2px solid #e0e0e0",
                                  borderRadius: "8px",
                                  boxSizing: "border-box",
                                  minHeight: "80px",
                                }}
                              />
                            </div>

                            <div style={{ marginBottom: "1rem" }}>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "0.5rem",
                                  fontWeight: "600",
                                }}
                              >
                                Profile Image
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setItemProfileImageFile(file);
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      setItemProfileImagePreview(
                                        event.target?.result as string,
                                      );
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                style={{
                                  width: "100%",
                                  padding: "0.75rem",
                                  border: "2px solid #e0e0e0",
                                  borderRadius: "8px",
                                  boxSizing: "border-box",
                                }}
                              />
                              {itemProfileImagePreview && (
                                <div style={{ marginTop: "0.75rem" }}>
                                  <img
                                    src={itemProfileImagePreview}
                                    alt="Profile Preview"
                                    style={{
                                      maxWidth: "100%",
                                      maxHeight: "120px",
                                      borderRadius: "8px",
                                      objectFit: "cover",
                                      border: "2px solid #e0e0e0",
                                    }}
                                  />
                                </div>
                              )}
                            </div>

                            {renderImageUploadSection()}

                            <button
                              type="button"
                              onClick={addItemToCurrentCategory}
                              style={{
                                background:
                                  editingItemIdx !== null
                                    ? "#10b981"
                                    : "#667eea",
                                color: "#fff",
                                border: "none",
                                padding: "0.75rem 1.5rem",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "600",
                              }}
                            >
                              {editingItemIdx !== null
                                ? "✓ Update Item"
                                : "+ Add Item"}
                            </button>
                            {editingItemIdx !== null && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingItemIdx(null);
                                  setItemName("");
                                  setItemDescription("");
                                  setItemProfileImagePreview("");
                                  setItemImagePreviews([]);
                                }}
                                style={{
                                  background: "#6b7280",
                                  color: "#fff",
                                  border: "none",
                                  padding: "0.75rem 1.5rem",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontWeight: "600",
                                  marginLeft: "0.5rem",
                                }}
                              >
                                Cancel
                              </button>
                            )}
                          </div>

                          {/* Display Items */}
                          {categoryItems.length > 0 && (
                            <div>
                              <h4 style={{ marginBottom: "1rem" }}>
                                Items Added:
                              </h4>
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns:
                                    "repeat(auto-fill, minmax(250px, 1fr))",
                                  gap: "1rem",
                                }}
                              >
                                {(categoryItems as DestinationItem[]).map(
                                  (item, idx) => (
                                    <div
                                      key={idx}
                                      style={{
                                        padding: "1rem",
                                        background: "#fff",
                                        border: "1px solid #e0e0e0",
                                        borderRadius: "8px",
                                      }}
                                    >
                                      {item.profileImage && (
                                        <img
                                          src={item.profileImage}
                                          alt={item.name}
                                          style={{
                                            width: "100%",
                                            height: "120px",
                                            objectFit: "cover",
                                            borderRadius: "6px",
                                            marginBottom: "0.75rem",
                                          }}
                                        />
                                      )}
                                      <h5 style={{ margin: "0 0 0.5rem 0" }}>
                                        {item.name}
                                      </h5>
                                      <p
                                        style={{
                                          margin: "0 0 0.5rem 0",
                                          fontSize: "0.9rem",
                                          color: "#666",
                                        }}
                                      >
                                        {item.description}
                                      </p>
                                      {item.images.length > 0 && (
                                        <div
                                          style={{
                                            marginBottom: "0.75rem",
                                            fontSize: "0.85rem",
                                            color: "#666",
                                          }}
                                        >
                                          📷 {item.images.length} image(s)
                                        </div>
                                      )}
                                      <div
                                        style={{
                                          display: "flex",
                                          gap: "0.5rem",
                                        }}
                                      >
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setItemName(item.name);
                                            setItemDescription(
                                              item.description,
                                            );
                                            setItemProfileImagePreview(
                                              item.profileImage || "",
                                            );
                                            setEditingItemIdx(idx);
                                          }}
                                          style={{
                                            background: "#3b82f6",
                                            color: "#fff",
                                            border: "none",
                                            padding: "0.4rem 0.8rem",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            fontSize: "0.85rem",
                                            fontWeight: "600",
                                            flex: 1,
                                          }}
                                        >
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => removeItem(idx)}
                                          style={{
                                            background: "#ef4444",
                                            color: "#fff",
                                            border: "none",
                                            padding: "0.4rem 0.8rem",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            fontSize: "0.85rem",
                                            fontWeight: "600",
                                            flex: 1,
                                          }}
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* SUBAREAS TAB */}
            {activeTab === "subareas" && (
              <div style={{ marginBottom: "2rem" }}>
                <h2
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: "700",
                    color: "#1a1a2e",
                    marginBottom: "1.5rem",
                  }}
                >
                  📍 Subareas
                </h2>

                {formData.areas[selectedAreaIdx]?.subareas.length === 0 ? (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <p style={{ color: "#666" }}>No subareas added yet.</p>
                    <button
                      type="button"
                      onClick={addNewSubarea}
                      style={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "#fff",
                        border: "none",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      + Add First Subarea
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginBottom: "1.5rem",
                        flexWrap: "wrap",
                      }}
                    >
                      {formData.areas[selectedAreaIdx].subareas.map(
                        (subarea, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedSubareaIdx(idx)}
                            style={{
                              padding: "0.6rem 1rem",
                              background:
                                selectedSubareaIdx === idx
                                  ? "#667eea"
                                  : "#f3f4f6",
                              color:
                                selectedSubareaIdx === idx ? "#fff" : "#374151",
                              border: "1px solid #e0e0e0",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "600",
                              transition: "all 0.2s ease",
                            }}
                          >
                            {subarea.name}
                          </button>
                        ),
                      )}
                      <button
                        type="button"
                        onClick={addNewSubarea}
                        style={{
                          padding: "0.6rem 1rem",
                          background: "#e0f2fe",
                          color: "#0284c7",
                          border: "2px solid #0284c7",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        + Add Subarea
                      </button>
                    </div>

                    {formData.areas[selectedAreaIdx].subareas[
                      selectedSubareaIdx
                    ] && (
                      <div style={{ marginBottom: "2rem" }}>
                        <div style={{ marginBottom: "1.5rem" }}>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "0.5rem",
                              fontWeight: "600",
                            }}
                          >
                            Subarea Name
                          </label>
                          <input
                            type="text"
                            value={
                              formData.areas[selectedAreaIdx].subareas[
                                selectedSubareaIdx
                              ].name
                            }
                            onChange={(e) => {
                              const updatedAreas = [...formData.areas];
                              updatedAreas[selectedAreaIdx].subareas[
                                selectedSubareaIdx
                              ].name = e.target.value;
                              setFormData({
                                ...formData,
                                areas: updatedAreas,
                              });
                            }}
                            style={{
                              width: "100%",
                              padding: "0.75rem",
                              border: "2px solid #e0e0e0",
                              borderRadius: "8px",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>

                        {/* Categories for Subarea */}
                        <div style={{ marginBottom: "2rem" }}>
                          <h3
                            style={{
                              fontSize: "1.1rem",
                              fontWeight: "700",
                              marginBottom: "1rem",
                            }}
                          >
                            Add Subarea Level Content
                          </h3>

                          <div
                            style={{
                              display: "flex",
                              gap: "0.75rem",
                              marginBottom: "1.5rem",
                              flexWrap: "wrap",
                            }}
                          >
                            {(
                              [
                                "thingsToDo",
                                "famousCafes",
                                "famousAttractions",
                                "shopping",
                              ] as const
                            ).map((category) => (
                              <button
                                key={category}
                                type="button"
                                onClick={() => setSelectedCategory(category)}
                                style={categoryButtonStyle(
                                  category,
                                  selectedCategory === category,
                                )}
                              >
                                {category === "thingsToDo" && "🎯 Things to Do"}
                                {category === "famousCafes" &&
                                  "☕ Famous Cafés & Restaurants"}
                                {category === "famousAttractions" &&
                                  "✨ Famous Attractions"}
                                {category === "shopping" && "🛍️ Shopping"}
                              </button>
                            ))}
                          </div>

                          {/* Item Input */}
                          <div
                            style={{
                              padding: "1.5rem",
                              background: "#f9fafb",
                              borderRadius: "8px",
                              marginBottom: "1.5rem",
                            }}
                          >
                            <h4 style={{ marginTop: 0, marginBottom: "1rem" }}>
                              Add New{" "}
                              {selectedCategory === "thingsToDo"
                                ? "Thing to Do"
                                : selectedCategory === "famousCafes"
                                  ? "Famous Café/Restaurant"
                                  : selectedCategory === "famousAttractions"
                                    ? "Attraction"
                                    : "Shopping Item"}
                            </h4>

                            <div style={{ marginBottom: "1rem" }}>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "0.5rem",
                                  fontWeight: "600",
                                }}
                              >
                                Name *
                              </label>
                              <input
                                type="text"
                                placeholder="Item name"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "0.75rem",
                                  border: "2px solid #e0e0e0",
                                  borderRadius: "8px",
                                  boxSizing: "border-box",
                                }}
                              />
                            </div>

                            <div style={{ marginBottom: "1rem" }}>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "0.5rem",
                                  fontWeight: "600",
                                }}
                              >
                                Description
                              </label>
                              <textarea
                                placeholder="Item description"
                                value={itemDescription}
                                onChange={(e) =>
                                  setItemDescription(e.target.value)
                                }
                                style={{
                                  width: "100%",
                                  padding: "0.75rem",
                                  border: "2px solid #e0e0e0",
                                  borderRadius: "8px",
                                  boxSizing: "border-box",
                                  minHeight: "80px",
                                }}
                              />
                            </div>

                            <div style={{ marginBottom: "1rem" }}>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "0.5rem",
                                  fontWeight: "600",
                                }}
                              >
                                Profile Image
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setItemProfileImageFile(file);
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      setItemProfileImagePreview(
                                        event.target?.result as string,
                                      );
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                style={{
                                  width: "100%",
                                  padding: "0.75rem",
                                  border: "2px solid #e0e0e0",
                                  borderRadius: "8px",
                                  boxSizing: "border-box",
                                }}
                              />
                              {itemProfileImagePreview && (
                                <div style={{ marginTop: "0.75rem" }}>
                                  <img
                                    src={itemProfileImagePreview}
                                    alt="Profile Preview"
                                    style={{
                                      maxWidth: "100%",
                                      maxHeight: "120px",
                                      borderRadius: "8px",
                                      objectFit: "cover",
                                      border: "2px solid #e0e0e0",
                                    }}
                                  />
                                </div>
                              )}
                            </div>

                            {renderImageUploadSection()}

                            <button
                              type="button"
                              onClick={addItemToCurrentCategory}
                              style={{
                                background:
                                  editingItemIdx !== null
                                    ? "#10b981"
                                    : "#667eea",
                                color: "#fff",
                                border: "none",
                                padding: "0.75rem 1.5rem",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "600",
                              }}
                            >
                              {editingItemIdx !== null
                                ? "✓ Update Item"
                                : "+ Add Item"}
                            </button>
                            {editingItemIdx !== null && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingItemIdx(null);
                                  setItemName("");
                                  setItemDescription("");
                                  setItemProfileImagePreview("");
                                  setItemImagePreviews([]);
                                }}
                                style={{
                                  background: "#6b7280",
                                  color: "#fff",
                                  border: "none",
                                  padding: "0.75rem 1.5rem",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontWeight: "600",
                                  marginLeft: "0.5rem",
                                }}
                              >
                                Cancel
                              </button>
                            )}
                          </div>

                          {/* Display Items */}
                          {categoryItems.length > 0 && (
                            <div>
                              <h4 style={{ marginBottom: "1rem" }}>
                                Items Added:
                              </h4>
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns:
                                    "repeat(auto-fill, minmax(250px, 1fr))",
                                  gap: "1rem",
                                }}
                              >
                                {(categoryItems as DestinationItem[]).map(
                                  (item, idx) => (
                                    <div
                                      key={idx}
                                      style={{
                                        padding: "1rem",
                                        background: "#fff",
                                        border: "1px solid #e0e0e0",
                                        borderRadius: "8px",
                                      }}
                                    >
                                      {item.profileImage && (
                                        <img
                                          src={item.profileImage}
                                          alt={item.name}
                                          style={{
                                            width: "100%",
                                            height: "120px",
                                            objectFit: "cover",
                                            borderRadius: "6px",
                                            marginBottom: "0.75rem",
                                          }}
                                        />
                                      )}
                                      <h5 style={{ margin: "0 0 0.5rem 0" }}>
                                        {item.name}
                                      </h5>
                                      <p
                                        style={{
                                          margin: "0 0 0.5rem 0",
                                          fontSize: "0.9rem",
                                          color: "#666",
                                        }}
                                      >
                                        {item.description}
                                      </p>
                                      {item.images.length > 0 && (
                                        <div
                                          style={{
                                            marginBottom: "0.75rem",
                                            fontSize: "0.85rem",
                                            color: "#666",
                                          }}
                                        >
                                          📷 {item.images.length} image(s)
                                        </div>
                                      )}
                                      <div
                                        style={{
                                          display: "flex",
                                          gap: "0.5rem",
                                        }}
                                      >
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setItemName(item.name);
                                            setItemDescription(
                                              item.description,
                                            );
                                            setItemProfileImagePreview(
                                              item.profileImage || "",
                                            );
                                            setEditingItemIdx(idx);
                                          }}
                                          style={{
                                            background: "#3b82f6",
                                            color: "#fff",
                                            border: "none",
                                            padding: "0.4rem 0.8rem",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            fontSize: "0.85rem",
                                            fontWeight: "600",
                                            flex: 1,
                                          }}
                                        >
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => removeItem(idx)}
                                          style={{
                                            background: "#ef4444",
                                            color: "#fff",
                                            border: "none",
                                            padding: "0.4rem 0.8rem",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            fontSize: "0.85rem",
                                            fontWeight: "600",
                                            flex: 1,
                                          }}
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1,
                  background: saving
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
                  color: "#fff",
                  border: "none",
                  padding: "1rem 2rem",
                  borderRadius: "8px",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontWeight: "700",
                  fontSize: "1rem",
                  transition: "all 0.3s ease",
                }}
              >
                {saving
                  ? "Saving..."
                  : formData._id
                    ? "Update Destination"
                    : "Create Destination"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  flex: 1,
                  background: "#e5e7eb",
                  color: "#374151",
                  border: "none",
                  padding: "1rem 2rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "1rem",
                  transition: "all 0.3s ease",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // LIST PAGE
  if (loading) {
    return (
      <div
        style={{
          padding: "2rem",
          paddingTop: "5rem",
          maxWidth: "1600px",
          margin: "0 auto",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            fontSize: "1.1rem",
            color: "#666",
          }}
        >
          Loading destinations...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "2rem",
        paddingTop: "5rem",
        maxWidth: "1600px",
        margin: "0 auto",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          padding: "1.5rem 2rem",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: "700",
            color: "#fff",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          🗺️ Hotel & Homestay Destinations
        </h1>
        <button
          onClick={handleAddNew}
          style={{
            background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
            color: "#fff",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.95rem",
            transition: "all 0.3s ease",
          }}
        >
          + Add New Destination
        </button>
      </div>

      {/* Stats */}
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
            background: "#fff",
            padding: "1.5rem",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: "700",
              color: "#667eea",
            }}
          >
            {destinations?.length || 0}
          </div>
          <div
            style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}
          >
            Total Destinations
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {destinations.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "3rem 2rem",
              color: "#999",
              fontSize: "1.1rem",
            }}
          >
            No destinations found
          </div>
        ) : (
          destinations.map((destination) => (
            <div
              key={destination._id}
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "1.5rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                border: "1px solid #e0e0e0",
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  color: "#1a1a2e",
                  marginBottom: "0.5rem",
                }}
              >
                {destination.stateName || "Unnamed State"} →{" "}
                {destination.cityName || "Unnamed City"}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#666",
                  marginBottom: "0.75rem",
                }}
              >
                {destination.areas?.length || 0} areas
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  marginTop: "1rem",
                }}
              >
                <button
                  onClick={() => handleEdit(destination)}
                  style={{
                    flex: 1,
                    padding: "0.6rem 1rem",
                    background: "#667eea",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    transition: "all 0.3s ease",
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(destination._id || "")}
                  style={{
                    flex: 1,
                    padding: "0.6rem 1rem",
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    transition: "all 0.3s ease",
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
