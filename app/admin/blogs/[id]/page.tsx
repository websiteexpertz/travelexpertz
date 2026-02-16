"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Blog {
  _id: string;
  title: string;
  description: string;
  categories: string[];
  image: string;
  date: string;
}

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categories: [] as string[],
    image: "",
    date: "",
  });

  const blogCategories = [
    "Adventure",
    "Culture",
    "Food",
    "Tips",
    "Spiritual",
    "Travel",
    "Monument",
    "Budget Travel",
    "Festival",
    "Kashmir",
    "Himanchal Pradesh",
    "Odisha",
    "Delhi",
    "Uttarakhand",
    "Ladakh",
    "Lakshadweep",
    "Informative",
    "Kerala",
    "Gujarat",
    "Maharashtra",
    "Puducherry",
  ];

  useEffect(() => {
    if (blogId) {
      fetchBlog();
    }
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      const res = await fetch(`/api/admin/blogs`, {
        credentials: "include",
      });
      const data = await res.json();
      const foundBlog = data.blogs.find((b: Blog) => b._id === blogId);

      if (foundBlog) {
        setBlog(foundBlog);
        setFormData({
          title: foundBlog.title,
          description: foundBlog.description,
          categories: foundBlog.categories || [],
          image: foundBlog.image || "",
          date: foundBlog.date
            ? new Date(foundBlog.date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        });
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          image: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/blogs/${blogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (res.ok) {
        alert("Blog updated successfully!");
        router.push("/admin/blogs");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update blog");
      }
    } catch (error) {
      console.error("Error updating blog:", error);
      alert("Failed to update blog");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
        Loading blog...
      </div>
    );
  }

  if (!blog) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#ef4444" }}>
        Blog not found
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 700 }}>
          ✏️ Edit Blog
        </h1>
        <button
          onClick={() => router.push("/admin/blogs")}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#f3f4f6",
            color: "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ← Back to Blogs
        </button>
      </div>

      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* Featured Image */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Featured Image
            </label>
            <div
              style={{
                border: "2px dashed #d1d5db",
                borderRadius: "8px",
                padding: "2rem",
                textAlign: "center",
                marginBottom: "1rem",
              }}
            >
              {formData.image ? (
                <img
                  src={formData.image}
                  alt="Featured"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "250px",
                    borderRadius: "6px",
                  }}
                />
              ) : (
                <p style={{ color: "#9ca3af", margin: 0 }}>
                  📷 No image selected
                </p>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                width: "100%",
              }}
            />
          </div>

          {/* Title */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Title <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.95rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Date */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.95rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Categories */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Categories
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: "0.75rem",
                marginBottom: "0.5rem",
              }}
            >
              {blogCategories.map((cat) => (
                <label
                  key={cat}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(cat)}
                    onChange={() => handleCategoryChange(cat)}
                    style={{ cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "0.9rem" }}>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Description <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.95rem",
                minHeight: "300px",
                fontFamily: "inherit",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "0.75rem 2rem",
              background: saving
                ? "#9ca3af"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: saving ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          >
            {saving ? "Saving..." : "💾 Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
