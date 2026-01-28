"use client";

import React, { useEffect, useState } from "react";

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

interface RefundTier {
  timeframe: string;
  refundInfo: string;
}

interface CarryCategory {
  category: string;
  items: string[];
}

interface CustomField {
  id: string;
  section: "overview" | "itinerary" | "inclusions" | "essentials" | "policies";
  fieldName: string;
  fieldType: "text" | "textarea" | "list";
  value: string | string[];
}

interface GlobalFormField {
  _id: string;
  fieldName: string;
  fieldType: "text" | "textarea" | "number" | "list" | "select" | "checkbox";
  section: string;
  entityType: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options: string[];
  active: boolean;
  order: number;
}

interface Package {
  _id?: string;
  // Basic Details
  title: string;
  duration: string;
  startingPoint: string;
  category: string;
  badge: string;
  description: string;
  image: string;
  price: number | null;
  currency: string;
  featured: boolean;
  active: boolean;
  // Deep Details
  fullDescription: string;
  importantNotes: string[];
  itinerary: ItineraryDay[];
  gallery: string[];
  inclusions: string[];
  exclusions: string[];
  thingsToCarry: CarryCategory[];
  refundTiers: RefundTier[];
  refundPolicyNotes: string;
  customFields?: CustomField[];
}

const emptyPackage: Package = {
  title: "",
  duration: "",
  startingPoint: "",
  category: "",
  badge: "",
  description: "",
  image: "",
  price: null,
  currency: "INR",
  featured: false,
  active: true,
  fullDescription: "",
  importantNotes: [],
  itinerary: [],
  gallery: [],
  inclusions: [],
  exclusions: [],
  thingsToCarry: [],
  refundTiers: [],
  refundPolicyNotes: "",
  customFields: [],
};

