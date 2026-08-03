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

  const [page, setPage] = useState<"list" | "form" | "manage_states">(
    editId ? "form" : "list",
  );
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
  const [itemImageUrls, setItemImageUrls] = useState<string[]>([]);
  const [itemProfileImageFile, setItemProfileImageFile] = useState<File | null>(
    null,
  );
  const [itemProfileImagePreview, setItemProfileImagePreview] =
    useState<string>("");
  const [itemProfileImageUrl, setItemProfileImageUrl] = useState<string>("");
  const [uploadingItemImages, setUploadingItemImages] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");

  // Add State Modal states
  const [showAddStateModal, setShowAddStateModal] = useState(false);
  const [addStateInput, setAddStateInput] = useState("");
  const [addCityInput, setAddCityInput] = useState("");
  const [statesSuggestions, setStatesSuggestions] = useState<string[]>([]);
  const [addStateLoading, setAddStateLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Form page - State and City autocomplete
  interface StateWithCities {
    stateName: string;
    cities: string[];
  }
  const [formStateInputSuggestions, setFormStateInputSuggestions] = useState<
    string[]
  >([]);
  const [formCityInputSuggestions, setFormCityInputSuggestions] = useState<
    string[]
  >([]);
  const [showFormStateSuggestions, setShowFormStateSuggestions] =
    useState(false);
  const [showFormCitySuggestions, setShowFormCitySuggestions] = useState(false);
  const [allStatesWithCities, setAllStatesWithCities] = useState<
    StateWithCities[]
  >([]);

  // Manage States and Cities
  interface StateData {
    _id: string;
    stateName: string;
    cityName: string;
    createdAt: string;
  }
  const [statesAndCities, setStatesAndCities] = useState<StateData[]>([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [editingStateId, setEditingStateId] = useState<string | null>(null);
  const [editingStateName, setEditingStateName] = useState("");
  const [editingCityName, setEditingCityName] = useState("");

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

  useEffect(() => {
    // Fetch available states when modal opens
    if (showAddStateModal) {
      const fetchStates = async () => {
        try {
          const res = await fetch("/api/hotel-destinations/states");
          if (res.ok) {
            const states = await res.json();
            setStatesSuggestions(states);
          }
        } catch (error) {
          console.error("Error fetching states:", error);
        }
      };
      fetchStates();
    }
  }, [showAddStateModal]);

  useEffect(() => {
    // Fetch all states and cities for form autocomplete
    const fetchAllStatesAndCities = async () => {
      try {
        const res = await fetch("/api/hotel-destinations/states/all");
        if (res.ok) {
          const data = await res.json();
          // Group cities by state
          const grouped: Record<string, Set<string>> = {};
          data.forEach((item: any) => {
            if (!grouped[item.stateName]) {
              grouped[item.stateName] = new Set();
            }
            if (item.cityName) {
              grouped[item.stateName].add(item.cityName);
            }
          });
          // Convert to array of StateWithCities
          const result: StateWithCities[] = Object.entries(grouped).map(
            ([stateName, cities]) => ({
              stateName,
              cities: Array.from(cities),
            }),
          );
          setAllStatesWithCities(result);
          console.log("Loaded states and cities:", result);
        }
      } catch (error) {
        console.error("Error fetching states and cities:", error);
      }
    };
    fetchAllStatesAndCities();
  }, [page]);

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

  const fetchStatesAndCities = async () => {
    try {
      setStatesLoading(true);
      const res = await fetch("/api/hotel-destinations/states/all");
      if (res.ok) {
        const data = await res.json();
        setStatesAndCities(data);
      }
    } catch (error) {
      console.error("Error fetching states and cities:", error);
    } finally {
      setStatesLoading(false);
    }
  };

  const handleEditState = (state: StateData) => {
    setEditingStateId(state._id);
    setEditingStateName(state.stateName);
    setEditingCityName(state.cityName);
  };

  const handleUpdateState = async () => {
    if (!editingStateId || !editingStateName.trim()) {
      alert("State name is required");
      return;
    }

    try {
      const res = await fetch(
        `/api/hotel-destinations/states/${editingStateId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stateName: editingStateName.trim(),
            cityName: editingCityName.trim(),
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        alert("State updated successfully!");
        setEditingStateId(null);
        setEditingStateName("");
        setEditingCityName("");
        fetchStatesAndCities();
      } else {
        alert(`Failed to update state: ${data.error || "Unknown error"}`);
        console.error("Update error:", data);
      }
    } catch (error) {
      console.error("Error updating state:", error);
      alert(`Error updating state: ${String(error)}`);
    }
  };

  const handleDeleteState = async (id: string) => {
    if (!confirm("Are you sure you want to delete this state?")) return;

    try {
      const res = await fetch(`/api/hotel-destinations/states/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        alert("State deleted successfully!");
        fetchStatesAndCities();
      } else {
        alert(`Failed to delete state: ${data.error || "Unknown error"}`);
        console.error("Delete error:", data);
      }
    } catch (error) {
      console.error("Error deleting state:", error);
      alert(`Error deleting state: ${String(error)}`);
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

  const handleStateInputChange = (value: string) => {
    setAddStateInput(value);

    if (value.trim().length > 0) {
      // Filter states from the states collection
      const filtered = statesSuggestions.filter((state) =>
        state.toLowerCase().includes(value.toLowerCase()),
      );
      setStatesSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setStatesSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectStateSuggestion = (state: string) => {
    setAddStateInput(state);
    setStatesSuggestions([]);
    setShowSuggestions(false);
  };

  // Handle state input change in form page (Add New Destination)
  const handleFormStateInputChange = (value: string) => {
    setFormData((prev) => ({ ...prev, stateName: value }));

    if (value.trim().length > 0) {
      // Filter from allStatesWithCities or show all states that match
      let filtered: string[] = [];
      if (allStatesWithCities && allStatesWithCities.length > 0) {
        filtered = allStatesWithCities
          .filter((state) =>
            state.stateName.toLowerCase().includes(value.toLowerCase()),
          )
          .map((state) => state.stateName);
        // Remove duplicates
        filtered = [...new Set(filtered)];
      }
      console.log("State suggestions for:", value, "=", filtered);
      setFormStateInputSuggestions(filtered);
      setShowFormStateSuggestions(filtered.length > 0);
    } else {
      setFormStateInputSuggestions([]);
      setShowFormStateSuggestions(false);
    }
  };
  const selectFormStateSuggestion = (selectedState: string) => {
    console.log("Selecting state clicked:", selectedState);
    setFormData((prev) => ({
      ...prev,
      stateName: selectedState,
      cityName: "",
    }));
    setFormStateInputSuggestions([]);
    setShowFormStateSuggestions(false);
  };

  // Handle city input change in form page (Add New Destination)
  const handleFormCityInputChange = (value: string) => {
    setFormData((prev) => ({ ...prev, cityName: value }));

    if (value.trim().length > 0) {
      let filtered: string[] = [];

      if (formData.stateName && formData.stateName.trim()) {
        const selectedState = allStatesWithCities.find(
          (s) => s.stateName.toLowerCase() === formData.stateName.toLowerCase(),
        );
        if (selectedState) {
          filtered = selectedState.cities.filter((city) =>
            city.toLowerCase().includes(value.toLowerCase()),
          );
        }
      } else {
        const allCities = new Set<string>();
        allStatesWithCities.forEach((state) => {
          state.cities.forEach((city) => {
            if (city.toLowerCase().includes(value.toLowerCase())) {
              allCities.add(city);
            }
          });
        });
        filtered = Array.from(allCities);
      }

      setFormCityInputSuggestions(filtered);
      setShowFormCitySuggestions(filtered.length > 0);
    } else {
      setFormCityInputSuggestions([]);
      setShowFormCitySuggestions(false);
    }
  };

  const selectFormCitySuggestion = (selectedCity: string) => {
    console.log("Selecting city clicked:", selectedCity);
    setFormData((prev) => ({
      ...prev,
      cityName: selectedCity,
    }));
    setFormCityInputSuggestions([]);
    setShowFormCitySuggestions(false);
  };

  const handleAddStateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addStateInput.trim()) {
      alert("Please enter a state name");
      return;
    }

    setAddStateLoading(true);
    try {
      // Save to a separate states collection for autocomplete only
      const stateData = {
        stateName: addStateInput.trim(),
        cityName: addCityInput.trim(),
      };

      const res = await fetch("/api/hotel-destinations/states", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stateData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("State added successfully!");
        setShowAddStateModal(false);
        setAddStateInput("");
        setAddCityInput("");
        setStatesSuggestions([]);
      } else {
        alert(`Failed to add state: ${data.error || "Unknown error"}`);
        console.error("Add state error:", data);
      }
    } catch (error) {
      console.error("Error adding state:", error);
      alert(`Error adding state: ${String(error)}`);
    } finally {
      setAddStateLoading(false);
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

  const uploadItemImages = async (): Promise<void> => {
    if (itemImageFiles.length === 0 && itemProfileImageFile === null) {
      return; // No images to upload
    }

    setUploadingItemImages(true);
    const uploadedUrls: string[] = [];

    try {
      // Upload gallery images
      for (const file of itemImageFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        }
      }

      // Upload profile image
      let profileImageUrl = "";
      if (itemProfileImageFile) {
        const formData = new FormData();
        formData.append("file", itemProfileImageFile);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          profileImageUrl = data.url;
        }
      }

      setItemImageUrls(uploadedUrls);
      setItemProfileImageUrl(profileImageUrl);
    } catch (error) {
      console.error("Failed to upload images:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setUploadingItemImages(false);
    }
  };

  const addItemToCurrentCategory = async () => {
    if (!itemName.trim()) {
      alert("Please enter item name");
      return;
    }

    // Upload images first
    if (itemImageFiles.length > 0 || itemProfileImageFile) {
      await uploadItemImages();
    }

    const newItem: DestinationItem = {
      name: itemName,
      description: itemDescription,
      images: itemImageUrls.length > 0 ? itemImageUrls : [],
      profileImage: itemProfileImageUrl || undefined,
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
    setItemImageUrls([]);
    setItemProfileImageFile(null);
    setItemProfileImagePreview("");
    setItemProfileImageUrl("");
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
        // Save state-city combination to database
        const stateCityCombination = {
          stateName: formData.stateName.trim(),
          cityName: formData.cityName.trim(),
        };

        // Try to add to states collection (it will skip if already exists)
        try {
          const stateRes = await fetch("/api/hotel-destinations/states", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(stateCityCombination),
          });
          if (!stateRes.ok) {
            const errorData = await stateRes.json();
            // Log but don't fail if state already exists
            if (!errorData.error?.includes("already exists")) {
              console.error("Error saving state-city combination:", errorData);
            }
          }
        } catch (error) {
          console.error("Error saving state-city combination:", error);
        }

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

                <div style={{ marginBottom: "1.5rem", position: "relative" }}>
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
                    onChange={(e) => handleFormStateInputChange(e.target.value)}
                    onFocus={() => setShowFormStateSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowFormStateSuggestions(false), 250)
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
                  {showFormStateSuggestions &&
                    formStateInputSuggestions.length > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          background: "#fff",
                          border: "1px solid #e0e0e0",
                          borderTop: "none",
                          borderRadius: "0 0 8px 8px",
                          maxHeight: "200px",
                          overflowY: "auto",
                          zIndex: 10,
                          marginTop: "-2px",
                          paddingTop: "0.5rem",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        }}
                      >
                        {formStateInputSuggestions.map((state, idx) => (
                          <div
                            key={idx}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              selectFormStateSuggestion(state);
                            }}
                            style={{
                              padding: "0.75rem 1rem",
                              cursor: "pointer",
                              background: idx % 2 === 0 ? "#f9fafb" : "#ffffff",
                              borderBottom:
                                idx < formStateInputSuggestions.length - 1
                                  ? "1px solid #f0f0f0"
                                  : "none",
                              transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#e0e7ff")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background =
                                idx % 2 === 0 ? "#f9fafb" : "#ffffff")
                            }
                          >
                            {state}
                          </div>
                        ))}
                      </div>
                    )}
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

                <div style={{ marginBottom: "1.5rem", position: "relative" }}>
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
                    onChange={(e) => handleFormCityInputChange(e.target.value)}
                    onFocus={() => setShowFormCitySuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowFormCitySuggestions(false), 250)
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
                  {showFormCitySuggestions &&
                    formCityInputSuggestions.length > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          background: "#fff",
                          border: "1px solid #e0e0e0",
                          borderTop: "none",
                          borderRadius: "0 0 8px 8px",
                          maxHeight: "200px",
                          overflowY: "auto",
                          zIndex: 10,
                          marginTop: "-2px",
                          paddingTop: "0.5rem",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        }}
                      >
                        {formCityInputSuggestions.map((city, idx) => (
                          <div
                            key={idx}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              selectFormCitySuggestion(city);
                            }}
                            style={{
                              padding: "0.75rem 1rem",
                              cursor: "pointer",
                              background: idx % 2 === 0 ? "#f9fafb" : "#ffffff",
                              borderBottom:
                                idx < formCityInputSuggestions.length - 1
                                  ? "1px solid #f0f0f0"
                                  : "none",
                              transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#e0e7ff")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background =
                                idx % 2 === 0 ? "#f9fafb" : "#ffffff")
                            }
                          >
                            {city}
                          </div>
                        ))}
                      </div>
                    )}
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

                    {uploadingItemImages && (
                      <div
                        style={{
                          padding: "0.75rem",
                          background: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          borderRadius: "8px",
                          marginBottom: "1rem",
                          color: "#1e40af",
                          fontSize: "0.9rem",
                        }}
                      >
                        ⏳ Uploading images... Please wait.
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={addItemToCurrentCategory}
                      disabled={uploadingItemImages}
                      style={{
                        background:
                          editingItemIdx !== null ? "#10b981" : "#667eea",
                        color: "#fff",
                        border: "none",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "8px",
                        cursor: uploadingItemImages ? "not-allowed" : "pointer",
                        fontWeight: "600",
                        opacity: uploadingItemImages ? 0.6 : 1,
                      }}
                    >
                      {uploadingItemImages
                        ? "Uploading..."
                        : editingItemIdx !== null
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
                          setItemImageUrls([]);
                          setItemProfileImageUrl("");
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

  // MANAGE STATES PAGE
  if (page === "manage_states") {
    if (statesLoading) {
      return (
        <div
          style={{
            padding: "2rem",
            paddingTop: "5rem",
            maxWidth: "1200px",
            margin: "0 auto",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "1.1rem", color: "#666" }}>
            Loading states and cities...
          </div>
        </div>
      );
    }

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
            onClick={() => setPage("list")}
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
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#1a1a2e",
            }}
          >
            🗺️ Manage States & Cities
          </h1>
        </div>

        {/* States Table */}
        {statesAndCities.length === 0 ? (
          <div
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: "12px",
              textAlign: "center",
              color: "#666",
            }}
          >
            No states added yet. Click "Add State" to create one.
          </div>
        ) : (
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "1.5rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontWeight: "700",
                      color: "#1a1a2e",
                    }}
                  >
                    State Name
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontWeight: "700",
                      color: "#1a1a2e",
                    }}
                  >
                    City Name
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "center",
                      fontWeight: "700",
                      color: "#1a1a2e",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Group cities by state
                  const groupedByState = statesAndCities.reduce(
                    (acc, item) => {
                      const stateName = item.stateName;
                      if (!acc[stateName]) {
                        acc[stateName] = [];
                      }
                      acc[stateName].push(item);
                      return acc;
                    },
                    {} as Record<string, typeof statesAndCities>,
                  );

                  // Render grouped states and cities
                  return Object.entries(groupedByState).map(
                    ([stateName, cities]) => (
                      <React.Fragment key={stateName}>
                        {cities.map((city, cityIdx) => (
                          <tr
                            key={city._id}
                            style={{
                              borderBottom: "1px solid #f0f0f0",
                              background:
                                editingStateId === city._id
                                  ? "#f9fafb"
                                  : "#fff",
                            }}
                          >
                            <td style={{ padding: "1rem" }}>
                              {cityIdx === 0 ? (
                                <span
                                  style={{
                                    color: "#1a1a2e",
                                    fontWeight: "700",
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  {stateName}
                                </span>
                              ) : (
                                ""
                              )}
                            </td>
                            <td
                              style={{
                                padding: "1rem",
                                paddingLeft: "2rem",
                              }}
                            >
                              {editingStateId === city._id ? (
                                <input
                                  type="text"
                                  value={editingCityName}
                                  onChange={(e) =>
                                    setEditingCityName(e.target.value)
                                  }
                                  placeholder="Optional"
                                  style={{
                                    width: "100%",
                                    padding: "0.5rem",
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "6px",
                                    fontSize: "0.95rem",
                                    fontFamily: "inherit",
                                  }}
                                />
                              ) : (
                                <span style={{ color: "#666" }}>
                                  {city.cityName || "—"}
                                </span>
                              )}
                            </td>
                            <td
                              style={{
                                padding: "1rem",
                                textAlign: "center",
                                display: "flex",
                                gap: "0.5rem",
                                justifyContent: "center",
                              }}
                            >
                              {editingStateId === city._id ? (
                                <>
                                  <button
                                    onClick={handleUpdateState}
                                    style={{
                                      padding: "0.5rem 1rem",
                                      background: "#10b981",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                      fontWeight: "600",
                                      fontSize: "0.85rem",
                                    }}
                                  >
                                    ✓ Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingStateId(null);
                                      setEditingStateName("");
                                      setEditingCityName("");
                                    }}
                                    style={{
                                      padding: "0.5rem 1rem",
                                      background: "#6b7280",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                      fontWeight: "600",
                                      fontSize: "0.85rem",
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEditState(city)}
                                    style={{
                                      padding: "0.5rem 1rem",
                                      background: "#3b82f6",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                      fontWeight: "600",
                                      fontSize: "0.85rem",
                                    }}
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteState(city._id)}
                                    style={{
                                      padding: "0.5rem 1rem",
                                      background: "#ef4444",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                      fontWeight: "600",
                                      fontSize: "0.85rem",
                                    }}
                                  >
                                    🗑️ Delete
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ),
                  );
                })()}
              </tbody>
            </table>
          </div>
        )}
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
        <button
          onClick={() => setShowAddStateModal(true)}
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
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
          ⚡ Add State
        </button>
        <button
          onClick={() => {
            fetchStatesAndCities();
            setPage("manage_states");
          }}
          style={{
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
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
          📋 Manage States
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

      {/* Add State Modal */}
      {showAddStateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowAddStateModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "2rem",
              maxWidth: "600px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                color: "#1a1a2e",
                marginTop: 0,
                marginBottom: "1.5rem",
              }}
            >
              ⚡ Add State
            </h2>

            <form onSubmit={handleAddStateSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                {/* State Column */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    State Name *
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      placeholder="e.g., Rajasthan"
                      value={addStateInput}
                      onChange={(e) => handleStateInputChange(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "2px solid #e0e0e0",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        boxSizing: "border-box",
                        fontFamily: "inherit",
                      }}
                      autoFocus
                      disabled={addStateLoading}
                    />

                    {/* Autocomplete suggestions */}
                    {showSuggestions && statesSuggestions.length > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          background: "#fff",
                          border: "1px solid #e0e0e0",
                          borderTop: "none",
                          borderBottomLeftRadius: "8px",
                          borderBottomRightRadius: "8px",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          zIndex: 10,
                          maxHeight: "200px",
                          overflowY: "auto",
                        }}
                      >
                        {statesSuggestions.map((state, idx) => (
                          <div
                            key={idx}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              selectStateSuggestion(state);
                            }}
                            style={{
                              padding: "0.75rem",
                              cursor: "pointer",
                              background: "#fff",
                              borderBottom:
                                idx < statesSuggestions.length - 1
                                  ? "1px solid #f0f0f0"
                                  : "none",
                              transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f8fafc";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#fff";
                            }}
                          >
                            {state}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* City Column */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    City Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Jaipur (Optional)"
                    value={addCityInput}
                    onChange={(e) => setAddCityInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                    disabled={addStateLoading}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowAddStateModal(false);
                    setAddStateInput("");
                    setAddCityInput("");
                    setStatesSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  disabled={addStateLoading}
                  style={{
                    padding: "0.75rem 1.5rem",
                    border: "2px solid #e0e0e0",
                    background: "#fff",
                    color: "#374151",
                    borderRadius: "8px",
                    cursor: addStateLoading ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    fontSize: "0.95rem",
                    transition: "all 0.3s ease",
                    opacity: addStateLoading ? 0.6 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addStateLoading}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: addStateLoading
                      ? "#9ca3af"
                      : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: addStateLoading ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    fontSize: "0.95rem",
                    transition: "all 0.3s ease",
                  }}
                >
                  {addStateLoading ? "Adding..." : "✓ Add State"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
