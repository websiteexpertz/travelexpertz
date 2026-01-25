import { NextRequest, NextResponse } from "next/server";

interface FieldConfig {
  key: string;
  label: string;
  order?: number;
}

interface FormOptions {
  tableColumns: FieldConfig[];
  detailFields: FieldConfig[];
  sectionOrder: string[];
}

/**
 * Default form options for packages
 */
const DEFAULT_FORM_OPTIONS: FormOptions = {
  tableColumns: [
    { key: "duration", label: "Duration", order: 1 },
    { key: "location", label: "Starting Point", order: 2 },
    { key: "category", label: "Category", order: 3 },
    { key: "badge", label: "Badge", order: 4 },
    { key: "price", label: "Price", order: 5 },
  ],
  detailFields: [],
  sectionOrder: [
    "overview",
    "highlights",
    "itinerary",
    "inclusions",
    "notes",
    "things-to-carry",
    "refund",
  ],
};

/**
 * GET /api/admin/form-options
 * Returns form configuration options for package details page
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // TODO: In the future, fetch from database instead of returning defaults
    // For now, return hardcoded defaults that match the frontend expectations

    const formOptions: FormOptions = DEFAULT_FORM_OPTIONS;

    return NextResponse.json(formOptions, { status: 200 });
  } catch (error) {
    console.error("Error fetching form options:", error);
    return NextResponse.json(
      { error: "Failed to load form options" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/form-options
 * Updates form configuration options (admin only)
 * TODO: Add authentication check for admin
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // TODO: Add admin authentication check here
    const body = await request.json();

    if (!body.tableColumns || !Array.isArray(body.tableColumns)) {
      return NextResponse.json(
        { error: "tableColumns must be an array" },
        { status: 400 }
      );
    }

    if (!body.detailFields || !Array.isArray(body.detailFields)) {
      return NextResponse.json(
        { error: "detailFields must be an array" },
        { status: 400 }
      );
    }

    if (!body.sectionOrder || !Array.isArray(body.sectionOrder)) {
      return NextResponse.json(
        { error: "sectionOrder must be an array" },
        { status: 400 }
      );
    }

    // TODO: Save to database
    const formOptions: FormOptions = {
      tableColumns: body.tableColumns,
      detailFields: body.detailFields,
      sectionOrder: body.sectionOrder,
    };

    return NextResponse.json(formOptions, { status: 200 });
  } catch (error) {
    console.error("Error updating form options:", error);
    return NextResponse.json(
      { error: "Failed to update form options" },
      { status: 500 }
    );
  }
}
