/**
 * Services Grid Component - Shows different services offered
 */

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./ServicesGrid.module.css";
import { Card } from "../ui/Card";

interface Service {
  id: string;
  icon: string;
  image?: string;
  title: string;
  description: string;
  href?: string;
}

interface ServicesGridProps {
  title?: string;
  services?: Service[];
  columns?: 2 | 3 | 4;
}

const defaultServices: Service[] = [
  {
    id: "1",
    icon: "✈️",
    image: "/flight-ticket.png",
    title: "Flights",
    description: "Book flights to destinations worldwide",
    href: "/flights",
  },
  {
    id: "2",
    icon: "🏨",
    image: "/train-ticket.png",
    title: "Train Tickets",
    description: "Book train tickets across the country",
    href: "/trains",
  },
  {
    id: "3",
    icon: "🚗",
    image: "/cab.png",
    title: "Cabs",
    description: "Rent a cab for your journey",
    href: "/cabs",
  },
  {
    id: "4",
    icon: "🚌",
    image: "/bus-ticket.png",
    title: "Bus Tickets",
    description: "Book bus tickets for your travel",
    href: "/bus",
  },
  {
    id: "5",
    icon: "📋",
    image: "/visa.png",
    title: "Visa Services",
    description: "Get assistance with visa documentation",
    href: "/visa",
  },
  {
    id: "6",
    icon: "💳",
    image: "/forex-card-and-currency .png",
    title: "Forex & Currency",
    description: "Exchange currency and get forex cards",
    href: "/forex",
  },
  {
    id: "7",
    icon: "🎟️",
    image: "/tour-packages.png",
    title: "Tour Packages",
    description: "Explore curated tour packages",
    href: "/tours",
  },
  {
    id: "8",
    icon: "🛡️",
    image: "/travel-insurance.png",
    title: "Travel Insurance",
    description: "Get travel insurance coverage",
    href: "/insurance",
  },
];

export const ServicesGrid: React.FC<ServicesGridProps> = ({
  title = "Our Services",
  services = defaultServices,
  columns = 3,
}) => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {title && <h2 className={styles.title}>{title}</h2>}

        <div className={`${styles.grid} ${styles[`columns-${columns}`]}`}>
          {services.map((service) => (
            <Link key={service.id} href={service.href || "#"}>
              {service.image && (
                <Image
                  src={service.image}
                  alt={service.title}
                  width={200}
                  height={150}
                  className={styles.serviceImage}
                />
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;
