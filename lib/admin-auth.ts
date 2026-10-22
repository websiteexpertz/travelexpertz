import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export function requireAdmin(request: NextRequest): NextResponse | null {
  const token = request.cookies.get("adminToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [header, payload, signature, extra] = token.split(".");
    if (!header || !payload || !signature || extra) {
      throw new Error("Invalid token format");
    }

    const expectedSignature = btoa(JWT_SECRET + header + payload).replace(/=/g, "");
    if (signature.replace(/=/g, "") !== expectedSignature) {
      throw new Error("Invalid token signature");
    }

    const decodedPayload = JSON.parse(atob(payload));
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error("Token has expired");
    }

    return null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}