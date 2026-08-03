"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "../../components/Header";

interface DestinationItem {
  name: string;
  description?: string;
  images?: string[];
}

interface DestinationHierarchy {
  _id: string;
  stateName: string;
  cityName: string;
  stateData?: any;
  cityData?: any;
  areas?: any[];
}

export default function DestinationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const [item, setItem] = useState<DestinationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentDestination, setCurrentDestination] =
    useState<DestinationHierarchy | null>(null);
  const [relatedDestinations, setRelatedDestinations] = useState<
    DestinationItem[]
  >([]);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);

  const itemName = decodeURIComponent(slug);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        // First try to fetch by ID if slug looks like an ID
        if (slug.length < 20) {
          // Could be a short ID
          const idResponse = await fetch(`/api/hotel-destinations?id=${slug}`, {
            cache: "no-store",
          });
          if (idResponse.ok) {
            const data = await idResponse.json();
            if (data && data._id) {
              // This is a destination hierarchy, fetch first top destination as sample
              if (data.stateData?.topDestinations?.[0]) {
                setItem(data.stateData.topDestinations[0]);
                setCurrentDestination(data);
                extractRelatedDestinations(data, itemName);
                setLoading(false);
                return;
              }
            }
          }
        }

        // Otherwise, fetch all and search by name
        const response = await fetch("/api/hotel-destinations", {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();

          // Find the item across all destinations
          for (const dest of data) {
            // Check state level
            if (dest.stateData?.topDestinations) {
              const found = dest.stateData.topDestinations.find(
                (d: any) => d.name === itemName,
              );
              if (found) {
                setItem(found);
                setCurrentDestination(dest);
                extractRelatedDestinations(dest, itemName);
                setLoading(false);
                return;
              }
            }
            if (dest.stateData?.topAttractions) {
              const found = dest.stateData.topAttractions.find(
                (d: any) => d.name === itemName,
              );
              if (found) {
                setItem(found);
                setCurrentDestination(dest);
                extractRelatedDestinations(dest, itemName);
                setLoading(false);
                return;
              }
            }
            if (dest.stateData?.thingsToDo) {
              const found = dest.stateData.thingsToDo.find(
                (d: any) => d.name === itemName,
              );
              if (found) {
                setItem(found);
                setCurrentDestination(dest);
                extractRelatedDestinations(dest, itemName);
                setLoading(false);
                return;
              }
            }

            // Check city level
            if (dest.cityData?.topDestinations) {
              const found = dest.cityData.topDestinations.find(
                (d: any) => d.name === itemName,
              );
              if (found) {
                setItem(found);
                setCurrentDestination(dest);
                extractRelatedDestinations(dest, itemName);
                setLoading(false);
                return;
              }
            }
            if (dest.cityData?.topAttractions) {
              const found = dest.cityData.topAttractions.find(
                (d: any) => d.name === itemName,
              );
              if (found) {
                setItem(found);
                setCurrentDestination(dest);
                extractRelatedDestinations(dest, itemName);
                setLoading(false);
                return;
              }
            }
            if (dest.cityData?.thingsToDo) {
              const found = dest.cityData.thingsToDo.find(
                (d: any) => d.name === itemName,
              );
              if (found) {
                setItem(found);
                setCurrentDestination(dest);
                extractRelatedDestinations(dest, itemName);
                setLoading(false);
                return;
              }
            }
            if (dest.cityData?.famousCafes) {
              const found = dest.cityData.famousCafes.find(
                (d: any) => d.name === itemName,
              );
              if (found) {
                setItem(found);
                setCurrentDestination(dest);
                extractRelatedDestinations(dest, itemName);
                setLoading(false);
                return;
              }
            }
            if (dest.cityData?.famousAttractions) {
              const found = dest.cityData.famousAttractions.find(
                (d: any) => d.name === itemName,
              );
              if (found) {
                setItem(found);
                setCurrentDestination(dest);
                extractRelatedDestinations(dest, itemName);
                setLoading(false);
                return;
              }
            }
            if (dest.cityData?.shopping) {
              const found = dest.cityData.shopping.find(
                (d: any) => d.name === itemName,
              );
              if (found) {
                setItem(found);
                setCurrentDestination(dest);
                extractRelatedDestinations(dest, itemName);
                setLoading(false);
                return;
              }
            }

            // Check area/subarea levels
            if (dest.areas && Array.isArray(dest.areas)) {
              for (const area of dest.areas) {
                if (area.topDestinations) {
                  const found = area.topDestinations.find(
                    (d: any) => d.name === itemName,
                  );
                  if (found) {
                    setItem(found);
                    setCurrentDestination(dest);
                    extractRelatedDestinations(dest, itemName);
                    setLoading(false);
                    return;
                  }
                }
                if (area.topAttractions) {
                  const found = area.topAttractions.find(
                    (d: any) => d.name === itemName,
                  );
                  if (found) {
                    setItem(found);
                    setCurrentDestination(dest);
                    extractRelatedDestinations(dest, itemName);
                    setLoading(false);
                    return;
                  }
                }
                if (area.thingsToDo) {
                  const found = area.thingsToDo.find(
                    (d: any) => d.name === itemName,
                  );
                  if (found) {
                    setItem(found);
                    setCurrentDestination(dest);
                    extractRelatedDestinations(dest, itemName);
                    setLoading(false);
                    return;
                  }
                }

                // Check subareas
                if (area.subareas && Array.isArray(area.subareas)) {
                  for (const subarea of area.subareas) {
                    if (subarea.topDestinations) {
                      const found = subarea.topDestinations.find(
                        (d: any) => d.name === itemName,
                      );
                      if (found) {
                        setItem(found);
                        setCurrentDestination(dest);
                        extractRelatedDestinations(dest, itemName);
                        setLoading(false);
                        return;
                      }
                    }
                    if (subarea.topAttractions) {
                      const found = subarea.topAttractions.find(
                        (d: any) => d.name === itemName,
                      );
                      if (found) {
                        setItem(found);
                        setCurrentDestination(dest);
                        extractRelatedDestinations(dest, itemName);
                        setLoading(false);
                        return;
                      }
                    }
                    if (subarea.thingsToDo) {
                      const found = subarea.thingsToDo.find(
                        (d: any) => d.name === itemName,
                      );
                      if (found) {
                        setItem(found);
                        setCurrentDestination(dest);
                        extractRelatedDestinations(dest, itemName);
                        setLoading(false);
                        return;
                      }
                    }
                  }
                }
              }
            }
          }

          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch destination:", error);
        setLoading(false);
      }
    };

    fetchDestinations();
  }, [itemName]);

  // Helper function to extract related destinations from the same city/state
  const extractRelatedDestinations = (
    destHierarchy: any,
    currentItemName: string,
  ) => {
    const related: DestinationItem[] = [];

    // Collect all items from state and city level
    if (destHierarchy.stateData?.topDestinations) {
      related.push(...destHierarchy.stateData.topDestinations);
    }
    if (destHierarchy.stateData?.topAttractions) {
      related.push(...destHierarchy.stateData.topAttractions);
    }
    if (destHierarchy.stateData?.thingsToDo) {
      related.push(...destHierarchy.stateData.thingsToDo);
    }

    if (destHierarchy.cityData?.topDestinations) {
      related.push(...destHierarchy.cityData.topDestinations);
    }
    if (destHierarchy.cityData?.topAttractions) {
      related.push(...destHierarchy.cityData.topAttractions);
    }
    if (destHierarchy.cityData?.thingsToDo) {
      related.push(...destHierarchy.cityData.thingsToDo);
    }
    if (destHierarchy.cityData?.famousCafes) {
      related.push(...destHierarchy.cityData.famousCafes);
    }
    if (destHierarchy.cityData?.famousAttractions) {
      related.push(...destHierarchy.cityData.famousAttractions);
    }
    if (destHierarchy.cityData?.shopping) {
      related.push(...destHierarchy.cityData.shopping);
    }

    // Filter out the current item and duplicates
    const uniqueRelated = related.filter(
      (item, index, array) =>
        item.name !== currentItemName &&
        array.findIndex((a) => a.name === item.name) === index,
    );

    setRelatedDestinations(uniqueRelated);
  };

  const nextImage = () => {
    if (item?.images && item.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % item.images!.length);
    }
  };

  const prevImage = () => {
    if (item?.images && item.images.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + item.images!.length) % item.images!.length,
      );
    }
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <Header currentPage="hotels" />
        <main className="flex flex-col items-center justify-center flex-1 pt-24">
          <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
            <p style={{ fontSize: "1.1rem", color: "#666" }}>
              Loading destination details...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <Header currentPage="hotels" />
        <main className="flex flex-col items-center justify-center flex-1 pt-24">
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              maxWidth: "600px",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
            <h1
              style={{
                fontSize: "2rem",
                color: "#1a1a2e",
                marginBottom: "1rem",
              }}
            >
              Destination Not Found
            </h1>
            <p
              style={{ fontSize: "1rem", color: "#666", marginBottom: "2rem" }}
            >
              The destination you're looking for doesn't exist or has been
              removed.
            </p>
            <button
              onClick={() => router.back()}
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(102, 126, 234, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  const hasImages = item.images && item.images.length > 0;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-50">
      <Header currentPage="hotels" />

      <main className="flex flex-col items-center w-full">
        {/* Image Gallery - Top Section */}
        {hasImages && (
          <div
            style={{
              width: "100%",
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "1.5rem 1rem",
            }}
          >
            <div
              className="destination-gallery"
              style={{
                display: "grid",
                gridTemplateColumns:
                  item.images!.length === 1 ? "1fr" : "2fr 1fr 1fr",
                gridTemplateRows:
                  item.images!.length === 1 ? "auto" : "1fr 1fr",
                gap: "0.5rem",
                height: item.images!.length === 1 ? "auto" : "400px",
                borderRadius: "16px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Main large image */}
              <div
                style={{
                  gridRow: item.images!.length > 1 ? "1 / 3" : "1",
                  gridColumn: item.images!.length > 1 ? "1" : "1 / -1",
                  position: "relative",
                  cursor: "pointer",
                  overflow: "hidden",
                  aspectRatio: item.images!.length === 1 ? "16/9" : "auto",
                }}
                onClick={() => {
                  setFullscreenImageIndex(0);
                  setFullscreenImage(item.images![0]);
                }}
              >
                <img
                  src={item.images![0]}
                  alt={item.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/800x400?text=Image+Not+Found";
                  }}
                />
              </div>

              {/* Smaller images grid */}
              {item.images!.length > 1 && (
                <div
                  style={{
                    gridColumn: "2 / -1",
                    gridRow: "1 / -1",
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "0.5rem",
                  }}
                >
                  {item.images!.slice(1, 5).map((img, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: "relative",
                        cursor: "pointer",
                        overflow: "hidden",
                      }}
                      onClick={() => {
                        setFullscreenImageIndex(idx + 1);
                        setFullscreenImage(img);
                      }}
                    >
                      <img
                        src={img}
                        alt={`${item.name} gallery ${idx + 2}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/400x200?text=Image+Not+Found";
                        }}
                      />
                      {idx === 3 && item.images!.length > 5 && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0, 0, 0, 0.6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "1.5rem",
                            fontWeight: 700,
                          }}
                        >
                          +{item.images!.length - 5} more
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Main Content Section */}
        <div
          className="destination-main-grid"
          style={{
            width: "100%",
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 1rem 2rem",
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: "2rem",
          }}
        >
          {/* Left Column - Details */}
          <div>
            {/* Destination Header */}
            <div style={{ marginBottom: "2rem" }}>
              <h1
                className="destination-title"
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  marginBottom: "0.5rem",
                  color: "#1a1a2e",
                }}
              >
                {item.name}
              </h1>
              {currentDestination && (
                <div
                  className="destination-location"
                  style={{
                    fontSize: "0.95rem",
                    color: "#64748b",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span>📍</span>
                  <span>
                    {currentDestination.cityName},{" "}
                    {currentDestination.stateName}
                  </span>
                </div>
              )}
            </div>

            {/* Description Section */}
            {item.description && (
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "2rem",
                  marginBottom: "2rem",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    marginBottom: "1rem",
                    color: "#1a1a2e",
                  }}
                >
                  About This Destination
                </h2>
                <p
                  style={{
                    fontSize: "1rem",
                    lineHeight: 1.8,
                    color: "#475569",
                    margin: 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {item.description}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Quick Info Card */}
          <div>
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                padding: "1.5rem",
                position: "sticky",
                top: "120px",
              }}
            >
              <h2
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "#1a1a2e",
                  margin: "0 0 1rem 0",
                }}
              >
                Destination Info
              </h2>

              {/* Info Items */}
              {hasImages && (
                <div
                  style={{
                    marginBottom: "1rem",
                    paddingBottom: "1rem",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#94a3b8",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "0.5rem",
                    }}
                  >
                    📷 Gallery
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#667eea",
                    }}
                  >
                    {item.images!.length}{" "}
                    {item.images!.length === 1 ? "Image" : "Images"}
                  </div>
                </div>
              )}

              {currentDestination && (
                <div
                  style={{
                    marginBottom: "1rem",
                    paddingBottom: "1rem",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#94a3b8",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "0.5rem",
                    }}
                  >
                    📍 Location
                  </div>
                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "#1a1a2e",
                    }}
                  >
                    {currentDestination.cityName},{" "}
                    {currentDestination.stateName}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => router.back()}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(102, 126, 234, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                ← Go Back
              </button>
            </div>
          </div>
        </div>
        {/* Related Destinations Section */}
        {relatedDestinations.length > 0 && (
          <div
            style={{
              width: "100%",
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "2rem 1rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "1.5rem",
                color: "#1a202c",
              }}
            >
              More Destinations in{" "}
              {currentDestination?.stateName || "This Area"}
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {relatedDestinations.slice(0, 6).map((destination) => (
                <div
                  key={destination.name}
                  onClick={() => {
                    window.location.href = `/destinations/${encodeURIComponent(destination.name)}`;
                  }}
                  style={{
                    cursor: "pointer",
                    borderRadius: "12px",
                    overflow: "hidden",
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 16px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 1px 3px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  {/* Image */}
                  {destination.images && destination.images[0] && (
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        paddingBottom: "66.66%",
                        backgroundColor: "#e2e8f0",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={destination.images[0]}
                        alt={destination.name}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/300x200?text=Image+Not+Found";
                        }}
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ padding: "1rem" }}>
                    <h3
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        marginBottom: "0.5rem",
                        color: "#1a202c",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {destination.name}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "#64748b",
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        lineHeight: "1.3",
                      }}
                    >
                      {destination.description?.substring(0, 80) ||
                        "Explore this destination"}
                      {destination.description &&
                      destination.description.length > 80
                        ? "..."
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Fullscreen Image Modal */}
        {fullscreenImage && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.95)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "1rem",
            }}
            onClick={() => setFullscreenImage(null)}
          >
            {/* Image Container */}
            <div
              style={{
                position: "relative",
                maxWidth: "90vw",
                maxHeight: "90vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={fullscreenImage}
                alt="Fullscreen view"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/800x600?text=Image+Not+Found";
                }}
              />

              {/* Image Counter */}
              <div
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                }}
              >
                {fullscreenImageIndex + 1} / {item?.images?.length || 0}
              </div>

              {/* Previous Button */}
              {item?.images &&
                item.images.length > 1 &&
                fullscreenImageIndex > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newIdx = fullscreenImageIndex - 1;
                      setFullscreenImageIndex(newIdx);
                      setFullscreenImage(item.images![newIdx]);
                    }}
                    style={{
                      position: "absolute",
                      left: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      border: "none",
                      color: "white",
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      fontSize: "1.5rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255, 255, 255, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255, 255, 255, 0.2)";
                    }}
                  >
                    ❮
                  </button>
                )}

              {/* Next Button */}
              {item?.images &&
                item.images.length > 1 &&
                fullscreenImageIndex < item.images.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newIdx = fullscreenImageIndex + 1;
                      setFullscreenImageIndex(newIdx);
                      setFullscreenImage(item.images![newIdx]);
                    }}
                    style={{
                      position: "absolute",
                      right: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      border: "none",
                      color: "white",
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      fontSize: "1.5rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255, 255, 255, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255, 255, 255, 0.2)";
                    }}
                  >
                    ❯
                  </button>
                )}

              {/* Close Button */}
              <button
                onClick={() => setFullscreenImage(null)}
                style={{
                  position: "absolute",
                  top: "1rem",
                  left: "1rem",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  color: "white",
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(255, 255, 255, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(255, 255, 255, 0.2)";
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}{" "}
      </main>
    </div>
  );
}
