/**
 * Secure Document Download & Streaming API
 * Route: GET /api/bookings/[id]/documents/[documentId]
 * Authorizes access via session user (customer/admin/owner) or signed guest access token.
 */

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { getDb } from "@/lib/db";
import { BookingDocument } from "@/lib/services/documents/types";
import { getDocumentBufferFromGridFS } from "@/lib/services/documents/storage";
import {
  authorizeDocumentAccess,
  DocumentAuthUser,
} from "@/lib/services/documents/validation";
import { inMemoryBookingDocuments } from "@/lib/services/documents/generator";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id: bookingId, documentId } = await params;

    if (!bookingId || !documentId) {
      return NextResponse.json(
        { error: "Booking ID and Document ID are required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const guestToken = searchParams.get("token") || undefined;

    // 1. Resolve Authenticated User (if present via Authorization header or Cookie)
    let authUser: DocumentAuthUser | undefined;
    const authHeader = request.headers.get("authorization");
    let tokenStr: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      tokenStr = authHeader.substring(7);
    } else {
      const cookieHeader = request.headers.get("cookie") || "";
      const match = cookieHeader.match(/(?:^|;\s*)(?:token|auth_token)=([^;]+)/);
      if (match) tokenStr = match[1];
    }

    if (tokenStr) {
      try {
        const decoded = jwt.verify(tokenStr, JWT_SECRET) as any;
        authUser = {
          id: decoded.id || decoded.userId || decoded._id,
          role: decoded.role || (decoded.isAdmin ? "admin" : "user"),
          email: decoded.email,
        };
      } catch {
        // Token invalid or expired - proceed to check guestToken
      }
    }

    const db = await getDb();
    const documentsCollection = db.collection<BookingDocument>("booking_documents");

    // 2. Fetch Document Record
    let doc: BookingDocument | null = null;
    try {
      doc = await documentsCollection.findOne({
        $or: [
          { documentId },
          { documentNumber: documentId },
          ...(ObjectId.isValid(documentId) ? [{ _id: new ObjectId(documentId) }] : []),
        ],
      });
    } catch {
      // In-memory fallback
    }

    if (!doc) {
      doc = inMemoryBookingDocuments.get(documentId) || null;
      if (!doc) {
        for (const d of inMemoryBookingDocuments.values()) {
          if (d.documentNumber === documentId || d.documentId === documentId) {
            doc = d;
            break;
          }
        }
      }
    }

    if (!doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // 3. Prevent cross-booking document access
    if (doc.bookingId.toString() !== bookingId.toString()) {
      return NextResponse.json(
        { error: "Document does not belong to the requested booking" },
        { status: 403 }
      );
    }

    // 4. Authorize Access
    const authResult = await authorizeDocumentAccess(doc, authUser, guestToken, db);
    if (!authResult.authorized) {
      return NextResponse.json(
        {
          error: "Unauthorized access to document",
          reason: authResult.reason || "AUTH_REQUIRED",
        },
        { status: 403 }
      );
    }

    // 5. Retrieve PDF Buffer from GridFS
    const pdfBuffer = await getDocumentBufferFromGridFS(doc.gridFsFileId, db);

    const safeFilename = doc.filename || `Yatra-Expertz-${doc.documentNumber}.pdf`;

    // 6. Return Streaming PDF Response with Private Non-Cacheable Headers
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(safeFilename)}"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: any) {
    console.error("[Document Download API] Error:", error);
    return NextResponse.json(
      { error: "Failed to download document" },
      { status: 500 }
    );
  }
}
