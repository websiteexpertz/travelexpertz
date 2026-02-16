"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Header from "../components/Header";

interface Blog {
  _id: string;
  title: string;
  description: string;
  categories: string[];
  image: string;
  date: string;
  createdAt: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState("newest");
  const [searchInput, setSearchInput] = useState("");
  const [animateCards, setAnimateCards] = useState(false);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setAnimateCards(false);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedCategory) params.set("category", selectedCategory);
      params.set("page", String(page));
      params.set("limit", "12");
      params.set("sort", sort);

      const res = await fetch(`/api/blogs?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setBlogs(data.blogs || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
        if (data.categories) setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setAnimateCards(true), 50);
    }
  }, [search, selectedCategory, page, sort]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const stripHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "");
  };

  const truncate = (text: string, len: number) => {
    const clean = stripHtml(text);
    return clean.length > len ? clean.slice(0, len) + "..." : clean;
  };

  return (
    <>
      <Header />
      <main style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
        {/* Hero Banner */}
        <section
          style={{
            position: "relative",
            background:
              "linear-gradient(135deg, #0a66c2 0%, #004c99 50%, #003366 100%)",
            padding: "5rem 1.5rem 4rem",
            overflow: "hidden",
          }}
        >
          {/* Animated background elements */}
          <div
            style={{
              position: "absolute",
              top: "-60px",
              right: "-60px",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
              animation: "heroBlob1 8s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-80px",
              left: "-40px",
              width: "250px",
              height: "250px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              animation: "heroBlob2 10s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "20%",
              left: "50%",
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              background: "rgba(0,212,255,0.08)",
              animation: "heroBlob1 12s ease-in-out infinite reverse",
            }}
          />
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              textAlign: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(255,255,255,0.12)",
                borderRadius: "999px",
                padding: "0.5rem 1.25rem",
                marginBottom: "1.25rem",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#00d4ff", fontSize: "18px" }}
              >
                auto_stories
              </span>
              <span
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                Travel Stories & Guides
              </span>
            </div>
            <h1
              style={{
                color: "white",
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: "1rem",
                letterSpacing: "-0.02em",
              }}
            >
              Explore Our{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #00d4ff 0%, #90e0ef 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Travel Blog
              </span>
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: "clamp(1rem, 2vw, 1.2rem)",
                maxWidth: "600px",
                margin: "0 auto 2rem",
                lineHeight: 1.7,
              }}
            >
              Discover hidden gems, travel tips, cultural insights, and
              inspiring stories from across incredible India.
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              style={{
                maxWidth: "640px",
                margin: "0 auto",
                display: "flex",
                gap: "0",
                background: "white",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              }}
            >
              <div style={{ position: "relative", flex: 1 }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: "absolute",
                    left: "1.25rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--gray-400)",
                    fontSize: "22px",
                  }}
                >
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search blogs by title or keyword..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "1.1rem 1rem 1.1rem 3.25rem",
                    border: "none",
                    outline: "none",
                    fontSize: "1rem",
                    color: "var(--gray-800)",
                    background: "transparent",
                    fontFamily: "inherit",
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: "0 2rem",
                  background:
                    "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
                  color: "white",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "20px" }}
                >
                  search
                </span>
                Search
              </button>
            </form>
          </div>
        </section>

        {/* Filters & Content */}
        <section
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "2.5rem 1.5rem 4rem",
          }}
        >
          {/* Filter Bar */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "2rem",
              padding: "1.25rem 1.5rem",
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              border: "1px solid var(--gray-200)",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "var(--primary)", fontSize: "20px" }}
              >
                filter_list
              </span>
              <span
                style={{
                  fontWeight: 600,
                  color: "var(--gray-700)",
                  fontSize: "0.9rem",
                }}
              >
                Filters:
              </span>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              style={{
                padding: "0.55rem 1rem",
                borderRadius: "10px",
                border: "1.5px solid var(--gray-200)",
                fontSize: "0.875rem",
                color: "var(--gray-700)",
                background: "var(--gray-50)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 500,
                outline: "none",
                transition: "all 0.2s ease",
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">A → Z</option>
            </select>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              style={{
                padding: "0.55rem 1rem",
                borderRadius: "10px",
                border: selectedCategory
                  ? "1.5px solid var(--primary)"
                  : "1.5px solid var(--gray-200)",
                fontSize: "0.875rem",
                color: selectedCategory ? "var(--primary)" : "var(--gray-700)",
                background: selectedCategory ? "#f0f7ff" : "var(--gray-50)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 500,
                outline: "none",
                transition: "all 0.2s ease",
                minWidth: "180px",
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Active filter & count */}
            <div
              style={{
                marginLeft: "auto",
                fontSize: "0.85rem",
                color: "var(--gray-500)",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {total} blog{total !== 1 ? "s" : ""} found
            </div>
          </div>

          {/* Active Search / Category indicator */}
          {(search || selectedCategory) && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              {search && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.35rem 0.85rem",
                    background: "#e0f2fe",
                    color: "var(--primary-dark)",
                    borderRadius: "999px",
                    fontSize: "0.825rem",
                    fontWeight: 500,
                  }}
                >
                  Search: &quot;{search}&quot;
                  <button
                    onClick={() => {
                      setSearch("");
                      setSearchInput("");
                      setPage(1);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--primary)",
                      padding: 0,
                      display: "flex",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "16px" }}
                    >
                      close
                    </span>
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.35rem 0.85rem",
                    background: "#e0f2fe",
                    color: "var(--primary-dark)",
                    borderRadius: "999px",
                    fontSize: "0.825rem",
                    fontWeight: 500,
                  }}
                >
                  Category: {selectedCategory}
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setPage(1);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--primary)",
                      padding: 0,
                      display: "flex",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "16px" }}
                    >
                      close
                    </span>
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  setSelectedCategory("");
                  setSort("newest");
                  setPage(1);
                }}
                style={{
                  fontSize: "0.8rem",
                  color: "var(--error)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 500,
                  fontFamily: "inherit",
                }}
              >
                Clear All
              </button>
            </div>
          )}

          {/* Blog List */}
          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    background: "white",
                    borderRadius: "16px",
                    overflow: "hidden",
                    height: "220px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      width: "320px",
                      minWidth: "320px",
                      background:
                        "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s infinite",
                    }}
                  />
                  <div style={{ flex: 1, padding: "1.5rem" }}>
                    <div
                      style={{
                        height: "16px",
                        width: "40%",
                        background: "#eee",
                        borderRadius: "8px",
                        marginBottom: "1rem",
                      }}
                    />
                    <div
                      style={{
                        height: "24px",
                        width: "80%",
                        background: "#eee",
                        borderRadius: "8px",
                        marginBottom: "0.75rem",
                      }}
                    />
                    <div
                      style={{
                        height: "14px",
                        width: "100%",
                        background: "#eee",
                        borderRadius: "8px",
                        marginBottom: "0.5rem",
                      }}
                    />
                    <div
                      style={{
                        height: "14px",
                        width: "60%",
                        background: "#eee",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "5rem 2rem",
                background: "white",
                borderRadius: "20px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "64px",
                  color: "var(--gray-300)",
                  marginBottom: "1rem",
                }}
              >
                article
              </span>
              <h3 style={{ color: "var(--gray-600)", marginBottom: "0.5rem" }}>
                No blogs found
              </h3>
              <p style={{ color: "var(--gray-400)" }}>
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {blogs.map((blog, index) => (
                <Link
                  href={`/blogs/${blog._id}`}
                  key={blog._id}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <article
                    style={{
                      display: "flex",
                      background: "white",
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      border: "1px solid var(--gray-100)",
                      transition:
                        "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      cursor: "pointer",
                      opacity: animateCards ? 1 : 0,
                      transform: animateCards
                        ? "translateY(0)"
                        : "translateY(20px)",
                      transitionDelay: `${index * 60}ms`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 12px 40px rgba(10,102,194,0.12)";
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.borderColor =
                        "rgba(10,102,194,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 1px 4px rgba(0,0,0,0.06)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "var(--gray-100)";
                    }}
                  >
                    {/* Blog Image */}
                    <div
                      style={{
                        width: "320px",
                        minWidth: "280px",
                        maxWidth: "320px",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {blog.image ? (
                        <img
                          src={blog.image}
                          alt={blog.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.6s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.08)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            minHeight: "200px",
                            background:
                              "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{
                              fontSize: "48px",
                              color: "var(--primary)",
                              opacity: 0.4,
                            }}
                          >
                            image
                          </span>
                        </div>
                      )}
                      {/* Date overlay */}
                      <div
                        style={{
                          position: "absolute",
                          top: "12px",
                          left: "12px",
                          background: "rgba(0,0,0,0.6)",
                          backdropFilter: "blur(8px)",
                          color: "white",
                          padding: "0.3rem 0.75rem",
                          borderRadius: "8px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {formatDate(blog.date || blog.createdAt)}
                      </div>
                    </div>

                    {/* Blog Content */}
                    <div
                      style={{
                        flex: 1,
                        padding: "1.5rem 1.75rem",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: "0.65rem",
                        minWidth: 0,
                      }}
                    >
                      {/* Categories */}
                      {blog.categories && blog.categories.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.4rem",
                          }}
                        >
                          {blog.categories.slice(0, 3).map((cat) => (
                            <span
                              key={cat}
                              style={{
                                padding: "0.2rem 0.65rem",
                                borderRadius: "999px",
                                background:
                                  "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)",
                                color: "var(--primary)",
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                letterSpacing: "0.02em",
                                textTransform: "uppercase",
                              }}
                            >
                              {cat}
                            </span>
                          ))}
                          {blog.categories.length > 3 && (
                            <span
                              style={{
                                padding: "0.2rem 0.5rem",
                                borderRadius: "999px",
                                background: "var(--gray-100)",
                                color: "var(--gray-500)",
                                fontSize: "0.7rem",
                                fontWeight: 500,
                              }}
                            >
                              +{blog.categories.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Title */}
                      <h3
                        style={{
                          fontSize: "clamp(1.05rem, 2vw, 1.3rem)",
                          fontWeight: 700,
                          color: "var(--gray-800)",
                          lineHeight: 1.35,
                          margin: 0,
                          transition: "color 0.2s ease",
                        }}
                      >
                        {blog.title}
                      </h3>

                      {/* Description */}
                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: "var(--gray-500)",
                          lineHeight: 1.65,
                          margin: 0,
                        }}
                      >
                        {truncate(blog.description, 180)}
                      </p>

                      {/* Read More */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          color: "var(--primary)",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        Read Article
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: "18px",
                            transition: "transform 0.2s ease",
                          }}
                        >
                          arrow_forward
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.5rem",
                marginTop: "3rem",
              }}
            >
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "10px",
                  border: "1.5px solid var(--gray-200)",
                  background: page <= 1 ? "var(--gray-100)" : "white",
                  color: page <= 1 ? "var(--gray-400)" : "var(--gray-700)",
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  fontFamily: "inherit",
                  transition: "all 0.2s ease",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px" }}
                >
                  chevron_left
                </span>
                Previous
              </button>

              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      border:
                        page === pageNum
                          ? "1.5px solid var(--primary)"
                          : "1.5px solid var(--gray-200)",
                      background:
                        page === pageNum
                          ? "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)"
                          : "white",
                      color: page === pageNum ? "white" : "var(--gray-600)",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      fontFamily: "inherit",
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "10px",
                  border: "1.5px solid var(--gray-200)",
                  background: page >= totalPages ? "var(--gray-100)" : "white",
                  color:
                    page >= totalPages ? "var(--gray-400)" : "var(--gray-700)",
                  cursor: page >= totalPages ? "not-allowed" : "pointer",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  fontFamily: "inherit",
                  transition: "all 0.2s ease",
                }}
              >
                Next
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px" }}
                >
                  chevron_right
                </span>
              </button>
            </div>
          )}
        </section>

        {/* Shimmer animation keyframes */}
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          @media (max-width: 768px) {
            article[style] {
              flex-direction: column !important;
            }
            article[style] > div:first-child {
              width: 100% !important;
              min-width: 100% !important;
              max-width: 100% !important;
              height: 200px !important;
            }
          }
        `}</style>
      </main>
    </>
  );
}
