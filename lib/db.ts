import { MongoClient, MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "travelexpertz";

if (!uri) {
  // Fail fast with a clear message so developer knows to configure env
  throw new Error(
    "MONGODB_URI is not set. Please set it in your .env.local file.",
  );
}

const options: MongoClientOptions = {
  // Fail fast for server selection to make errors visible quickly during dev
  serverSelectionTimeoutMS: 10000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options as MongoClientOptions);
  global._mongoClientPromise = (async () => {
    try {
      await client.connect();
      return client;
    } catch (err) {
      // Log detailed error and rethrow so callers can handle it
      // eslint-disable-next-line no-console
      console.error("MongoDB connection error:", err);
      throw err;
    }
  })();
}

clientPromise = global._mongoClientPromise as Promise<MongoClient>;

export default clientPromise;

// Database helper
export async function getDb() {
  try {
    const client = await clientPromise;
    return client.db(dbName);
  } catch (err) {
    // Provide a clearer message upstream
    // eslint-disable-next-line no-console
    console.error("Failed to acquire MongoDB client:", err);
    throw new Error("Unable to connect to the database. Check MONGODB_URI and network.");
  }
}
