import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json(null, { status: 500 });
    }

    const { id } = await params;
    console.log(`Fetching package with ID: ${id}`);

    // Validate if id is a valid MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      console.error(`Invalid ObjectId format: ${id}`);
      return NextResponse.json(null, { status: 404 });
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const packagesCollection = db.collection("packages");

    const pkg = await packagesCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!pkg) {
      console.error(`Package not found: ${id}`);
      return NextResponse.json(null, { status: 404 });
    }

    console.log(`Found package: ${pkg.title}`);
    return NextResponse.json(pkg);
  } catch (error) {
    console.error("Error fetching package:", error);
    return NextResponse.json(null, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
