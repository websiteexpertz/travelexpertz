import { NextRequest, NextResponse } from "next/server";

// Simple admin credentials (in production, store these securely in environment variables)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "expertz123";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Simple JWT token generation
function generateToken(username: string): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      username,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    })
  );
  const signature = btoa(JWT_SECRET + header + payload);
  return `${header}.${payload}.${signature}`;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    console.log('Login attempt:', { 
      receivedUsername: username, 
      receivedPassword: password,
      expectedUsername: ADMIN_USERNAME,
      expectedPassword: ADMIN_PASSWORD 
    });

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    // Check credentials (trim whitespace for safety)
    if (username.trim() === ADMIN_USERNAME && password.trim() === ADMIN_PASSWORD) {
      const token = generateToken(username);
      console.log('Login successful for:', username);
      return NextResponse.json(
        {
          message: "Login successful",
          token,
          username,
        },
        { status: 200 }
      );
    } else {
      console.log('Login failed - credentials mismatch');
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
