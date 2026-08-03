# Role-Based Access Control (RBAC) System Architecture

**Document Version:** 1.0  
**Date:** May 28, 2026  
**Status:** Architecture Overview (Ready for Implementation)

---

## Table of Contents

1. [Role Hierarchy](#role-hierarchy)
2. [Permission Matrix](#permission-matrix)
3. [Data Model Changes](#data-model-changes)
4. [Authentication Flow](#authentication-flow)
5. [Authorization Architecture](#authorization-architecture)
6. [Frontend Implementation](#frontend-implementation)
7. [API Endpoint Protection](#api-endpoint-protection)
8. [Implementation Roadmap](#implementation-roadmap)

---

## Role Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                      SUPER_ADMIN                            │
│  (Full system access, create admins, view analytics)        │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                      ADMIN                                  │
│  (Manage properties, approve/reject, manage users)          │
│  (Cannot create other admins)                              │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴──────────────┐
        │                           │
┌───────▼─────────────┐  ┌──────────▼──────────────┐
│  PROPERTY_OWNER     │  │  USER                  │
│  (Own properties)   │  │  (Browse & book)       │
│  (Manage bookings)  │  │  (View reviews)        │
└─────────────────────┘  └────────────────────────┘
```

### Role Definitions

| Role | Scope | Key Responsibilities |
|------|-------|----------------------|
| **SUPER_ADMIN** | System-wide | Create/manage ADMIN accounts, view system analytics, override decisions, manage roles, audit logs |
| **ADMIN** | Operational | Approve/reject properties, manage user accounts, handle booking disputes, moderate reviews, manage FAQs/services |
| **PROPERTY_OWNER** | Own properties | Create/edit properties, manage pricing, view bookings, manage availability, respond to inquiries |
| **USER** | Personal | Browse properties, make bookings, view profile, leave reviews, manage wishlist |

---

## Permission Matrix

### Feature Access by Role

| Feature | SUPER_ADMIN | ADMIN | PROPERTY_OWNER | USER |
|---------|:-----------:|:-----:|:--------------:|:----:|
| **Admin Dashboard** | ✅ Full | ✅ Limited | ❌ | ❌ |
| **User Management** | ✅ All | ✅ Search/View | ❌ | ❌ |
| **Admin Creation** | ✅ | ❌ | ❌ | ❌ |
| **Property Approval** | ✅ | ✅ | ❌ | ❌ |
| **View All Properties** | ✅ | ✅ | ❌ | ❌ |
| **Property Management** | ✅ | ✅ | ✅ Own Only | ❌ |
| **Booking Management** | ✅ All | ✅ Support | ✅ Own | ✅ Own |
| **Review Moderation** | ✅ | ✅ | ❌ | ✅ Own |
| **Analytics** | ✅ System | ✅ Basic | ✅ Own | ❌ |
| **FAQs/Services/Content** | ✅ | ✅ | ❌ | ❌ |
| **Testimonials** | ✅ | ✅ | ❌ | ❌ |
| **Browse Public** | ✅ | ✅ | ✅ | ✅ |

### Granular Permissions

```typescript
type Permission = 
  // User Management
  | "users:read"
  | "users:create"
  | "users:update"
  | "users:delete"
  | "users:manage_roles"
  
  // Property Management
  | "properties:read"
  | "properties:create"
  | "properties:update"
  | "properties:delete"
  | "properties:approve"
  | "properties:reject"
  | "properties:suspend"
  
  // Booking Management
  | "bookings:read"
  | "bookings:update"
  | "bookings:cancel"
  | "bookings:dispute"
  
  // Reviews & Testimonials
  | "reviews:read"
  | "reviews:moderate"
  | "reviews:delete"
  | "testimonials:manage"
  
  // Content Management
  | "content:manage_faqs"
  | "content:manage_services"
  | "content:manage_about"
  | "content:manage_whyus"
  
  // Analytics & Reporting
  | "analytics:view_system"
  | "analytics:view_own"
  | "logs:view_audit"
  
  // Admin Management
  | "admin:create"
  | "admin:manage_roles"
  | "admin:view_all_data"
```

### Role to Permissions Mapping

```typescript
const rolePermissions = {
  SUPER_ADMIN: [
    "users:read", "users:create", "users:update", "users:delete", "users:manage_roles",
    "properties:read", "properties:create", "properties:update", "properties:delete", 
    "properties:approve", "properties:reject", "properties:suspend",
    "bookings:read", "bookings:update", "bookings:cancel", "bookings:dispute",
    "reviews:read", "reviews:moderate", "reviews:delete",
    "testimonials:manage",
    "content:manage_faqs", "content:manage_services", "content:manage_about", "content:manage_whyus",
    "analytics:view_system", "analytics:view_own",
    "logs:view_audit",
    "admin:create", "admin:manage_roles", "admin:view_all_data"
  ],
  
  ADMIN: [
    "users:read", "users:update",
    "properties:read", "properties:approve", "properties:reject", "properties:suspend",
    "bookings:read", "bookings:update", "bookings:dispute",
    "reviews:read", "reviews:moderate", "reviews:delete",
    "testimonials:manage",
    "content:manage_faqs", "content:manage_services", "content:manage_about", "content:manage_whyus",
    "analytics:view_system",
    "logs:view_audit"
  ],
  
  PROPERTY_OWNER: [
    "properties:read", "properties:create", "properties:update",
    "bookings:read", "bookings:update", "bookings:cancel",
    "reviews:read",
    "analytics:view_own"
  ],
  
  USER: [
    "properties:read",
    "bookings:read", "bookings:create", "bookings:update", "bookings:cancel",
    "reviews:read", "reviews:create", "reviews:update",
    "analytics:view_own"
  ]
};
```

---

## Data Model Changes

### 1. Updated User Schema (MongoDB)

```javascript
// Collection: users
{
  _id: ObjectId,
  mobile: String,              // Unique
  password: String,            // Hashed
  mobileVerified: Boolean,
  isActive: Boolean,
  
  // RBAC Fields (NEW)
  role: {                       // Enum: "SUPER_ADMIN" | "ADMIN" | "USER"
    type: String,
    enum: ["SUPER_ADMIN", "ADMIN", "USER"],
    default: "USER"
  },
  permissions: [String],        // Array of permission strings
  
  // Audit Fields (NEW)
  createdBy?: ObjectId,        // Admin/SuperAdmin who created this account
  createdAt: Date,
  updatedAt: Date,
  lastLogin?: Date,
  
  // Admin Specific (NEW)
  adminMetadata?: {
    department?: String,
    title?: String,
    suspendedAt?: Date,
    suspensionReason?: String,
    approvedBy?: ObjectId,     // SUPER_ADMIN who approved
    approvedAt?: Date
  }
}
```

### 2. Updated PropertyOwner Schema (MongoDB)

```javascript
// Collection: propertyowners
{
  _id: ObjectId,
  email: String,               // Unique, Lowercase
  password: String,            // Hashed
  businessName: String,
  ownerName: String,
  phone: String,
  address?: String,
  city?: String,
  state?: String,
  businessType: String,        // "hotel" | "homestay" | "both"
  
  // RBAC Fields (NEW)
  role: {
    type: String,
    enum: ["PROPERTY_OWNER"],  // Future: "MANAGER"
    default: "PROPERTY_OWNER"
  },
  permissions: [String],       // Derived from role
  
  // Status & Approval (UPDATED)
  status: {                     // Replaces 'verified' + 'active'
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
    default: "PENDING"
  },
  verified: Boolean,           // Email verified
  active: Boolean,
  
  // Audit Trail (NEW)
  approvedBy?: ObjectId,       // Reference to admin user
  approvalDate?: Date,
  rejectionReason?: String,
  suspensionReason?: String,
  createdAt: Date,
  updatedAt: Date,
  lastLogin?: Date
}
```

### 3. Updated Property Schema (MongoDB)

```javascript
// Collections: hotels, homestays (apply to both)
{
  _id: ObjectId,
  ownerId: ObjectId,           // Reference to PropertyOwner
  
  // Existing fields...
  name: String,
  description: String,
  
  // Approval Status (NEW)
  approvalStatus: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
    default: "PENDING"
  },
  
  // Approval Workflow (NEW)
  approvalWorkflow?: {
    submittedAt: Date,
    submittedBy: ObjectId,     // Property owner
    approvedAt?: Date,
    approvedBy?: ObjectId,     // Admin/SuperAdmin
    rejectedAt?: Date,
    rejectedBy?: ObjectId,
    rejectionReason?: String,
    rejectionNotes?: String,
    
    // History of all approval state changes
    history: [{
      date: Date,
      previousStatus: String,
      newStatus: String,
      changedBy: ObjectId,      // User who made change
      notes?: String
    }]
  },
  
  // Visibility (NEW)
  isPublished: Boolean,        // Separate from approval (draft mode)
  createdAt: Date,
  updatedAt: Date
}
```

### 4. New Audit Log Collection (MongoDB)

```javascript
// Collection: audit_logs
{
  _id: ObjectId,
  userId: ObjectId,            // User who performed action
  userRole: String,
  
  action: String,              // "PROPERTY_APPROVED", "USER_CREATED", etc.
  resourceType: String,        // "property", "user", "booking", etc.
  resourceId: ObjectId,        // ID of affected resource
  
  changes?: {
    before: Object,
    after: Object
  },
  
  result: String,              // "SUCCESS" | "FAILED"
  errorMessage?: String,
  
  ipAddress?: String,
  userAgent?: String,
  timestamp: Date
}
```

---

## Authentication Flow

### 1. Unified JWT Payload Structure

All roles use this structure:

```typescript
interface JWTPayload {
  userId: string;           // MongoDB ObjectId as string
  email?: string;           // For admins & owners
  mobile?: string;          // For users
  role: "SUPER_ADMIN" | "ADMIN" | "USER" | "PROPERTY_OWNER";
  permissions: string[];    // Array of permission strings
  iat: number;              // Issued at
  exp: number;              // Expiration time
}

// Example
{
  userId: "507f1f77bcf86cd799439011",
  email: "admin@travelexpertz.com",
  role: "ADMIN",
  permissions: ["users:read", "properties:approve", "bookings:read"],
  iat: 1716950400,
  exp: 1716951300   // 15 minutes later
}
```

### 2. Login Endpoints (Updated)

All endpoints return JWT with role field:

```typescript
// POST /api/auth/login (User - OTP based)
Response: {
  message: "Login successful",
  accessToken: "eyJhbGc...",
  user: {
    userId: "...",
    role: "USER",
    mobile: "..."
  }
}

// POST /api/auth/admin/login (Admin)
Response: {
  message: "Login successful",
  accessToken: "eyJhbGc...",
  user: {
    userId: "...",
    role: "ADMIN",
    email: "admin@travelexpertz.com"
  }
}

// POST /api/owner/auth/login (Property Owner)
Response: {
  message: "Login successful",
  accessToken: "eyJhbGc...",
  user: {
    userId: "...",
    role: "PROPERTY_OWNER",
    email: "owner@hotel.com"
  }
}
```

### 3. Token Locations

| User Type | Cookie | Header |
|-----------|--------|--------|
| Admin | `accessToken` (httpOnly) | `Authorization: Bearer <token>` |
| PropertyOwner | `accessToken` (httpOnly) | `Authorization: Bearer <token>` |
| User | `accessToken` (httpOnly) | `Authorization: Bearer <token>` |

---

## Authorization Architecture

### 1. Middleware Layer (`lib/middleware/rbac.ts`)

```typescript
// lib/middleware/rbac.ts

export interface AuthRequest extends NextRequest {
  user?: JWTPayload;
}

export function createRBACMiddleware(requiredRoles?: string[]) {
  return async (request: AuthRequest) => {
    // 1. Extract token from cookie or header
    const token = request.cookies.get("accessToken")?.value ||
                  request.headers.get("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return { authenticated: false, error: "No token provided" };
    }
    
    // 2. Verify & decode token
    const payload = verifyAccessToken(token);
    if (!payload) {
      return { authenticated: false, error: "Invalid token" };
    }
    
    // 3. Check role if required
    if (requiredRoles && !requiredRoles.includes(payload.role)) {
      return { authenticated: true, authorized: false, error: "Insufficient permissions" };
    }
    
    // 4. Attach user to request
    request.user = payload;
    
    return { authenticated: true, authorized: true, user: payload };
  };
}

export function requireRole(...roles: string[]) {
  return createRBACMiddleware(roles);
}

export function requirePermission(...permissions: string[]) {
  return (request: AuthRequest) => {
    if (!request.user) return { authenticated: false };
    
    const hasPermission = permissions.some(
      perm => request.user!.permissions.includes(perm)
    );
    
    if (!hasPermission) {
      return { authenticated: true, authorized: false, error: "Missing required permission" };
    }
    
    return { authenticated: true, authorized: true };
  };
}
```

### 2. API Route Protection Pattern

```typescript
// Example: app/api/admin/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requireRole, requirePermission, verifyAccessToken } from "@/lib/middleware/rbac";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("accessToken")?.value;
    const payload = verifyAccessToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check role-based access
    if (!["SUPER_ADMIN", "ADMIN"].includes(payload.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }
    
    // Check permission-based access
    if (!payload.permissions.includes("users:read")) {
      return NextResponse.json(
        { error: "Missing permission: users:read" },
        { status: 403 }
      );
    }
    
    // Fetch users based on role
    if (payload.role === "SUPER_ADMIN") {
      // Return all users
      const users = await db.collection("users").find({}).toArray();
      return NextResponse.json(users);
    } else if (payload.role === "ADMIN") {
      // Return limited user data
      const users = await db.collection("users").find({ role: "USER" }).toArray();
      return NextResponse.json(users);
    }
    
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 3. Helper Functions (`lib/utils/rbac.ts`)

```typescript
// lib/utils/rbac.ts

export const rolePermissions: Record<string, string[]> = {
  SUPER_ADMIN: [
    "users:read", "users:create", "users:update", "users:delete", "users:manage_roles",
    "properties:read", "properties:create", "properties:update", "properties:delete",
    "properties:approve", "properties:reject", "properties:suspend",
    "bookings:read", "bookings:update", "bookings:cancel", "bookings:dispute",
    "reviews:read", "reviews:moderate", "reviews:delete",
    "testimonials:manage",
    "content:manage_faqs", "content:manage_services", "content:manage_about",
    "analytics:view_system", "logs:view_audit",
    "admin:create", "admin:manage_roles", "admin:view_all_data"
  ],
  ADMIN: [
    "users:read", "users:update",
    "properties:read", "properties:approve", "properties:reject", "properties:suspend",
    "bookings:read", "bookings:update", "bookings:dispute",
    "reviews:read", "reviews:moderate", "reviews:delete",
    "testimonials:manage",
    "content:manage_faqs", "content:manage_services", "content:manage_about",
    "analytics:view_system", "logs:view_audit"
  ],
  PROPERTY_OWNER: [
    "properties:read", "properties:create", "properties:update",
    "bookings:read", "bookings:update", "bookings:cancel",
    "reviews:read",
    "analytics:view_own"
  ],
  USER: [
    "properties:read",
    "bookings:read", "bookings:create", "bookings:update", "bookings:cancel",
    "reviews:read", "reviews:create", "reviews:update",
    "analytics:view_own"
  ]
};

export function getPermissionsForRole(role: string): string[] {
  return rolePermissions[role] || [];
}

export function canUserAccess(
  userRole: string,
  requiredPermission: string
): boolean {
  return getPermissionsForRole(userRole).includes(requiredPermission);
}

export function canUserAccessResource(
  userId: string,
  userRole: string,
  resourceOwnerId: string,
  requiredPermission: string
): boolean {
  // For own-resource operations, check if user owns the resource
  if (requiredPermission.includes("own")) {
    if (userId !== resourceOwnerId && userRole !== "SUPER_ADMIN") {
      return false;
    }
  }
  
  return canUserAccess(userRole, requiredPermission);
}
```

---

## Frontend Implementation

### 1. User Context (`src/context/AuthContext.tsx`)

```typescript
// src/context/AuthContext.tsx

import { createContext, useContext, useState, useEffect } from "react";

interface AuthUser {
  userId: string;
  role: "SUPER_ADMIN" | "ADMIN" | "USER" | "PROPERTY_OWNER";
  email?: string;
  mobile?: string;
  permissions: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Validate token on mount
    validateToken();
  }, []);
  
  const validateToken = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include"
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const hasRole = (role: string) => user?.role === role;
  const hasPermission = (permission: string) => 
    user?.permissions?.includes(permission) ?? false;
  const hasAnyRole = (roles: string[]) => 
    user ? roles.includes(user.role) : false;
  const hasAllPermissions = (permissions: string[]) =>
    permissions.every(perm => hasPermission(perm));
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        hasRole,
        hasPermission,
        hasAnyRole,
        hasAllPermissions
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

### 2. Route Protection Component

```typescript
// src/components/ProtectedRoute.tsx

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string | string[];
  requiredPermission?: string | string[];
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallback = <div>Access Denied</div>
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole, hasPermission } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return fallback;
  }
  
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequiredRole = roles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return fallback;
    }
  }
  
  if (requiredPermission) {
    const permissions = Array.isArray(requiredPermission) 
      ? requiredPermission 
      : [requiredPermission];
    const hasRequiredPermission = permissions.some(perm => hasPermission(perm));
    if (!hasRequiredPermission) {
      return fallback;
    }
  }
  
  return <>{children}</>;
}
```

### 3. Dynamic Navbar (Updated Header.tsx)

```typescript
// app/components/Header.tsx - Role-aware sections

import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user, hasRole } = useAuth();
  
  const adminLinks = [
    { label: "Dashboard", href: "/admin" },
    { label: "Properties", href: "/admin/properties" },
    { label: "Users", href: "/admin/users" }
  ];
  
  const ownerLinks = [
    { label: "Dashboard", href: "/owner" },
    { label: "My Properties", href: "/owner/properties" },
    { label: "Bookings", href: "/owner/bookings" }
  ];
  
  const userLinks = [
    { label: "Bookings", href: "/user/bookings" },
    { label: "Profile", href: "/user/profile" }
  ];
  
  const getNavLinks = () => {
    if (hasRole("SUPER_ADMIN") || hasRole("ADMIN")) return adminLinks;
    if (hasRole("PROPERTY_OWNER")) return ownerLinks;
    if (hasRole("USER")) return userLinks;
    return [];
  };
  
  return (
    <header>
      <nav>
        {getNavLinks().map(link => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
```

### 4. Role-Based Admin Dashboard

```typescript
// app/admin/page.tsx - Different views per admin level

"use client";

import { useAuth } from "@/context/AuthContext";
import SuperAdminDashboard from "./SuperAdminDashboard";
import AdminDashboard from "./AdminDashboard";

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  
  if (hasRole("SUPER_ADMIN")) {
    return <SuperAdminDashboard />;
  }
  
  if (hasRole("ADMIN")) {
    return <AdminDashboard />;
  }
  
  return <div>Access Denied</div>;
}
```

---

## API Endpoint Protection

### Pattern: Protected API Routes

```typescript
// Template for all protected API routes

import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { getPermissionsForRole } from "@/lib/utils/rbac";
import { getDatabase } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // 1. Extract & verify token
    const token = request.cookies.get("accessToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    
    // 2. Check required permission
    const requiredPermission = "resource:read"; // Change per endpoint
    if (!payload.permissions.includes(requiredPermission)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // 3. Get database and fetch data
    const db = await getDatabase();
    const data = await db.collection("resources").find({}).toArray();
    
    // 4. Log audit trail
    await db.collection("audit_logs").insertOne({
      userId: payload.userId,
      userRole: payload.role,
      action: "RESOURCE_VIEWED",
      resourceType: "resource",
      result: "SUCCESS",
      timestamp: new Date()
    });
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Protected Routes Map

| Route | Method | Required Permission | Current Status |
|-------|--------|----------------------|-----------------|
| `/api/admin/users` | GET | `users:read` | **NEW** |
| `/api/admin/users` | POST | `users:create` | **NEW** |
| `/api/admin/users/[id]` | PUT | `users:update` | **NEW** |
| `/api/admin/properties` | GET | `properties:read` | **UPDATE** |
| `/api/admin/properties/[id]/approve` | POST | `properties:approve` | **NEW** |
| `/api/admin/properties/[id]/reject` | POST | `properties:reject` | **NEW** |
| `/api/owner/properties` | POST | `properties:create` | **NEW** |
| `/api/bookings` | GET | `bookings:read` | **UPDATE** |
| `/api/reviews` | GET | `reviews:read` | **UPDATE** |
| `/api/reviews/[id]/moderate` | PATCH | `reviews:moderate` | **NEW** |

---

## Implementation Roadmap

### Phase 1: Unified Authentication (Week 1)

**Objectives:**
- Standardize JWT structure across all login endpoints
- Create unified auth middleware
- Update token generation

**Tasks:**
1. Update `lib/jwt.ts` to include role field in payload
2. Create `lib/middleware/rbac.ts` with auth helpers
3. Update `/api/auth/login` to include role field
4. Update `/api/owner/auth/login` to include role field
5. Update `/api/auth/admin/login` to include role field
6. Test: All login endpoints return role in JWT

**Files to Create/Update:**
- `lib/jwt.ts` - Add role to JWTPayload interface
- `lib/middleware/rbac.ts` - NEW
- `lib/utils/rbac.ts` - NEW (role permissions matrix)
- `app/api/auth/login/route.ts` - Update
- `app/api/owner/auth/login/route.ts` - Update
- `middleware.ts` - Update to use unified auth

### Phase 2: Database Schema Updates (Week 1-2)

**Objectives:**
- Add role fields to collections
- Add audit logging capability
- Migrate existing data

**Tasks:**
1. Add role & permission fields to User collection
2. Add approval workflow to PropertyOwner collection
3. Add approval status to properties (hotels, homestays)
4. Create audit_logs collection
5. Migrate existing data (users get "USER", admin gets "ADMIN", owners get "PROPERTY_OWNER")

**Files to Create/Update:**
- `lib/models/User.ts` - Add role, permissions, adminMetadata
- `lib/models/PropertyOwner.ts` - Add status, approvalWorkflow
- `lib/models/Property.ts` - NEW (shared schema for hotels/homestays)
- `lib/models/AuditLog.ts` - NEW
- `scripts/migrate-rbac.js` - NEW (data migration script)

### Phase 3: Backend RBAC Protection (Week 2)

**Objectives:**
- Protect all API endpoints with role/permission checks
- Implement audit logging
- Prevent unauthorized access

**Tasks:**
1. Update all existing API routes to check role/permissions
2. Create new approval workflow endpoints
3. Implement audit logging on all operations
4. Create role validation middleware
5. Test: All endpoints properly reject unauthorized requests

**Files to Update:**
- `app/api/admin/*` - Add permission checks
- `app/api/owner/*` - Add permission checks
- `app/api/hotels/*` - Add approval logic
- `app/api/homestays/*` - Add approval logic
- `app/api/users/*` - Add role-based filtering
- All API routes - Add audit logging

### Phase 4: Frontend RBAC Protection (Week 3)

**Objectives:**
- Implement role-based UI hiding
- Create role-aware route protection
- Update navigation based on role

**Tasks:**
1. Create `src/context/AuthContext.tsx` with role checks
2. Create `src/components/ProtectedRoute.tsx`
3. Update `app/components/Header.tsx` for role-aware navigation
4. Update `app/admin/components/AdminSidebar.tsx` for role filtering
5. Create `app/admin/SuperAdminDashboard.tsx`
6. Create `app/admin/AdminDashboard.tsx`
7. Update `app/owner/*` pages for property owner view
8. Create user dashboard pages

**Files to Create/Update:**
- `src/context/AuthContext.tsx` - NEW
- `src/components/ProtectedRoute.tsx` - NEW
- `src/hooks/useAuth.ts` - NEW
- `app/components/Header.tsx` - Update
- `app/admin/components/AdminSidebar.tsx` - Update
- `app/admin/page.tsx` - Update with role views
- `app/admin/SuperAdminDashboard.tsx` - NEW
- `app/admin/AdminDashboard.tsx` - NEW
- `app/admin/users/page.tsx` - Create new
- `app/admin/create-admin/page.tsx` - NEW (SUPER_ADMIN only)

### Phase 5: Admin Management UI (Week 3-4)

**Objectives:**
- Create interfaces for admin creation/role management
- Implement approval workflow UI
- Add property approval interface

**Tasks:**
1. Create `/admin/create-admin` page (SUPER_ADMIN only)
2. Create `/admin/manage-admins` page
3. Create `/admin/property-approvals` page with approval workflow
4. Create role badge/indicator components
5. Add status indicators for property approval states
6. Create approval notification system

**Files to Create:**
- `app/admin/create-admin/page.tsx` - NEW
- `app/admin/manage-admins/page.tsx` - NEW (update existing)
- `app/admin/property-approvals/page.tsx` - NEW (update existing)
- `app/components/RoleBadge.tsx` - NEW
- `app/components/ApprovalStatus.tsx` - NEW

### Phase 6: Testing & Validation (Week 4)

**Objectives:**
- Test all role access patterns
- Verify security boundaries
- Performance testing

**Tasks:**
1. Unit test: Permission checking functions
2. Integration test: API endpoint protection
3. E2E test: Role-based access flows
4. Security test: Privilege escalation attempts
5. Performance test: Auth middleware overhead
6. Document: Testing procedures for each role

**Files:**
- `__tests__/rbac.test.ts`
- `__tests__/api-protection.test.ts`
- `__tests__/e2e-rbac.test.ts`

---

## Security Considerations

### 1. Server-Side Validation (CRITICAL)

✅ **DO:**
- Validate role on every API call
- Verify JWT signature before trusting claims
- Check permissions in middleware AND in endpoint handlers
- Audit all role-changing operations
- Require re-authentication for sensitive operations

❌ **DON'T:**
- Trust client-side role checks for security
- Hide UI without server-side validation
- Skip permission validation for "trusted" clients
- Store unencrypted role in localStorage
- Allow role changes without authentication

### 2. Token Security

- Use httpOnly cookies (cannot be accessed via JavaScript)
- Set Secure flag (HTTPS only in production)
- Set SameSite=Strict (prevent CSRF)
- 15-minute access token expiry (force re-authentication)
- 7-day refresh token expiry (if refresh tokens used)

### 3. Privilege Escalation Prevention

- SUPER_ADMIN can create ADMIN
- ADMIN cannot create other admins
- ADMIN cannot escalate users to ADMIN
- ADMIN cannot view/modify SUPER_ADMIN data
- Property owners can only access own properties
- Users can only access own bookings

### 4. Audit Trail

- Log every role-based action
- Log failed authentication attempts
- Log permission denials
- Log admin/user creation
- Keep audit logs for 90+ days
- Include: user ID, action, resource, timestamp, IP, result

---

## Error Handling

### Standard Error Responses

```typescript
// 401 Unauthorized - No valid token
{
  error: "Unauthorized",
  code: "NO_TOKEN",
  message: "Authentication required"
}

// 403 Forbidden - Insufficient permissions
{
  error: "Forbidden",
  code: "INSUFFICIENT_PERMISSIONS",
  message: "You do not have permission to access this resource",
  required: ["properties:approve"],
  available: ["properties:read"]
}

// 403 Forbidden - Insufficient role
{
  error: "Forbidden",
  code: "INSUFFICIENT_ROLE",
  message: "This action requires SUPER_ADMIN role",
  required: "SUPER_ADMIN",
  current: "ADMIN"
}
```

---

## Migration Strategy

### Step 1: Add Role Fields (Non-Breaking)
- Add role field with default values to existing collections
- All existing users get "USER" role
- All existing admins get "ADMIN" role
- All existing owners get "PROPERTY_OWNER" role

### Step 2: Update Login Logic
- Gradually update login endpoints to include role
- Keep backward compatibility (role is optional in response)

### Step 3: Activate Permission Checking
- Enable permission validation in middleware
- Log permission denials (don't fail yet)
- Monitor logs for issues

### Step 4: Enforce Strict Mode
- Begin enforcing permission checks on non-critical APIs first
- Gradually roll out to critical endpoints
- Have rollback plan ready

### Step 5: Frontend Updates
- Update UI components as backend is ready
- Phase UI updates with backend rollout

---

## Testing Checklist

- [ ] SUPER_ADMIN can create ADMIN accounts
- [ ] ADMIN cannot create other ADMINs
- [ ] ADMIN cannot access SUPER_ADMIN-only features
- [ ] PROPERTY_OWNER can create properties
- [ ] PROPERTY_OWNER can only edit own properties
- [ ] Properties require approval before publishing
- [ ] USER can browse public properties
- [ ] USER cannot approve properties
- [ ] Role-based API endpoints return 403 for unauthorized roles
- [ ] Permissions are correctly validated on all endpoints
- [ ] Audit logs record all important actions
- [ ] JWT token includes role field
- [ ] Token expiration is enforced
- [ ] Privilege escalation is prevented
- [ ] Cross-role access is blocked
- [ ] Performance impact is minimal (<50ms overhead)

---

## Deployment Notes

### Environment Variables

```env
# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Admin Credentials (initial setup only)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure-password-here
ADMIN_EMAIL=admin@travelexpertz.com

# Database
MONGODB_URI=mongodb+srv://...
MONGODB_DB=travelexpertz

# Node
NODE_ENV=production
```

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Audit logs configured and tested
- [ ] Backup of production database created
- [ ] Rollback procedure documented
- [ ] Admin accounts created for SUPER_ADMIN role
- [ ] Permission matrix reviewed
- [ ] Security boundaries validated
- [ ] Performance tested under load
- [ ] Error handling tested
- [ ] Monitoring alerts configured

---

## Maintenance & Monitoring

### Key Metrics to Track

- Failed authentication attempts
- Permission denials per role
- API endpoint performance (with auth overhead)
- Audit log growth rate
- Token refresh rate
- Admin action frequency

### Regular Maintenance Tasks

- **Weekly**: Review security audit logs for suspicious patterns
- **Monthly**: Validate permission matrix matches business rules
- **Quarterly**: Review token expiry settings and rotate secrets
- **Annually**: Full security audit of RBAC system

---

## Future Enhancements

1. **Multi-Factor Authentication (MFA)** for admin accounts
2. **Role Delegation** - Temporary role elevation with time limits
3. **Fine-Grained Permissions** - Resource-level access control
4. **Role-Based API Rate Limiting** - Different limits per role
5. **Permission Inheritance** - Child roles inherit parent permissions
6. **Dynamic Permissions** - Permissions based on user attributes
7. **Temporal Access** - Time-based role activation
8. **Geo-Restricted Access** - IP-based authorization
9. **Single Sign-On (SSO)** integration
10. **Role Analytics** - Dashboard showing role usage patterns

---

## Summary

This RBAC architecture provides:

✅ Clear role hierarchy (SUPER_ADMIN > ADMIN > PROPERTY_OWNER > USER)
✅ Granular permission model (23+ specific permissions)
✅ Unified JWT structure across all user types
✅ Server-side authorization on all endpoints
✅ Audit trail for compliance
✅ Frontend role-aware UI
✅ Security best practices built-in
✅ Scalable design for future enhancements
✅ Non-breaking migration path
✅ Comprehensive testing strategy

**Ready for implementation in Phase 1 (Week 1)**
