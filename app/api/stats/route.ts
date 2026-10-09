import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      year INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      borrower TEXT NOT NULL,
      returned INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (book_id) REFERENCES books(id)
    )
  `);

  const booksResult = await db.execute('SELECT COUNT(*) as total FROM books');
  const activeLoansResult = await db.execute(
    'SELECT COUNT(*) as total FROM loans WHERE returned = 0'
  );
  const pendingReturnsResult = await db.execute(
    'SELECT COUNT(*) as total FROM loans WHERE returned = 0'
  );

  return Response.json({
    totalBooks: Number(booksResult.rows[0]?.total || 0),
    activeLoans: Number(activeLoansResult.rows[0]?.total || 0),
    pendingReturns: Number(pendingReturnsResult.rows[0]?.total || 0),
  });
}
