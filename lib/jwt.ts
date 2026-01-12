import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access-secret-change-in-production";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh-secret-change-in-production";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Generate access token (15 minutes)
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: "15m" });
}

// Generate refresh token (7 days)
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

// Verify access token
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}