interface Category {
  _id: string;
  name: string;
  active: boolean;
  order: number;
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "2rem",
    maxWidth: "1400px",
    margin: "0 auto",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    padding: "1.5rem 2rem",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    borderRadius: "16px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
  },
  headerTitle: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#fff",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  addButton: {
    background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
    color: "#fff",
    padding: "0.875rem 1.75rem",
    borderRadius: "12px",
    border: "none",
    fontWeight: "600",
    fontSize: "0.95rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(0,212,255,0.3)",
  },
  tableCard: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  tableHeader: {
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableHeaderTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#334155",
    margin: 0,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
  },
  th: {
    padding: "1rem 1.25rem",
    textAlign: "left" as const,
    fontSize: "0.75rem",
    fontWeight: "600",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: "#64748b",
    background: "#f8fafc",
    borderBottom: "2px solid #e2e8f0",
  },
  td: {
    padding: "1rem 1.25rem",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "middle" as const,
  },
  packageImage: {
    width: "70px",
    height: "50px",
    objectFit: "cover" as const,
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.3rem 0.6rem",
    borderRadius: "20px",
    fontSize: "0.7rem",
    fontWeight: "600",
  },
  badgeActive: {
    background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
    color: "#166534",
  },
  badgeInactive: {
    background: "#f1f5f9",
    color: "#64748b",
  },
  actionButton: {
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    border: "none",
    fontSize: "0.8rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginRight: "0.4rem",
  },
  editButton: {
    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
    color: "#1d4ed8",
  },
  deleteButton: {
    background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
    color: "#dc2626",
  },
  formCard: {
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  formHeader: {
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    padding: "1.5rem 2rem",
    color: "#fff",
  },
  formTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    margin: 0,
  },
  tabsContainer: {
    display: "flex",
    borderBottom: "2px solid #e2e8f0",
    background: "#f8fafc",
    padding: "0 1rem",
    overflowX: "auto" as const,
  },
  tab: {
    padding: "1rem 1.5rem",
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#64748b",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    position: "relative" as const,
    whiteSpace: "nowrap" as const,
  },
  tabActive: {
    color: "#0066cc",
    fontWeight: "600",
  },
  tabIndicator: {
    position: "absolute" as const,
    bottom: "-2px",
    left: "0",
    right: "0",
    height: "3px",
    background: "linear-gradient(135deg, #00d4ff 0%, #0066cc 100%)",
    borderRadius: "3px 3px 0 0",
  },
  formContent: {
    padding: "2rem",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
  },
  formGridThree: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "1.5rem",
  },
  formGroup: {
    marginBottom: "1.5rem",
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "0.5rem",
  },
  input: {
    width: "100%",
    padding: "0.875rem 1rem",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "0.95rem",
    outline: "none",
    background: "#fff",
    boxSizing: "border-box" as const,
  },
  textarea: {
    width: "100%",
    padding: "0.875rem 1rem",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "0.95rem",
    outline: "none",
    resize: "vertical" as const,
    minHeight: "100px",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
  },
  select: {
    width: "100%",
    padding: "0.875rem 1rem",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "0.95rem",
    outline: "none",
    background: "#fff",
    cursor: "pointer",
    boxSizing: "border-box" as const,
  },
  checkbox: {
    width: "1.25rem",
    height: "1.25rem",
    accentColor: "#0066cc",
    cursor: "pointer",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#374151",
    cursor: "pointer",
    padding: "0.75rem 1rem",
    background: "#f8fafc",
    borderRadius: "10px",
  },
  imagePreview: {
    marginTop: "1rem",
    width: "160px",
    height: "112px",
    objectFit: "cover" as const,
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    border: "3px solid #e5e7eb",
  },
  sectionTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "1rem",
    paddingBottom: "0.75rem",
    borderBottom: "2px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  arrayItemRow: {
    display: "flex",
    gap: "0.75rem",
    marginBottom: "0.75rem",
    alignItems: "center",
  },
  removeButton: {
    padding: "0.5rem 0.75rem",
    background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
    color: "#dc2626",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.8rem",
    fontWeight: "500",
    cursor: "pointer",
  },
  addItemButton: {
    padding: "0.75rem 1.25rem",
    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
    color: "#0369a1",
    border: "2px dashed #7dd3fc",
    borderRadius: "10px",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1rem",
    marginTop: "1rem",
  },
  galleryItem: {
    position: "relative" as const,
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  galleryImage: {
    width: "100%",
    height: "80px",
    objectFit: "cover" as const,
  },
  galleryRemove: {
    position: "absolute" as const,
    top: "4px",
    right: "4px",
    width: "24px",
    height: "24px",
    background: "rgba(220, 38, 38, 0.9)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  itineraryCard: {
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    borderRadius: "12px",
    padding: "1.25rem",
    marginBottom: "1rem",
    border: "1px solid #e2e8f0",
  },
  itineraryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  itineraryDayBadge: {
    background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
    color: "#fff",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    padding: "1.5rem 2rem",
    background: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
  },
  cancelButton: {
    padding: "0.875rem 2rem",
    background: "#fff",
    color: "#64748b",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  submitButton: {
    padding: "0.875rem 2rem",
    background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(0, 102, 204, 0.3)",
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "400px",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #0066cc",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  emptyState: {
    padding: "4rem 2rem",
    textAlign: "center" as const,
  },
  price: {
    fontWeight: "700",
    color: "#059669",
    fontSize: "0.9rem",
  },
  enquirePrice: {
    fontWeight: "600",
    color: "#0066cc",
    fontSize: "0.85rem",
    fontStyle: "italic" as const,
  },
};

export default function AdminPackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [formData, setFormData] = useState<Package>(emptyPackage);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "basic" | "details" | "itinerary" | "lists" | "policy"
  >("basic");

  // Category management state
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    order: 0,
  });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );

  // Global form fields state
  const [globalFormFields, setGlobalFormFields] = useState<GlobalFormField[]>(
    [],
  );
  const [formFieldValues, setFormFieldValues] = useState<Record<string, any>>(
    {},
  );

  const formatPrice = (price: number | null, currency: string) => {
    if (price === null || price === 0) {
      return null;
    }
    if (currency === "INR") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(price);
    }
    return `$${price}`;
  };

  useEffect(() => {
    fetchPackages();
    fetchCategories();
    fetchGlobalFormFields();
  }, []);

  const fetchGlobalFormFields = async () => {
    try {
      const response = await fetch("/api/admin/form-fields?entityType=package");
      if (response.ok) {
        const data = await response.json();
        setGlobalFormFields(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch global form fields:", error);
    }
  };
  useEffect(() => {
    fetchPackages();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories?all=true");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/packages", {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setPackages(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "image" | "gallery",
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const formDataUpload = new FormData();

    // Add all files to FormData
    for (let i = 0; i < files.length; i++) {
      formDataUpload.append("file", files[i]);
    }

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();

        if (field === "image") {
          // For cover image, use first file only
          const url = data.url || data.files?.[0]?.url;
          setFormData({ ...formData, image: url });
        } else if (field === "gallery") {
          // For gallery, handle single or multiple files
          const urls = data.files
            ? data.files.map((f: any) => f.url)
            : [data.url];

          setFormData({
            ...formData,
            gallery: [...formData.gallery, ...urls],
          });
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
      // Reset input so same files can be selected again
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Merge global form fields into customFields
    const mergedCustomFields = [...(formData.customFields || [])];

    // Add global form field values
    globalFormFields.forEach((field) => {
      const fieldKey = `${field.section}_${field._id}`;
      const value = formFieldValues[fieldKey];

      // Only add if there's a value
      if (
        value !== undefined &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        // Remove existing entry if any
        const existingIndex = mergedCustomFields.findIndex(
          (cf) =>
            cf.fieldName === field.fieldName && cf.section === field.section,
        );
        if (existingIndex >= 0) {
          mergedCustomFields.splice(existingIndex, 1);
        }

        // Add new entry
        mergedCustomFields.push({
          id: field._id,
          fieldName: field.fieldName,
          fieldType:
            field.fieldType === "number" ||
            field.fieldType === "select" ||
            field.fieldType === "checkbox"
              ? "text"
              : field.fieldType,
          section: field.section as any,
          value: value,
        });
      }
    });

    const dataToSave = {
      ...formData,
      customFields: mergedCustomFields,
    };

    const url = editingId
      ? `/api/admin/packages/${editingId}`
      : "/api/admin/packages";
    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        fetchPackages();
        setFormData(emptyPackage);
        setEditingId(null);
        setShowForm(false);
        setActiveTab("basic");
        alert(
          editingId
            ? "Package updated successfully!"
            : "Package added successfully!",
        );
      } else {
        const error = await response.json();
        alert(`Failed: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error saving package:", error);
      alert("Failed to save package");
    }
  };

  const handleEdit = (pkg: Package) => {
    // Ensure thingsToCarry has proper structure
    const normalizedThingsToCarry = (pkg.thingsToCarry || []).map((item) => {
      if (typeof item === "string") {
        // Old format: convert string to category object
        return { category: "General", items: [item] };
      }
      // Ensure items array exists
      return {
        category: item.category || "",
        items: item.items || [],
      };
    });

    setFormData({
      ...pkg,
      thingsToCarry: normalizedThingsToCarry,
      refundTiers: pkg.refundTiers || [],
      refundPolicyNotes: pkg.refundPolicyNotes || "",
      customFields: pkg.customFields || [],
    });

    // Load global form field values
    const fieldValues: Record<string, any> = {};
    globalFormFields.forEach((field) => {
      const existingCustomField = pkg.customFields?.find(
        (cf) =>
          cf.fieldName === field.fieldName && cf.section === field.section,
      );
      if (existingCustomField) {
        fieldValues[`${field.section}_${field._id}`] =
          existingCustomField.value;
      }
    });
    setFormFieldValues(fieldValues);

    setEditingId(pkg._id || null);
    setShowForm(true);
    setActiveTab("basic");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    try {
      const response = await fetch(`/api/admin/packages/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchPackages();
        alert("Package deleted successfully!");
      } else {
        alert("Failed to delete package");
      }
    } catch (error) {
      console.error("Error deleting package:", error);
      alert("Failed to delete package");
    }
  };

  const handleCancel = () => {
    setFormData(emptyPackage);
    setEditingId(null);
    setShowForm(false);
    setActiveTab("basic");
    setFormFieldValues({});
  };

  // Itinerary handlers
  const addItineraryDay = () => {
    const newDay = {
      day: formData.itinerary.length + 1,
      title: "",
      description: "",
    };
    setFormData({ ...formData, itinerary: [...formData.itinerary, newDay] });
  };

  const removeItineraryDay = (index: number) => {
    const updated = formData.itinerary.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      itinerary: updated.map((item, i) => ({ ...item, day: i + 1 })),
    });
  };

  const updateItineraryDay = (
    index: number,
    field: keyof ItineraryDay,
    value: string | number,
  ) => {
    const updated = [...formData.itinerary];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, itinerary: updated });
  };

  // Array field handlers
  const addArrayItem = (
    field: "importantNotes" | "inclusions" | "exclusions" | "thingsToCarry",
  ) => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const updateArrayItem = (
    field: "importantNotes" | "inclusions" | "exclusions" | "thingsToCarry",
    index: number,
    value: string,
  ) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const removeArrayItem = (
    field: "importantNotes" | "inclusions" | "exclusions" | "thingsToCarry",
    index: number,
  ) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  const removeGalleryImage = (index: number) => {
    setFormData({
      ...formData,
      gallery: formData.gallery.filter((_, i) => i !== index),
    });
  };

  // Custom fields handlers
  const addCustomField = (
    section:
      | "overview"
      | "itinerary"
      | "inclusions"
      | "essentials"
      | "policies",
  ) => {
    const newField: CustomField = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      section,
      fieldName: "",
      fieldType: "text",
      value: "",
    };
    setFormData({
      ...formData,
      customFields: [...(formData.customFields || []), newField],
    });
  };

  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    const updated = (formData.customFields || []).map((field) =>
      field.id === id ? { ...field, ...updates } : field,
    );
    setFormData({ ...formData, customFields: updated });
  };

  const removeCustomField = (id: string) => {
    setFormData({
      ...formData,
      customFields: (formData.customFields || []).filter((f) => f.id !== id),
    });
  };

  const addCustomFieldListItem = (fieldId: string) => {
    const field = (formData.customFields || []).find((f) => f.id === fieldId);
    if (field && field.fieldType === "list") {
      const currentValue = Array.isArray(field.value) ? field.value : [];
      updateCustomField(fieldId, { value: [...currentValue, ""] });
    }
  };

  const updateCustomFieldListItem = (
    fieldId: string,
    itemIndex: number,
    value: string,
  ) => {
    const field = (formData.customFields || []).find((f) => f.id === fieldId);
    if (field && Array.isArray(field.value)) {
      const updated = [...field.value];
      updated[itemIndex] = value;
      updateCustomField(fieldId, { value: updated });
    }
  };

  const removeCustomFieldListItem = (fieldId: string, itemIndex: number) => {
    const field = (formData.customFields || []).find((f) => f.id === fieldId);
    if (field && Array.isArray(field.value)) {
      const updated = field.value.filter((_, i) => i !== itemIndex);
      updateCustomField(fieldId, { value: updated });
    }
  };

  // Category Management Functions
  const handleAddCategory = async () => {
    if (!categoryFormData.name.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryFormData),
      });

      if (response.ok) {
        await fetchCategories();
        setCategoryFormData({ name: "", order: 0 });
        alert("Category added successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add category");
      }
    } catch (error) {
      console.error("Failed to add category:", error);
      alert("Failed to add category");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategoryId || !categoryFormData.name.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/categories?id=${editingCategoryId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryFormData),
        },
      );

      if (response.ok) {
        await fetchCategories();
        setEditingCategoryId(null);
        setCategoryFormData({ name: "", order: 0 });
        alert("Category updated successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update category");
      }
    } catch (error) {
      console.error("Failed to update category:", error);
      alert("Failed to update category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCategories();
        alert("Category deleted successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Failed to delete category");
    }
  };

  const startEditCategory = (category: Category) => {
    setEditingCategoryId(category._id);
    setCategoryFormData({
      name: category.name,
      order: category.order,
    });
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setCategoryFormData({ name: "", order: 0 });
  };

  // Render Custom Fields Section (reusable)
  const renderCustomFieldsSection = (
    section:
      | "overview"
      | "itinerary"
      | "inclusions"
      | "essentials"
      | "policies",
  ) => {
    return (
      <div
        style={{
          marginTop: "2rem",
          paddingTop: "2rem",
          borderTop: "2px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h3
            style={{
              ...styles.sectionTitle,
              marginBottom: 0,
              border: "none",
              paddingBottom: 0,
            }}
          >
            ✨ Custom Fields
          </h3>
          <button
            type="button"
            onClick={() => addCustomField(section)}
            style={styles.addItemButton}
          >
            + Add Custom Field
          </button>
        </div>
        {(formData.customFields || [])
          .filter((f) => f.section === section)
          .map((field) => (
            <div
              key={field.id}
              style={{
                marginBottom: "1.5rem",
                padding: "1.25rem",
                backgroundColor: "#f8fafc",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}
              >
                <div style={{ flex: 1 }}>
                  <label style={{ ...styles.label, fontSize: "0.85rem" }}>
                    Field Name
                  </label>
                  <input
                    type="text"
                    value={field.fieldName}
                    onChange={(e) =>
                      updateCustomField(field.id, { fieldName: e.target.value })
                    }
                    style={styles.input}
                    placeholder="e.g., Nearby Places, Best Time to Visit"
                  />
                </div>
                <div style={{ width: "150px" }}>
                  <label style={{ ...styles.label, fontSize: "0.85rem" }}>
                    Field Type
                  </label>
                  <select
                    value={field.fieldType}
                    onChange={(e) => {
                      const newType = e.target.value as
                        | "text"
                        | "textarea"
                        | "list";
                      updateCustomField(field.id, {
                        fieldType: newType,
                        value: newType === "list" ? [] : "",
                      });
                    }}
                    style={styles.select}
                  >
                    <option value="text">Short Text</option>
                    <option value="textarea">Long Text</option>
                    <option value="list">List</option>
                  </select>
                </div>
              </div>

              {field.fieldType === "text" && (
                <input
                  type="text"
                  value={field.value as string}
                  onChange={(e) =>
                    updateCustomField(field.id, { value: e.target.value })
                  }
                  style={styles.input}
                  placeholder="Enter value"
                />
              )}

              {field.fieldType === "textarea" && (
                <textarea
                  value={field.value as string}
                  onChange={(e) =>
                    updateCustomField(field.id, { value: e.target.value })
                  }
                  style={{ ...styles.textarea, minHeight: "100px" }}
                  placeholder="Enter detailed content"
                  rows={4}
                />
              )}

              {field.fieldType === "list" && (
                <div>
                  {(Array.isArray(field.value) ? field.value : []).map(
                    (item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <input
                          type="text"
                          value={item}
                          onChange={(e) =>
                            updateCustomFieldListItem(
                              field.id,
                              idx,
                              e.target.value,
                            )
                          }
                          style={{ ...styles.input, flex: 1 }}
                          placeholder={`Item ${idx + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removeCustomFieldListItem(field.id, idx)
                          }
                          style={styles.removeButton}
                        >
                          ✕
                        </button>
                      </div>
                    ),
                  )}
                  <button
                    type="button"
                    onClick={() => addCustomFieldListItem(field.id)}
                    style={{
                      ...styles.addItemButton,
                      fontSize: "0.85rem",
                      padding: "0.5rem 1rem",
                    }}
                  >
                    + Add Item
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => removeCustomField(field.id)}
                style={{
                  ...styles.removeButton,
                  marginTop: "1rem",
                  width: "100%",
                }}
              >
                Remove Field
              </button>
            </div>
          ))}
        {(formData.customFields || []).filter((f) => f.section === section)
          .length === 0 && (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: "2rem" }}>
            No custom fields added yet. Click &quot;Add Custom Field&quot; to
            create one.
          </p>
        )}
      </div>
    );
  };

  // Render global form fields section
  const renderGlobalFormFields = (section: string) => {
    const sectionFields = globalFormFields.filter(
      (field) => field.section === section && field.active,
    );

    if (sectionFields.length === 0) return null;

    return (
      <div
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          backgroundColor: "#ecfdf5",
          borderRadius: "12px",
          border: "2px solid #10b981",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ color: "#059669", fontSize: "1.5rem" }}
          >
            settings
          </span>
          <h4
            style={{
              margin: 0,
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#059669",
            }}
          >
            Global Form Fields
          </h4>
          <span
            style={{
              fontSize: "0.75rem",
              color: "#6b7280",
              marginLeft: "0.5rem",
            }}
          >
            (Managed in Form Control Center)
          </span>
        </div>

        <div style={{ display: "grid", gap: "1.25rem" }}>
          {sectionFields.map((field) => {
            const fieldKey = `${field.section}_${field._id}`;
            const value = formFieldValues[fieldKey] || "";

            return (
              <div key={field._id}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "0.5rem",
                  }}
                >
                  {field.fieldName}
                  {field.required && (
                    <span style={{ color: "#dc2626", marginLeft: "0.25rem" }}>
                      *
                    </span>
                  )}
                </label>
                {field.helpText && (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "#6b7280",
                      margin: "0 0 0.5rem 0",
                    }}
                  >
                    {field.helpText}
                  </p>
                )}

                {/* Text input */}
                {field.fieldType === "text" && (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      setFormFieldValues({
                        ...formFieldValues,
                        [fieldKey]: e.target.value,
                      })
                    }
                    placeholder={field.placeholder}
                    required={field.required}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.95rem",
                    }}
                  />
                )}

                {/* Textarea */}
                {field.fieldType === "textarea" && (
                  <textarea
                    value={value}
                    onChange={(e) =>
                      setFormFieldValues({
                        ...formFieldValues,
                        [fieldKey]: e.target.value,
                      })
                    }
                    placeholder={field.placeholder}
                    required={field.required}
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.95rem",
                      resize: "vertical",
                    }}
                  />
                )}

                {/* Number input */}
                {field.fieldType === "number" && (
                  <input
                    type="number"
                    value={value}
                    onChange={(e) =>
                      setFormFieldValues({
                        ...formFieldValues,
                        [fieldKey]: e.target.value,
                      })
                    }
                    placeholder={field.placeholder}
                    required={field.required}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.95rem",
                    }}
                  />
                )}

                {/* List input */}
                {field.fieldType === "list" && (
                  <div>
                    {(Array.isArray(value) ? value : []).map(
                      (item: string, idx: number) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const newList = [
                                ...(Array.isArray(value) ? value : []),
                              ];
                              newList[idx] = e.target.value;
                              setFormFieldValues({
                                ...formFieldValues,
                                [fieldKey]: newList,
                              });
                            }}
                            placeholder={`Item ${idx + 1}`}
                            style={{
                              flex: 1,
                              padding: "0.625rem",
                              borderRadius: "8px",
                              border: "1px solid #d1d5db",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newList = (
                                Array.isArray(value) ? value : []
                              ).filter((_: any, i: number) => i !== idx);
                              setFormFieldValues({
                                ...formFieldValues,
                                [fieldKey]: newList,
                              });
                            }}
                            style={{
                              padding: "0.625rem 1rem",
                              backgroundColor: "#fee2e2",
                              color: "#dc2626",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ),
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const currentList = Array.isArray(value) ? value : [];
                        setFormFieldValues({
                          ...formFieldValues,
                          [fieldKey]: [...currentList, ""],
                        });
                      }}
                      style={{
                        padding: "0.625rem 1rem",
                        backgroundColor: "#f1f5f9",
                        color: "#475569",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                      }}
                    >
                      + Add Item
                    </button>
                  </div>
                )}

                {/* Select dropdown */}
                {field.fieldType === "select" && (
                  <select
                    value={value}
                    onChange={(e) =>
                      setFormFieldValues({
                        ...formFieldValues,
                        [fieldKey]: e.target.value,
                      })
                    }
                    required={field.required}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.95rem",
                    }}
                  >
                    <option value="">Select an option</option>
                    {field.options.map((option, idx) => (
                      <option key={idx} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {/* Checkbox */}
                {field.fieldType === "checkbox" && (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={value === true || value === "true"}
                      onChange={(e) =>
                        setFormFieldValues({
                          ...formFieldValues,
                          [fieldKey]: e.target.checked,
                        })
                      }
                      style={{ width: "18px", height: "18px" }}
                    />
                    <span style={{ fontSize: "0.9rem", color: "#374151" }}>
                      {field.placeholder || "Enable this option"}
                    </span>
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p style={{ color: "#64748b" }}>Loading packages...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>📦 Manage Packages</h1>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setFormData(emptyPackage);
              setEditingId(null);
              setActiveTab("basic");
            }}
            style={styles.addButton}
          >
            + Add New Package
          </button>
        )}
      </div>

      {/* Package List */}
      {!showForm && (
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h3 style={styles.tableHeaderTitle}>
              All Packages ({packages.length})
            </h3>
          </div>

          {packages.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📭</div>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "1.1rem",
                  marginBottom: "1.5rem",
                }}
              >
                No packages found. Create your first package!
              </p>
              <button
                onClick={() => setShowForm(true)}
                style={styles.addButton}
              >
                + Add New Package
              </button>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Image</th>
                  <th style={styles.th}>Package Name</th>
                  <th style={styles.th}>Duration</th>
                  <th style={styles.th}>Starting Point</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg._id}>
                    <td style={styles.td}>
                      {pkg.image ? (
                        <img
                          src={pkg.image}
                          alt={pkg.title}
                          style={styles.packageImage}
                        />
                      ) : (
                        <div
                          style={{
                            ...styles.packageImage,
                            background: "#f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          🖼️
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div
                        style={{
                          fontWeight: "600",
                          color: "#1e293b",
                          fontSize: "0.9rem",
                        }}
                      >
                        {pkg.title}
                      </div>
                      {pkg.badge && (
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {pkg.badge}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>{pkg.duration}</td>
                    <td style={styles.td}>{pkg.startingPoint}</td>
                    <td style={styles.td}>{pkg.category}</td>
                    <td style={styles.td}>
                      {formatPrice(pkg.price, pkg.currency) ? (
                        <span style={styles.price}>
                          {formatPrice(pkg.price, pkg.currency)}
                        </span>
                      ) : (
                        <span style={styles.enquirePrice}>Enquire</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          ...(pkg.active
                            ? styles.badgeActive
                            : styles.badgeInactive),
                        }}
                      >
                        {pkg.active ? "✓ Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleEdit(pkg)}
                        style={{ ...styles.actionButton, ...styles.editButton }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(pkg._id!)}
                        style={{
                          ...styles.actionButton,
                          ...styles.deleteButton,
                        }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>
              {editingId ? "✏️ Edit Package" : "➕ Add New Package"}
            </h2>
          </div>

          {/* Tabs */}
          <div style={styles.tabsContainer}>
            {[
              { id: "basic", label: "📋 Basic Info" },
              { id: "details", label: "📝 Description & Gallery" },
              { id: "itinerary", label: "🗓️ Itinerary" },
              { id: "lists", label: "✅ Inclusions/Exclusions" },
              { id: "policy", label: "💳 Policy & Notes" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                style={{
                  ...styles.tab,
                  ...(activeTab === tab.id ? styles.tabActive : {}),
                }}
              >
                {tab.label}
                {activeTab === tab.id && <div style={styles.tabIndicator} />}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.formContent}>
              {/* Basic Info Tab */}
              {activeTab === "basic" && (
                <div>
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Package Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        style={styles.input}
                        placeholder="e.g., Kedarnath Yatra"
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Duration *</label>
                      <input
                        type="text"
                        required
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({ ...formData, duration: e.target.value })
                        }
                        style={styles.input}
                        placeholder="e.g., 03 Nights / 04 Days"
                      />
                    </div>
                  </div>

                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Starting Point *</label>
                      <input
                        type="text"
                        required
                        value={formData.startingPoint}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startingPoint: e.target.value,
                          })
                        }
                        style={styles.input}
                        placeholder="e.g., Ex-Haridwar/Dehradun"
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <label style={styles.label}>Category *</label>
                        <button
                          type="button"
                          onClick={() => setShowCategoryModal(true)}
                          style={{
                            padding: "0.5rem 1rem",
                            fontSize: "0.85rem",
                            background: "#10b981",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.35rem",
                          }}
                        >
                          <span style={{ fontSize: "1rem" }}>⚙️</span>
                          Manage Categories
                        </button>
                      </div>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        style={styles.select}
                      >
                        <option value="">Select Category</option>
                        {categories
                          .filter((cat) => cat.active)
                          .map((cat) => (
                            <option key={cat._id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Location Tag (Badge)</label>
                      <input
                        type="text"
                        value={formData.badge}
                        onChange={(e) =>
                          setFormData({ ...formData, badge: e.target.value })
                        }
                        style={styles.input}
                        placeholder="e.g., Kedarnath Dham"
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        Price (Leave empty for &quot;Enquire&quot;)
                      </label>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <select
                          value={formData.currency}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              currency: e.target.value,
                            })
                          }
                          style={{ ...styles.select, width: "100px" }}
                        >
                          <option value="INR">₹ INR</option>
                          <option value="USD">$ USD</option>
                        </select>
                        <input
                          type="number"
                          value={formData.price || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              price: e.target.value
                                ? parseFloat(e.target.value)
                                : null,
                            })
                          }
                          style={{ ...styles.input, flex: 1 }}
                          placeholder="Enter price or leave empty"
                        />
                      </div>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Short Description *</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      style={styles.textarea}
                      placeholder="Brief description for package cards"
                      rows={3}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Main Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "image")}
                      disabled={uploadingImage}
                      style={styles.input}
                    />
                    {formData.image && (
                      <img
                        src={formData.image}
                        alt="Preview"
                        style={styles.imagePreview}
                      />
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "1.5rem",
                      marginTop: "1rem",
                    }}
                  >
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            featured: e.target.checked,
                          })
                        }
                        style={styles.checkbox}
                      />
                      ⭐ Featured Package
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) =>
                          setFormData({ ...formData, active: e.target.checked })
                        }
                        style={styles.checkbox}
                      />
                      ✓ Active
                    </label>
                  </div>

                  {/* Custom Fields for Basic Info */}
                  {renderCustomFieldsSection("overview")}

                  {/* Global Form Fields */}
                  {renderGlobalFormFields("overview")}
                </div>
              )}

              {/* Description & Gallery Tab */}
              {activeTab === "details" && (
                <div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Full Description</label>
                    <textarea
                      value={formData.fullDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fullDescription: e.target.value,
                        })
                      }
                      style={{ ...styles.textarea, minHeight: "200px" }}
                      placeholder="Detailed description of the package..."
                      rows={8}
                    />
                  </div>

                  <div style={{ marginTop: "1.5rem" }}>
                    <h3 style={styles.sectionTitle}>🖼️ Gallery Images</h3>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e, "gallery")}
                      disabled={uploadingImage}
                      style={styles.input}
                    />
                    {uploadingImage && (
                      <p
                        style={{
                          color: "#0066cc",
                          fontSize: "0.9rem",
                          marginTop: "0.5rem",
                        }}
                      >
                        Uploading images...
                      </p>
                    )}
                    {formData.gallery.length > 0 && (
                      <div style={styles.galleryGrid}>
                        {formData.gallery.map((img, index) => (
                          <div key={index} style={styles.galleryItem}>
                            <img
                              src={img}
                              alt={`Gallery ${index + 1}`}
                              style={styles.galleryImage}
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index)}
                              style={styles.galleryRemove}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Custom Fields for Overview Section */}
                  {renderCustomFieldsSection("overview")}

                  {/* Global Form Fields */}
                  {renderGlobalFormFields("overview")}
                </div>
              )}

              {/* Itinerary Tab */}
              {activeTab === "itinerary" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <h3
                      style={{
                        ...styles.sectionTitle,
                        marginBottom: 0,
                        border: "none",
                        paddingBottom: 0,
                      }}
                    >
                      🗓️ Day-by-Day Itinerary
                    </h3>
                    <button
                      type="button"
                      onClick={addItineraryDay}
                      style={styles.addButton}
                    >
                      + Add Day
                    </button>
                  </div>

                  {formData.itinerary.length === 0 ? (
                    <div style={{ ...styles.emptyState, padding: "3rem 2rem" }}>
                      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                        🗓️
                      </div>
                      <p style={{ color: "#64748b" }}>
                        No itinerary days added yet
                      </p>
                      <button
                        type="button"
                        onClick={addItineraryDay}
                        style={styles.addButton}
                      >
                        + Add First Day
                      </button>
                    </div>
                  ) : (
                    formData.itinerary.map((day, index) => (
                      <div key={index} style={styles.itineraryCard}>
                        <div style={styles.itineraryHeader}>
                          <span style={styles.itineraryDayBadge}>
                            Day {day.day}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItineraryDay(index)}
                            style={styles.removeButton}
                          >
                            🗑️ Remove
                          </button>
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Day Title</label>
                          <input
                            type="text"
                            value={day.title}
                            onChange={(e) =>
                              updateItineraryDay(index, "title", e.target.value)
                            }
                            style={styles.input}
                            placeholder="e.g., Haridwar to Guptkashi"
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Description</label>
                          <textarea
                            value={day.description}
                            onChange={(e) =>
                              updateItineraryDay(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            style={styles.textarea}
                            rows={3}
                            placeholder="Describe the day's activities..."
                          />
                        </div>
                      </div>
                    ))
                  )}

                  {/* Custom Fields for Itinerary */}
                  {renderCustomFieldsSection("itinerary")}

                  {/* Global Form Fields */}
                  {renderGlobalFormFields("itinerary")}
                </div>
              )}

              {/* Inclusions/Exclusions Tab */}
              {activeTab === "lists" && (
                <div>
                  {/* Inclusions */}
                  <div style={{ marginBottom: "2rem" }}>
                    <h3 style={styles.sectionTitle}>✅ Inclusions</h3>
                    {formData.inclusions.map((item, index) => (
                      <div key={index} style={styles.arrayItemRow}>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) =>
                            updateArrayItem("inclusions", index, e.target.value)
                          }
                          style={{ ...styles.input, flex: 1 }}
                          placeholder="What's included"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem("inclusions", index)}
                          style={styles.removeButton}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem("inclusions")}
                      style={styles.addItemButton}
                    >
                      + Add Inclusion
                    </button>
                  </div>

                  {/* Exclusions */}
                  <div style={{ marginBottom: "2rem" }}>
                    <h3 style={styles.sectionTitle}>❌ Exclusions</h3>
                    {formData.exclusions.map((item, index) => (
                      <div key={index} style={styles.arrayItemRow}>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) =>
                            updateArrayItem("exclusions", index, e.target.value)
                          }
                          style={{ ...styles.input, flex: 1 }}
                          placeholder="What's not included"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem("exclusions", index)}
                          style={styles.removeButton}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem("exclusions")}
                      style={styles.addItemButton}
                    >
                      + Add Exclusion
                    </button>
                  </div>

                  {/* Things to Carry */}
                  <div>
                    <h3 style={styles.sectionTitle}>🎒 Things to Carry</h3>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "#64748b",
                        marginBottom: "1rem",
                      }}
                    >
                      Organize items by category (e.g., &quot;Clothing &
                      Footwear&quot;, &quot;Personal Care & Health&quot;)
                    </p>
                    {(formData.thingsToCarry || []).map(
                      (carryCategory, categoryIndex) => (
                        <div
                          key={categoryIndex}
                          style={{
                            marginBottom: "1.5rem",
                            padding: "1.25rem",
                            backgroundColor: "#f8fafc",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          {/* Category Name */}
                          <div style={{ marginBottom: "1rem" }}>
                            <input
                              type="text"
                              value={carryCategory.category || ""}
                              onChange={(e) => {
                                const updated = [...formData.thingsToCarry];
                                updated[categoryIndex] = {
                                  ...updated[categoryIndex],
                                  category: e.target.value,
                                  items: updated[categoryIndex]?.items || [],
                                };
                                setFormData({
                                  ...formData,
                                  thingsToCarry: updated,
                                });
                              }}
                              style={{
                                ...styles.input,
                                fontWeight: "600",
                                fontSize: "0.95rem",
                                backgroundColor: "white",
                              }}
                              placeholder="Category name (e.g., Clothing & Footwear)"
                            />
                          </div>

                          {/* Items in this category */}
                          {(carryCategory.items || []).map(
                            (item, itemIndex) => (
                              <div key={itemIndex} style={styles.arrayItemRow}>
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => {
                                    const updated = [...formData.thingsToCarry];
                                    if (!updated[categoryIndex].items) {
                                      updated[categoryIndex].items = [];
                                    }
                                    updated[categoryIndex].items[itemIndex] =
                                      e.target.value;
                                    setFormData({
                                      ...formData,
                                      thingsToCarry: updated,
                                    });
                                  }}
                                  style={{
                                    ...styles.input,
                                    flex: 1,
                                    backgroundColor: "white",
                                  }}
                                  placeholder="Item (e.g., Trekking shoes with good grip)"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...formData.thingsToCarry];
                                    if (updated[categoryIndex].items) {
                                      updated[categoryIndex].items.splice(
                                        itemIndex,
                                        1,
                                      );
                                    }
                                    setFormData({
                                      ...formData,
                                      thingsToCarry: updated,
                                    });
                                  }}
                                  style={styles.removeButton}
                                >
                                  ✕
                                </button>
                              </div>
                            ),
                          )}

                          {/* Add Item button */}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...formData.thingsToCarry];
                              if (!updated[categoryIndex].items) {
                                updated[categoryIndex].items = [];
                              }
                              updated[categoryIndex].items.push("");
                              setFormData({
                                ...formData,
                                thingsToCarry: updated,
                              });
                            }}
                            style={{
                              ...styles.addItemButton,
                              fontSize: "0.85rem",
                              padding: "0.6rem 1rem",
                            }}
                          >
                            + Add Item
                          </button>

                          {/* Remove Category button */}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.thingsToCarry.filter(
                                (_, i) => i !== categoryIndex,
                              );
                              setFormData({
                                ...formData,
                                thingsToCarry: updated,
                              });
                            }}
                            style={{
                              ...styles.removeButton,
                              marginLeft: "0.5rem",
                              fontSize: "0.85rem",
                              padding: "0.6rem 1rem",
                            }}
                          >
                            Remove Category
                          </button>
                        </div>
                      ),
                    )}

                    {/* Add Category button */}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          thingsToCarry: [
                            ...formData.thingsToCarry,
                            { category: "", items: [""] },
                          ],
                        });
                      }}
                      style={styles.addItemButton}
                    >
                      + Add Category
                    </button>
                  </div>

                  {/* Custom Fields for Inclusions/Exclusions */}
                  {renderCustomFieldsSection("inclusions")}

                  {/* Global Form Fields */}
                  {renderGlobalFormFields("inclusions")}
                </div>
              )}

              {/* Policy & Notes Tab */}
              {activeTab === "policy" && (
                <div>
                  {/* Important Notes */}
                  <div style={{ marginBottom: "2rem" }}>
                    <h3 style={styles.sectionTitle}>📝 Important Notes</h3>
                    {formData.importantNotes.map((note, index) => (
                      <div key={index} style={styles.arrayItemRow}>
                        <input
                          type="text"
                          value={note}
                          onChange={(e) =>
                            updateArrayItem(
                              "importantNotes",
                              index,
                              e.target.value,
                            )
                          }
                          style={{ ...styles.input, flex: 1 }}
                          placeholder="Important note"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayItem("importantNotes", index)
                          }
                          style={styles.removeButton}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem("importantNotes")}
                      style={styles.addItemButton}
                    >
                      + Add Note
                    </button>
                  </div>

                  {/* Refund Policy */}
                  <div>
                    <h3 style={styles.sectionTitle}>
                      💳 Refund & Cancellation Policy
                    </h3>

                    {/* Refund Tiers */}
                    <div style={{ marginBottom: "1.5rem" }}>
                      <label style={styles.label}>Refund Tiers</label>
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "#64748b",
                          marginBottom: "1rem",
                        }}
                      >
                        Add refund tiers (e.g., &quot;Before 45 Days&quot; →
                        &quot;50% Refund on Registration amount&quot;)
                      </p>
                      {(formData.refundTiers || []).map((tier, index) => (
                        <div
                          key={index}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr auto",
                            gap: "0.75rem",
                            marginBottom: "0.75rem",
                            padding: "1rem",
                            backgroundColor: "#f8fafc",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <input
                            type="text"
                            value={tier.timeframe}
                            onChange={(e) => {
                              const updated = [...formData.refundTiers];
                              updated[index].timeframe = e.target.value;
                              setFormData({
                                ...formData,
                                refundTiers: updated,
                              });
                            }}
                            style={styles.input}
                            placeholder="e.g., Before 45 Days, 45-30 Days, After 10 Days"
                          />
                          <input
                            type="text"
                            value={tier.refundInfo}
                            onChange={(e) => {
                              const updated = [...formData.refundTiers];
                              updated[index].refundInfo = e.target.value;
                              setFormData({
                                ...formData,
                                refundTiers: updated,
                              });
                            }}
                            style={styles.input}
                            placeholder="e.g., 50% Refund on Registration amount"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.refundTiers.filter(
                                (_, i) => i !== index,
                              );
                              setFormData({
                                ...formData,
                                refundTiers: updated,
                              });
                            }}
                            style={styles.removeButton}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            refundTiers: [
                              ...formData.refundTiers,
                              { timeframe: "", refundInfo: "" },
                            ],
                          });
                        }}
                        style={styles.addItemButton}
                      >
                        + Add Refund Tier
                      </button>
                    </div>

                    {/* Policy Notes/Description */}
                    <div>
                      <label style={styles.label}>
                        Policy Terms & Conditions
                      </label>
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "#64748b",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Enter additional policy terms (numbered points will be
                        auto-formatted)
                      </p>
                      <textarea
                        value={formData.refundPolicyNotes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            refundPolicyNotes: e.target.value,
                          })
                        }
                        style={{ ...styles.textarea, minHeight: "300px" }}
                        placeholder="1. Cancellation charges will be calculated on the total trip cost, not on the advance or token amount paid.
2. The full trip amount must be cleared at least 15 days before departure.
3. Failure to complete payment may lead to automatic cancellation without refund.
..."
                        rows={12}
                      />
                    </div>
                  </div>

                  {/* Custom Fields for Policy & Notes */}
                  {renderCustomFieldsSection("policies")}

                  {/* Global Form Fields */}
                  {renderGlobalFormFields("policies")}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div style={styles.formActions}>
              <button
                type="button"
                onClick={handleCancel}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadingImage}
                style={{
                  ...styles.submitButton,
                  ...(uploadingImage ? { opacity: 0.6 } : {}),
                }}
              >
                {uploadingImage
                  ? "⏳ Uploading..."
                  : editingId
                    ? "💾 Update Package"
                    : "➕ Add Package"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={() => {
            setShowCategoryModal(false);
            cancelEditCategory();
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "2rem",
              maxWidth: "700px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
                paddingBottom: "1rem",
                borderBottom: "2px solid #e5e7eb",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#1e293b",
                }}
              >
                ⚙️ Manage Categories
              </h2>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  cancelEditCategory();
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: "0.25rem",
                }}
              >
                ✕
              </button>
            </div>

            {/* Add/Edit Category Form */}
            <div
              style={{
                padding: "1.25rem",
                backgroundColor: "#f8fafc",
                borderRadius: "12px",
                marginBottom: "1.5rem",
                border: "2px solid #e2e8f0",
              }}
            >
              <h3
                style={{
                  margin: "0 0 1rem 0",
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#475569",
                }}
              >
                {editingCategoryId ? "✏️ Edit Category" : "➕ Add New Category"}
              </h3>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                    color: "#374151",
                    fontSize: "0.9rem",
                  }}
                >
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      name: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  placeholder="e.g., Trek, Spiritual Journey"
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                    color: "#374151",
                    fontSize: "0.9rem",
                  }}
                >
                  Display Order
                </label>
                <input
                  type="number"
                  value={categoryFormData.order}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  placeholder="0"
                />
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                {editingCategoryId ? (
                  <>
                    <button
                      onClick={handleUpdateCategory}
                      style={{
                        flex: 1,
                        padding: "0.75rem 1.5rem",
                        background: "#0066cc",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      💾 Update
                    </button>
                    <button
                      onClick={cancelEditCategory}
                      style={{
                        flex: 1,
                        padding: "0.75rem 1.5rem",
                        background: "#e5e7eb",
                        color: "#374151",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAddCategory}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1.5rem",
                      background: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    ➕ Add Category
                  </button>
                )}
              </div>
            </div>

            {/* Categories List */}
            <div>
              <h3
                style={{
                  margin: "0 0 1rem 0",
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#475569",
                }}
              >
                📋 Existing Categories ({categories.length})
              </h3>
              {categories.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#94a3b8",
                  }}
                >
                  No categories yet. Add your first category above.
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      style={{
                        padding: "1rem",
                        backgroundColor: category.active ? "white" : "#f1f5f9",
                        border: "2px solid #e5e7eb",
                        borderRadius: "10px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: "600",
                            color: category.active ? "#1e293b" : "#94a3b8",
                            fontSize: "1rem",
                            marginBottom: "0.25rem",
                          }}
                        >
                          {category.name}
                          {!category.active && (
                            <span
                              style={{
                                marginLeft: "0.5rem",
                                fontSize: "0.75rem",
                                color: "#ef4444",
                                fontWeight: "500",
                              }}
                            >
                              (Inactive)
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#94a3b8",
                            marginTop: "0.25rem",
                          }}
                        >
                          Order: {category.order}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => startEditCategory(category)}
                          style={{
                            padding: "0.5rem 1rem",
                            background: "#0066cc",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            fontWeight: "500",
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
                          style={{
                            padding: "0.5rem 1rem",
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            fontWeight: "500",
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
