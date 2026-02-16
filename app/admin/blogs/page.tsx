"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Blog {
  _id: string;
  title: string;
  description: string;
  categories: string[];
  image: string;
  date: string;
  createdAt: string;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/admin/blogs", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setBlogs(data.blogs || []);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setBlogs(blogs.filter((b) => b._id !== id));
        alert("Blog deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("Failed to delete blog");
    }
  };

  const truncateText = (text: string, length: number) => {
    if (text.length > length) {
      return text.substring(0, length) + "...";
    }
    return text;
  };

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
        <div>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 700 }}>
            📝 Manage Blogs
          </h1>
          <p style={{ margin: "0.5rem 0 0", color: "#6b7280" }}>
            {blogs.length} blog posts available
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "0.75rem 1.5rem",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.95rem",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(102, 126, 234, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          ➕ {showForm ? "Cancel" : "Add New Blog"}
        </button>
      </div>

      {showForm && (
        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "12px",
            marginBottom: "2rem",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <AddBlogForm
            onSuccess={() => {
              setShowForm(false);
              fetchBlogs();
            }}
          />
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
          Loading blogs...
        </div>
      ) : blogs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            background: "#f9fafb",
            borderRadius: "12px",
            color: "#6b7280",
          }}
        >
          <p style={{ fontSize: "1.1rem" }}>
            No blogs found. Create your first blog!
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {blogs.map((blog) => (
            <div
              key={blog._id}
              style={{
                background: "white",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.15)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 1px 3px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {blog.image && (
                <img
                  src={blog.image}
                  alt={blog.title}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                  }}
                />
              )}
              <div style={{ padding: "1rem" }}>
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
                  {blog.title}
                </h3>
                <p
                  style={{
                    margin: "0.5rem 0",
                    color: "#6b7280",
                    fontSize: "0.875rem",
                  }}
                >
                  {truncateText(blog.description, 100)}
                </p>
                {blog.categories && blog.categories.length > 0 && (
                  <div
                    style={{
                      margin: "0.75rem 0",
                      display: "flex",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {blog.categories.slice(0, 3).map((cat) => (
                      <span
                        key={cat}
                        style={{
                          display: "inline-block",
                          padding: "0.25rem 0.5rem",
                          background: "#e0e7ff",
                          color: "#4f46e5",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
                <p
                  style={{
                    margin: "0.5rem 0 0",
                    color: "#9ca3af",
                    fontSize: "0.75rem",
                  }}
                >
                  {new Date(blog.date || blog.createdAt).toLocaleDateString()}
                </p>
                <div
                  style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}
                >
                  <button
                    onClick={() => router.push(`/admin/blogs/${blog._id}`)}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      background: "#2563eb",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteBlog(blog._id)}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddBlogForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categories: [] as string[],
    image: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (res.ok) {
        alert("Blog created successfully!");
        onSuccess();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create blog");
      }
    } catch (error) {
      console.error("Error creating blog:", error);
      alert("Failed to create blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ marginTop: 0, fontSize: "1.5rem", marginBottom: "1.5rem" }}>
        Add New Blog
      </h2>

      {/* Featured Image */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label
          style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}
        >
          Featured Image
        </label>
        <div
          style={{
            border: "2px dashed #d1d5db",
            borderRadius: "8px",
            padding: "2rem",
            textAlign: "center",
            background: formData.image ? "transparent" : "#f9fafb",
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
            <div>
              <p style={{ color: "#9ca3af", margin: 0 }}>
                📷 Upload Image (Max 5MB, JPG/PNG recommended)
              </p>
            </div>
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
          style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}
        >
          Title <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          type="text"
          placeholder="Enter blog title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
          style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}
        >
          Date
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
          style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}
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
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
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
        <p
          style={{
            margin: "0.5rem 0 0",
            color: "#6b7280",
            fontSize: "0.85rem",
          }}
        >
          Select one or more categories for this blog post
        </p>
      </div>

      {/* Description */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label
          style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}
        >
          Description <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <textarea
          placeholder="Enter blog description"
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
        disabled={loading}
        style={{
          padding: "0.75rem 2rem",
          background: loading
            ? "#9ca3af"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 600,
          fontSize: "0.95rem",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(102, 126, 234, 0.3)";
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
      >
        {loading ? "Creating..." : "📝 Create Blog"}
      </button>
    </form>
  );
}
