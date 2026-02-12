import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

async function getDb() {
  const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
  await client.connect();
  return client.db("travelexpertz");
}

export async function GET(req: NextRequest) {
  let client: MongoClient | null = null;
  try {
    client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
    await client.connect();
    const db = client.db("travelexpertz");
    const collection = db.collection("ownerproperties");

    const filter = req.nextUrl.searchParams.get("filter") || "all";
    const query: any = {};

    if (filter !== "all") {
      query.status = filter;
    }

    const properties = await collection
      .find(query)
      .sort({ submittedAt: -1 })
      .project({
        name: 1,
        propertyType: 1,
        city: 1,
        price: 1,
        status: 1,
        ownerName: 1,
        ownerEmail: 1,
        submittedAt: 1,
        description: 1,
        rejectionReason: 1,
      })
      .toArray();

    return NextResponse.json(properties);
  } catch (error: any) {
    console.error("Error fetching approvals:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}
