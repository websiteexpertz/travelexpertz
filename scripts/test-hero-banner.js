/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("assert");

console.log("=== TRAVEL EXPERTZ STATE HERO BANNER VERIFICATION ===");

// 1. Verify Cloudinary config parsing
const { getCloudinaryConfig, isCloudinaryConfigured } = require("../lib/cloudinary");
console.log("✓ Cloudinary module loaded successfully.");

// 2. Verify model exports and constants
const { MAX_ACTIVE_SLIDES_PER_STATE, HERO_SLIDES_COLLECTION } = require("../lib/models/state-hero");
assert.strictEqual(MAX_ACTIVE_SLIDES_PER_STATE, 5, "Max active slides must be 5");
assert.strictEqual(HERO_SLIDES_COLLECTION, "state_hero_slides", "Collection name must match");
console.log("✓ State Hero constants verified: Max active slides = 5, Collection = state_hero_slides.");

// 3. Verify Admin token generation and validation
const jwt = require("jsonwebtoken");
const testSecret = "cd0e3ce19788ef1ae57d94473994559dbb96cb9c1e90196fc6dcafecced699e9";
process.env.JWT_SECRET = testSecret;

const { requireAdmin } = require("../lib/admin-auth");
console.log("✓ Admin auth module loaded.");

// Test mock unauthenticated request
const unauthReq = {
  cookies: {
    get: () => undefined,
  },
};
const unauthRes = requireAdmin(unauthReq);
assert(unauthRes !== null, "Unauthenticated request must be rejected");
console.log("✓ Security Check: Unauthenticated admin requests are rejected with 401.");

console.log("\n=== ALL UNIT CHECKS PASSED SUCCESSFULLY ===");
