"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";

interface Blog {
  _id: string;
  title: string;
  description: string;
  categories: string[];
  image: string;
  date: string;
  createdAt: string;
}

interface LatestBlog {
  _id: string;
  title: string;
  image: string;
  date: string;
  categories: string[];
  createdAt: string;
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";
  const [blog, setBlog] = useState<Blog | null>(null);
  const [latestBlogs, setLatestBlogs] = useState<LatestBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchBlog = async () => {
      setLoading(true);
      setContentVisible(false);
      setImageLoaded(false);
      try {
        const res = await fetch(`/api/blogs/${id}`);
        const data = await res.json();
        if (res.ok) {
          setBlog(data.blog);
          setLatestBlogs(data.latestBlogs || []);
        } else {
          setBlog(null);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
        setTimeout(() => setContentVisible(true), 100);
      }
    };
    fetchBlog();
    // Scroll to top on blog change
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
          {/* Skeleton Header */}
          <div
            style={{
              background:
                "linear-gradient(135deg, #0a66c2 0%, #004c99 50%, #003366 100%)",
              padding: "3rem 1.5rem",
            }}
          >
            <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
              <div
                style={{
                  height: "14px",
                  width: "120px",
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                }}
              />
              <div
                style={{
                  height: "32px",
                  width: "60%",
                  background: "rgba(255,255,255,0.12)",
                  borderRadius: "10px",
                  marginBottom: "0.75rem",
                }}
              />
              <div
                style={{
                  height: "16px",
                  width: "200px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
            </div>
          </div>
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "2.5rem 1.5rem",
              display: "flex",
              gap: "2.5rem",
            }}
          >
            <div style={{ flex: 1 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  style={{
                    height: "16px",
                    width: `${100 - i * 10}%`,
                    background: "#eee",
                    borderRadius: "6px",
                    marginBottom: "1rem",
                  }}
                />
              ))}
            </div>
            <div style={{ width: "380px" }}>
              <div
                style={{
                  height: "280px",
                  background: "#eee",
                  borderRadius: "16px",
                }}
              />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <Header />
        <main
          style={{
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--gray-50)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "72px", color: "var(--gray-300)" }}
            >
              article
            </span>
            <h2 style={{ color: "var(--gray-600)", marginBottom: "0.5rem" }}>
              Blog Not Found
            </h2>
            <p style={{ color: "var(--gray-400)", marginBottom: "1.5rem" }}>
              The blog you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Link
              href="/blogs"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.75rem 1.75rem",
                background:
                  "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
                color: "white",
                borderRadius: "12px",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(10,102,194,0.25)",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px" }}
              >
                arrow_back
              </span>
              Back to Blogs
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
        {/* Blog Header Banner */}
        <section
          style={{
            position: "relative",
            background:
              "linear-gradient(135deg, #0a66c2 0%, #004c99 50%, #003366 100%)",
            padding: "3rem 1.5rem 3.5rem",
            overflow: "hidden",
          }}
        >
          {/* Background decoration */}
          <div
            style={{
              position: "absolute",
              top: "-40px",
              right: "-40px",
              width: "250px",
              height: "250px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-60px",
              left: "10%",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: "rgba(0,212,255,0.06)",
            }}
          />

          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              position: "relative",
              zIndex: 1,
              opacity: contentVisible ? 1 : 0,
              transform: contentVisible ? "translateY(0)" : "translateY(15px)",
              transition: "all 0.6s cubic-bezier(0.25,0.46,0.45,0.94)",
            }}
          >
            {/* Breadcrumb */}
            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                marginBottom: "1.25rem",
                fontSize: "0.875rem",
              }}
            >
              <Link
                href="/"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                }}
              >
                Home
              </Link>
              <span style={{ color: "rgba(255,255,255,0.35)" }}>/</span>
              <Link
                href="/blogs"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                }}
              >
                Blogs
              </Link>
              <span style={{ color: "rgba(255,255,255,0.35)" }}>/</span>
              <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
                Article
              </span>
            </nav>

            {/* Categories */}
            {blog.categories && blog.categories.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                {blog.categories.map((cat) => (
                  <span
                    key={cat}
                    style={{
                      padding: "0.3rem 0.85rem",
                      borderRadius: "999px",
                      background: "rgba(0,212,255,0.15)",
                      color: "#90e0ef",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      letterSpacing: "0.03em",
                      textTransform: "uppercase",
                      border: "1px solid rgba(0,212,255,0.2)",
                    }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1
              style={{
                color: "white",
                fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: "1rem",
                maxWidth: "850px",
                letterSpacing: "-0.02em",
              }}
            >
              {blog.title}
            </h1>

            {/* Meta info */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "1.25rem",
                color: "rgba(255,255,255,0.65)",
                fontSize: "0.9rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px" }}
                >
                  calendar_today
                </span>
                {formatDate(blog.date || blog.createdAt)}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px" }}
                >
                  schedule
                </span>
                {Math.max(
                  2,
                  Math.ceil(
                    (blog.description || "").replace(/<[^>]*>/g, "").length /
                      1000,
                  ),
                )}{" "}
                min read
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "2.5rem 1.5rem 4rem",
          }}
        >
          <div
            className="blog-detail-layout"
            style={{
              display: "flex",
              gap: "2.5rem",
              alignItems: "flex-start",
            }}
          >
            {/* LEFT: Blog Content */}
            <article
              style={{
                flex: 1,
                minWidth: 0,
                opacity: contentVisible ? 1 : 0,
                transform: contentVisible
                  ? "translateY(0)"
                  : "translateY(20px)",
                transition: "all 0.6s cubic-bezier(0.25,0.46,0.45,0.94) 0.15s",
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "2.5rem",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  border: "1px solid var(--gray-100)",
                }}
              >
                {/* Blog content */}
                <div
                  className="blog-content"
                  dangerouslySetInnerHTML={{ __html: blog.description }}
                  style={{
                    lineHeight: 1.85,
                    color: "var(--gray-700)",
                    fontSize: "1.05rem",
                    wordBreak: "break-word",
                  }}
                />
              </div>

              {/* Share / Actions */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "1.5rem",
                  padding: "1.25rem 1.75rem",
                  background: "white",
                  borderRadius: "16px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  border: "1px solid var(--gray-100)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "var(--gray-500)",
                    fontSize: "0.9rem",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "20px" }}
                  >
                    share
                  </span>
                  Share this article
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {[
                    { icon: "📘", label: "Facebook", color: "#1877F2" },
                    { icon: "🐦", label: "Twitter", color: "#1DA1F2" },
                    { icon: "💬", label: "WhatsApp", color: "#25D366" },
                  ].map((social) => (
                    <button
                      key={social.label}
                      title={`Share on ${social.label}`}
                      onClick={() => {
                        const url = window.location.href;
                        const text = blog.title;
                        if (social.label === "Facebook")
                          window.open(
                            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                            "_blank",
                          );
                        if (social.label === "Twitter")
                          window.open(
                            `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
                            "_blank",
                          );
                        if (social.label === "WhatsApp")
                          window.open(
                            `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
                            "_blank",
                          );
                      }}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        border: "1.5px solid var(--gray-200)",
                        background: "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.1rem",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = social.color;
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = `0 4px 12px ${social.color}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--gray-200)";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {social.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Back to Blogs */}
              <div style={{ marginTop: "1.5rem" }}>
                <Link
                  href="/blogs"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.75rem 1.5rem",
                    background: "white",
                    border: "1.5px solid var(--gray-200)",
                    borderRadius: "12px",
                    color: "var(--gray-600)",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    transition: "all 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.color = "var(--primary)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(10,102,194,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--gray-200)";
                    e.currentTarget.style.color = "var(--gray-600)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "18px" }}
                  >
                    arrow_back
                  </span>
                  All Blogs
                </Link>
              </div>
            </article>

            {/* RIGHT: Image + Latest Blogs Sidebar */}
            <aside
              className="blog-detail-sidebar"
              style={{
                width: "380px",
                minWidth: "340px",
                position: "sticky",
                top: "5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                opacity: contentVisible ? 1 : 0,
                transform: contentVisible
                  ? "translateX(0)"
                  : "translateX(20px)",
                transition: "all 0.6s cubic-bezier(0.25,0.46,0.45,0.94) 0.3s",
              }}
            >
              {/* Featured Image */}
              {blog.image && (
                <div
                  style={{
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
                    border: "1px solid var(--gray-100)",
                    position: "relative",
                  }}
                >
                  <img
                    src={blog.image}
                    alt={blog.title}
                    onLoad={() => setImageLoaded(true)}
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "340px",
                      objectFit: "cover",
                      display: "block",
                      transition: "all 0.5s ease",
                      opacity: imageLoaded ? 1 : 0,
                    }}
                  />
                  {!imageLoaded && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
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
                          opacity: 0.3,
                          animation: "pulse 2s infinite",
                        }}
                      >
                        image
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Latest Blogs */}
              {latestBlogs.length > 0 && (
                <div
                  style={{
                    background: "white",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    border: "1px solid var(--gray-100)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "1.25rem",
                      paddingBottom: "0.75rem",
                      borderBottom: "2px solid var(--gray-100)",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ color: "var(--primary)", fontSize: "22px" }}
                    >
                      trending_up
                    </span>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        color: "var(--gray-800)",
                      }}
                    >
                      Latest Articles
                    </h3>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                    }}
                  >
                    {latestBlogs.map((lb, index) => (
                      <Link
                        key={lb._id}
                        href={`/blogs/${lb._id}`}
                        style={{
                          display: "flex",
                          gap: "0.85rem",
                          textDecoration: "none",
                          color: "inherit",
                          padding: "0.65rem",
                          borderRadius: "12px",
                          transition: "all 0.25s ease",
                          border: "1px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--gray-50)";
                          e.currentTarget.style.borderColor = "var(--gray-200)";
                          e.currentTarget.style.transform = "translateX(4px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.borderColor = "transparent";
                          e.currentTarget.style.transform = "translateX(0)";
                        }}
                      >
                        {/* Number indicator */}
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background:
                              "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            flexShrink: 0,
                            marginTop: "2px",
                          }}
                        >
                          {index + 1}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4
                            style={{
                              margin: "0 0 0.3rem 0",
                              fontSize: "0.88rem",
                              fontWeight: 600,
                              color: "var(--gray-800)",
                              lineHeight: 1.35,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {lb.title}
                          </h4>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              fontSize: "0.75rem",
                              color: "var(--gray-400)",
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "14px" }}
                            >
                              calendar_today
                            </span>
                            {formatDateShort(lb.date || lb.createdAt)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories Widget */}
              {blog.categories && blog.categories.length > 0 && (
                <div
                  style={{
                    background: "white",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    border: "1px solid var(--gray-100)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "1rem",
                      paddingBottom: "0.75rem",
                      borderBottom: "2px solid var(--gray-100)",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ color: "var(--primary)", fontSize: "20px" }}
                    >
                      sell
                    </span>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        color: "var(--gray-800)",
                      }}
                    >
                      Tags
                    </h3>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                    }}
                  >
                    {blog.categories.map((cat) => (
                      <Link
                        key={cat}
                        href={`/blogs?category=${encodeURIComponent(cat)}`}
                        style={{
                          padding: "0.4rem 1rem",
                          borderRadius: "999px",
                          border: "1.5px solid var(--gray-200)",
                          background: "var(--gray-50)",
                          color: "var(--gray-600)",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                          textDecoration: "none",
                          transition: "all 0.25s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--primary)";
                          e.currentTarget.style.color = "white";
                          e.currentTarget.style.borderColor = "var(--primary)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "var(--gray-50)";
                          e.currentTarget.style.color = "var(--gray-600)";
                          e.currentTarget.style.borderColor = "var(--gray-200)";
                        }}
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>

        {/* Blog content styling */}
        <style>{`
          .blog-content h1, .blog-content h2, .blog-content h3,
          .blog-content h4, .blog-content h5, .blog-content h6 {
            color: var(--gray-800);
            margin-top: 1.75rem;
            margin-bottom: 0.75rem;
            line-height: 1.35;
          }
          .blog-content h1 { font-size: 1.8rem; font-weight: 800; }
          .blog-content h2 { font-size: 1.5rem; font-weight: 700; }
          .blog-content h3 { font-size: 1.25rem; font-weight: 700; }
          .blog-content h4 { font-size: 1.1rem; font-weight: 600; }
          .blog-content p {
            margin-bottom: 1.15rem;
            line-height: 1.85;
            color: var(--gray-600);
          }
          .blog-content strong, .blog-content b {
            color: var(--gray-800);
            font-weight: 700;
          }
          .blog-content a {
            color: var(--primary);
            text-decoration: underline;
            text-underline-offset: 3px;
          }
          .blog-content a:hover {
            color: var(--primary-dark);
          }
          .blog-content ul, .blog-content ol {
            padding-left: 1.5rem;
            margin-bottom: 1.15rem;
          }
          .blog-content li {
            margin-bottom: 0.5rem;
            color: var(--gray-600);
            line-height: 1.75;
          }
          .blog-content img {
            max-width: 100%;
            height: auto;
            border-radius: 12px;
            margin: 1.25rem 0;
          }
          .blog-content blockquote {
            border-left: 4px solid var(--primary);
            padding: 1rem 1.5rem;
            margin: 1.5rem 0;
            background: var(--gray-50);
            border-radius: 0 12px 12px 0;
            color: var(--gray-600);
            font-style: italic;
          }
          .blog-content pre {
            background: var(--gray-800);
            color: #e5e7eb;
            padding: 1.25rem;
            border-radius: 12px;
            overflow-x: auto;
            margin: 1.25rem 0;
          }
          .blog-content code {
            background: var(--gray-100);
            padding: 0.15rem 0.4rem;
            border-radius: 4px;
            font-size: 0.9em;
          }
          .blog-content pre code {
            background: none;
            padding: 0;
          }

          @media (max-width: 960px) {
            .blog-detail-layout {
              flex-direction: column !important;
            }
            .blog-detail-sidebar {
              width: 100% !important;
              min-width: 100% !important;
              position: static !important;
            }
          }
        `}</style>
      </main>
    </>
  );
}
