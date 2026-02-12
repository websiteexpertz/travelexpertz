"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../components/Header";

interface AboutItem {
  _id?: string;
  section: string;
  title?: string;
  subtitle?: string;
  content?: string;
  icon?: string;
  image?: string;
  order: number;
  active: boolean;
  name?: string;
  role?: string;
  number?: string;
  label?: string;
  description?: string;
}

export default function AboutPage() {
  const [hero, setHero] = useState<AboutItem | null>(null);
  const [story, setStory] = useState<AboutItem | null>(null);
  const [mission, setMission] = useState<AboutItem | null>(null);
  const [vision, setVision] = useState<AboutItem | null>(null);
  const [values, setValues] = useState<AboutItem[]>([]);
  const [statistics, setStatistics] = useState<AboutItem[]>([]);
  const [team, setTeam] = useState<AboutItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const response = await fetch("/api/about");
      if (response.ok) {
        const data: AboutItem[] = await response.json();

        setHero(data.find((item) => item.section === "hero") || null);
        setStory(data.find((item) => item.section === "story") || null);
        setMission(data.find((item) => item.section === "mission") || null);
        setVision(data.find((item) => item.section === "vision") || null);
        setValues(data.filter((item) => item.section === "values"));
        setStatistics(data.filter((item) => item.section === "statistics"));
        setTeam(data.filter((item) => item.section === "team"));
      }
    } catch (error) {
      console.error("Failed to fetch about data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section
        style={{
          padding: "4rem 5%",
          textAlign: "center",
          backgroundImage: "url('/hero-banner.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "3.5rem",
              fontWeight: 800,
              color: "#1a1a2e",
              marginBottom: "1.5rem",
              letterSpacing: "-1px",
            }}
          >
            {hero?.title || "About TravelExpertz"}
          </h1>
          <p
            style={{
              fontSize: "1.25rem",
              color: "#666",
              lineHeight: 1.8,
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            {hero?.subtitle ||
              "Your trusted partner in creating unforgettable travel experiences"}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main
        style={{
          padding: "4rem 5%",
          maxWidth: "1400px",
          margin: "0 auto",
          paddingTop: "4rem",
        }}
      >
        {/* Our Story */}
        {story && (
          <section style={{ marginBottom: "5rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "4rem",
                alignItems: "center",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    color: "#1a1a2e",
                    marginBottom: "1.5rem",
                  }}
                >
                  {story.title}
                </h2>
                {story.content?.split("\n\n").map((paragraph, index) => (
                  <p
                    key={index}
                    style={{
                      fontSize: "1.1rem",
                      color: "#555",
                      lineHeight: 1.8,
                      marginBottom: "1rem",
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              {story.image && (
                <div
                  style={{
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 20px 60px rgba(0, 102, 204, 0.15)",
                  }}
                >
                  <img
                    src={story.image}
                    alt={story.title}
                    style={{
                      width: "100%",
                      height: "400px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Mission & Vision */}
        {(mission || vision) && (
          <section style={{ marginBottom: "5rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
              }}
            >
              {mission && (
                <div
                  style={{
                    padding: "3rem",
                    background: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "20px",
                    boxShadow: "0 10px 40px rgba(0, 102, 204, 0.1)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "3rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    {mission.icon || "🎯"}
                  </div>
                  <h3
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "#1a1a2e",
                      marginBottom: "1rem",
                    }}
                  >
                    {mission.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "1.1rem",
                      color: "#555",
                      lineHeight: 1.8,
                    }}
                  >
                    {mission.content}
                  </p>
                </div>
              )}
              {vision && (
                <div
                  style={{
                    padding: "3rem",
                    background: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "20px",
                    boxShadow: "0 10px 40px rgba(0, 102, 204, 0.1)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "3rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    {vision.icon || "👁️"}
                  </div>
                  <h3
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "#1a1a2e",
                      marginBottom: "1rem",
                    }}
                  >
                    {vision.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "1.1rem",
                      color: "#555",
                      lineHeight: 1.8,
                    }}
                  >
                    {vision.content}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Core Values */}
        {values.length > 0 && (
          <section style={{ marginBottom: "5rem" }}>
            <h2
              style={{
                fontSize: "2.5rem",
                fontWeight: 700,
                color: "#1a1a2e",
                marginBottom: "3rem",
                textAlign: "center",
              }}
            >
              Our Core Values
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "2rem",
              }}
            >
              {values.map((value) => (
                <div
                  key={value._id}
                  style={{
                    padding: "2rem",
                    background: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "16px",
                    textAlign: "center",
                    boxShadow: "0 8px 24px rgba(0, 102, 204, 0.08)",
                    transition: "transform 0.3s ease",
                  }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                    {value.icon}
                  </div>
                  <h4
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      color: "#1a1a2e",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {value.title}
                  </h4>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      color: "#666",
                      lineHeight: 1.6,
                    }}
                  >
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Statistics */}
        {statistics.length > 0 && (
          <section style={{ marginBottom: "5rem" }}>
            <div
              style={{
                padding: "4rem",
                background: "linear-gradient(135deg, #0066cc 0%, #0088ee 100%)",
                borderRadius: "24px",
                color: "white",
              }}
            >
              <h2
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  marginBottom: "3rem",
                  textAlign: "center",
                }}
              >
                Our Impact
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "3rem",
                  textAlign: "center",
                }}
              >
                {statistics.map((stat) => (
                  <div key={stat._id}>
                    <div
                      style={{
                        fontSize: "3rem",
                        fontWeight: 800,
                        marginBottom: "0.5rem",
                      }}
                    >
                      {stat.number}
                    </div>
                    <div style={{ fontSize: "1.1rem", opacity: 0.9 }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Team Section */}
        {team.length > 0 && (
          <section style={{ marginBottom: "5rem" }}>
            <h2
              style={{
                fontSize: "2.5rem",
                fontWeight: 700,
                color: "#1a1a2e",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              Meet Our Team
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                color: "#666",
                textAlign: "center",
                marginBottom: "3rem",
                maxWidth: "700px",
                margin: "0 auto 3rem",
              }}
            >
              Our passionate team of travel experts is dedicated to making your
              dream vacation a reality
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "2rem",
              }}
            >
              {team.map((member) => (
                <div
                  key={member._id}
                  style={{
                    background: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(0, 102, 204, 0.08)",
                    transition: "transform 0.3s ease",
                  }}
                >
                  {member.image && (
                    <img
                      src={member.image}
                      alt={member.name}
                      style={{
                        width: "100%",
                        height: "300px",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <div style={{ padding: "1.5rem", textAlign: "center" }}>
                    <h4
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        color: "#1a1a2e",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {member.name}
                    </h4>
                    <p style={{ fontSize: "0.95rem", color: "#0066cc" }}>
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section
          style={{
            textAlign: "center",
            padding: "4rem",
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "24px",
            boxShadow: "0 20px 60px rgba(0, 102, 204, 0.1)",
          }}
        >
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              color: "#1a1a2e",
              marginBottom: "1rem",
            }}
          >
            Ready to Start Your Journey?
          </h2>
          <p
            style={{
              fontSize: "1.1rem",
              color: "#666",
              marginBottom: "2rem",
              maxWidth: "600px",
              margin: "0 auto 2rem",
            }}
          >
            Let us help you create unforgettable memories. Contact our team
            today!
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "1rem 3rem",
              background: "linear-gradient(135deg, #0066cc 0%, #0088ee 100%)",
              color: "white",
              textDecoration: "none",
              borderRadius: "12px",
              fontSize: "1.1rem",
              fontWeight: 600,
              boxShadow: "0 8px 24px rgba(0, 102, 204, 0.3)",
              transition: "all 0.3s ease",
            }}
          >
            Explore Destinations
          </Link>
        </section>
      </main>
    </div>
  );
}
