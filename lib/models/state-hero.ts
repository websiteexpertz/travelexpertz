import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

export interface StateHeroSlide {
  _id?: string | ObjectId;
  countryId: string;
  countryName: string;
  stateId: string;
  stateName: string;
  cityId?: string | null;
  cityName?: string;
  locationType?: "STATE" | "CITY";
  title?: string;
  locationName?: string;
  destinationName: string;
  headline?: string;
  tagline: string;
  description: string;
  imageUrl: string;
  imagePublicId?: string;
  altText?: string;
  displayOrder: number;
  order?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StateHeroSlidePublic {
  id: string;
  title?: string;
  locationName?: string;
  destinationName: string;
  headline?: string;
  tagline: string;
  description: string;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
  order?: number;
}

export const HERO_SLIDES_COLLECTION = "state_hero_slides";
export const MAX_ACTIVE_SLIDES_PER_STATE = 5;
export const MAX_ACTIVE_SLIDES_PER_CITY = 5;

/**
 * Ensure collection indexes exist for state_hero_slides.
 */
let indexesCreated = false;
export async function ensureHeroSlideIndexes() {
  if (indexesCreated) return;
  try {
    const db = await getDb();
    const collection = db.collection<StateHeroSlide>(HERO_SLIDES_COLLECTION);
    await collection.createIndex({ stateName: 1, cityName: 1, isActive: 1, displayOrder: 1 });
    await collection.createIndex({ cityName: 1, isActive: 1 });
    await collection.createIndex({ countryName: 1, stateName: 1 });
    indexesCreated = true;
  } catch (err) {
    console.error("Failed to create indexes for state_hero_slides:", err);
  }
}
