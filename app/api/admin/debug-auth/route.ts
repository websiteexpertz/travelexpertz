import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET(req: NextRequest) {
  let client: MongoClient | null = null;
  try {
    client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
    await client.connect();
    console.log("✓ Connected to MongoDB");

    const db = client.db("travelexpertz");

    // Fetch users
    const users = await db.collection("users").find({}).toArray();
    console.log(`\n========== USERS ==========`);
    console.log(`Total users: ${users.length}`);
    users.forEach((user, idx) => {
      console.log(`\n[User ${idx + 1}]`);
      console.log(`  ID: ${user._id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Active: ${user.isActive}`);
    });

    // Fetch user profiles
    const profiles = await db.collection("user_profiles").find({}).toArray();
    console.log(`\n========== USER PROFILES ==========`);
    console.log(`Total profiles: ${profiles.length}`);
    profiles.forEach((profile, idx) => {
      console.log(`\n[Profile ${idx + 1}]`);
      console.log(`  UserID: ${profile.userId}`);
      console.log(`  Name: ${profile.name || "N/A"}`);
      console.log(`  Role: ${profile.role || "N/A"}`);
    });

    // Fetch property owners
    const owners = await db.collection("propertyowners").find({}).toArray();
    console.log(`\n========== PROPERTY OWNERS ==========`);
    console.log(`Total property owners: ${owners.length}`);
    owners.forEach((owner, idx) => {
      console.log(`\n[Owner ${idx + 1}]`);
      console.log(`  ID: ${owner._id}`);
      console.log(`  Email: ${owner.email}`);
      console.log(`  Name: ${owner.ownerName || "N/A"}`);
      console.log(`  Business: ${owner.businessName || "N/A"}`);
      console.log(`  Verified: ${owner.verified || false}`);
      console.log(`  Active: ${owner.active || false}`);
    });

    // Fetch owner properties
    const properties = await db.collection("ownerproperties").find({}).toArray();
    console.log(`\n========== OWNER PROPERTIES ==========`);
    console.log(`Total owner properties: ${properties.length}`);
    properties.forEach((prop, idx) => {
      console.log(`\n[Property ${idx + 1}]`);
      console.log(`  ID: ${prop._id}`);
      console.log(`  Owner ID: ${prop.ownerId}`);
      console.log(`  Status: ${prop.status || "N/A"}`);
    });

    console.log(`\n========== SUMMARY ==========`);
    console.log(`Users: ${users.length}`);
    console.log(`User Profiles: ${profiles.length}`);
    console.log(`Property Owners: ${owners.length}`);
    console.log(`Owner Properties: ${properties.length}`);

    return NextResponse.json(
      {
        summary: {
          users: users.length,
          profiles: profiles.length,
          owners: owners.length,
          properties: properties.length,
        },
        users: users.map(u => ({
          id: u._id,
          email: u.email,
          role: u.role,
          active: u.isActive,
        })),
        owners: owners.map(o => ({
          id: o._id,
          email: o.email,
          name: o.ownerName,
          business: o.businessName,
          active: o.active,
        })),
        properties: properties.map(p => ({
          id: p._id,
          ownerId: p.ownerId,
          status: p.status,
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching auth data:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}
