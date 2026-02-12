import { ObjectId } from "mongodb";

export interface PropertyOwner {
  _id?: ObjectId;
  email: string; // Unique email for property owner
  password: string; // Hashed password
  businessName: string;
  ownerName: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  businessType: "hotel" | "homestay" | "both";
  role: "property_owner" | "manager";
  verified: boolean;
  active: boolean;
  approvedBy?: ObjectId; // Admin who approved
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyApprovalRequest {
  _id?: ObjectId;
  propertyId: ObjectId;
  ownerId: ObjectId;
  propertyType: "hotel" | "homestay";
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: ObjectId; // Admin who reviewed
  rejectionReason?: string;
  rejectionNotes?: string;
  approvalNotes?: string;
  updateHistory: Array<{
    date: Date;
    status: string;
    changedBy: ObjectId;
    notes: string;
  }>;
}
