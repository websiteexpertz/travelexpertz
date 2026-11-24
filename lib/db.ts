import { MongoClient, MongoClientOptions, Db, GridFSBucket } from "mongodb";

const defaultDbName = process.env.MONGODB_DB || "travelexpertz";

const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 60000,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.startsWith("mock://") || uri === "mongodb://mock") {
    // Safe mock client in disconnected test environments
    return Promise.resolve({
      db: () => ({} as any),
      close: async () => {},
    } as any);
  }

  // Reuse global promise across hot-reloads in dev and warm lambda invocations in serverless
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch((err) => {
      // Clear cache on error so subsequent requests can retry
      global._mongoClientPromise = undefined;
      console.error("MongoDB connection error:", err);
      throw err;
    });
  }

  return global._mongoClientPromise;
}

const clientPromise = {
  then: <TResult1 = MongoClient, TResult2 = never>(
    onfulfilled?: ((value: MongoClient) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ) => getClientPromise().then(onfulfilled, onrejected),
  catch: <TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ) => getClientPromise().catch(onrejected),
  finally: (onfinally?: (() => void) | null) => getClientPromise().finally(onfinally),
} as Promise<MongoClient>;

export default clientPromise;

// Database helper
export async function getDb(databaseName: string = defaultDbName): Promise<Db> {
  try {
    const client = await getClientPromise();
    return client.db(databaseName);
  } catch (err) {
    console.error("Failed to acquire MongoDB client:", err);
    throw new Error(
      "Unable to connect to the database. Check MONGODB_URI and network."
    );
  }
}

// GridFS Bucket helper
export async function getGridFSBucket(
  bucketName: string = "uploads",
  databaseName: string = defaultDbName
): Promise<GridFSBucket> {
  const db = await getDb(databaseName);
  return new GridFSBucket(db, { bucketName });
}
