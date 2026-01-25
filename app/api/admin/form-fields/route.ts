import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

// GET all form fields
export async function GET(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");
    const entityType = searchParams.get("entityType");
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(MONGODB_DB);
    const formFieldsCollection = db.collection("formFields");
    
    const filter: any = { active: true };
    if (section) filter.section = section;
    if (entityType) filter.entityType = entityType;
    
    const fields = await formFieldsCollection
      .find(filter)
      .sort({ order: 1, fieldName: 1 })
      .toArray();

    return NextResponse.json(fields);
  } catch (error) {
    console.error("Error fetching form fields:", error);
    return NextResponse.json(
      { error: "Failed to fetch form fields" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// POST create new form field
export async function POST(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { 
      fieldName, 
      fieldType, 
      section, 
      entityType,
      placeholder,
      helpText,
      required = false,
      options = [],
      active = true,
      order = 0
    } = body;

    if (!fieldName || !fieldType || !section || !entityType) {
      return NextResponse.json(
        { error: "Field name, type, section, and entity type are required" },
        { status: 400 }
      );
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(MONGODB_DB);
    const formFieldsCollection = db.collection("formFields");

    // Check for duplicate name in same section and entity
    const existing = await formFieldsCollection.findOne({ 
      fieldName: { $regex: new RegExp(`^${fieldName.trim()}$`, "i") },
      section,
      entityType
    });

    if (existing) {
      return NextResponse.json(
        { error: "Field with this name already exists in this section" },
        { status: 400 }
      );
    }

    const result = await formFieldsCollection.insertOne({
      fieldName: fieldName.trim(),
      fieldType, // text, textarea, number, list, select, checkbox
      section, // overview, itinerary, inclusions, essentials, policies, amenities, etc.
      entityType, // package, hotel, homestay, etc.
      placeholder: placeholder || "",
      helpText: helpText || "",
      required,
      options, // For select/radio fields
      active,
      order: Number(order) || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { 
        message: "Form field created successfully",
        fieldId: result.insertedId 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating form field:", error);
    return NextResponse.json(
      { error: "Failed to create form field" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// PUT update form field
export async function PUT(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Field ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
      fieldName, 
      fieldType, 
      section, 
      entityType,
      placeholder,
      helpText,
      required,
      options,
      active,
      order
    } = body;

    if (!fieldName || !fieldType) {
      return NextResponse.json(
        { error: "Field name and type are required" },
        { status: 400 }
      );
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(MONGODB_DB);
    const formFieldsCollection = db.collection("formFields");

    // Check for duplicate name (excluding current field)
    const existing = await formFieldsCollection.findOne({
      _id: { $ne: new ObjectId(id) },
      fieldName: { $regex: new RegExp(`^${fieldName.trim()}$`, "i") },
      section,
      entityType
    });

    if (existing) {
      return NextResponse.json(
        { error: "Field with this name already exists in this section" },
        { status: 400 }
      );
    }

    const result = await formFieldsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          fieldName: fieldName.trim(),
          fieldType,
          section,
          entityType,
          placeholder: placeholder || "",
          helpText: helpText || "",
          required: required !== undefined ? required : false,
          options: options || [],
          active: active !== undefined ? active : true,
          order: Number(order) || 0,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Field not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Form field updated successfully" });
  } catch (error) {
    console.error("Error updating form field:", error);
    return NextResponse.json(
      { error: "Failed to update form field" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// DELETE form field
export async function DELETE(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Field ID is required" },
        { status: 400 }
      );
    }
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(MONGODB_DB);
    const formFieldsCollection = db.collection("formFields");

    const result = await formFieldsCollection.deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Field not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Form field deleted successfully" });
  } catch (error) {
    console.error("Error deleting form field:", error);
    return NextResponse.json(
      { error: "Failed to delete form field" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
