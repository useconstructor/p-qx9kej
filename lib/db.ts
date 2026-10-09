import { createClient, Client } from '@libsql/client';

let dbInstance: Client | null = null;

function getDb(): Client {
  if (!dbInstance) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) {
      throw new Error('TURSO_DATABASE_URL is not set');
    }
    dbInstance = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return dbInstance;
}

export const db = {
  execute: async (sql: string | { sql: string; args: unknown[] }) => {
    const client = getDb();
    return client.execute(sql);
  },
};
