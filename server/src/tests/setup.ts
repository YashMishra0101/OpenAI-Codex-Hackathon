import { beforeAll, afterAll, afterEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { vi } from 'vitest';

// Mock argon2 to bypass native binding issues in tests and speed up auth tests
vi.mock('argon2', () => ({
  default: {
    hash: vi.fn(async (password: string) => `hashed_${password}`),
    verify: vi.fn(async (hash: string, password: string) => hash === `hashed_${password}`),
  }
}));

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Start the in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Set the environment variable to point to the in-memory DB
  env.MONGODB_URI = mongoUri;

  // Connect Mongoose to the in-memory DB
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Disconnect Mongoose and stop the in-memory DB
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  // Clear all collections after each test
  const collections = Object.values(mongoose.connection.collections);
  for (const collection of collections) {
    if (collection) {
      await collection.deleteMany({});
    }
  }
});
