import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 15;
  const offset = (page - 1) * limit;

  const countResult = await db.execute('SELECT COUNT(*) as total FROM loans');
  const total = Number(countResult.rows[0]?.total || 0);
  const totalPages = Math.ceil(total / limit);

  const { rows } = await db.execute({
    sql: `
      SELECT
        loans.id,
        loans.book_id,
        loans.borrower,
        loans.returned,
        loans.created_at,
        books.title as book_title,
        books.author as book_author
      FROM loans
      LEFT JOIN books ON loans.book_id = books.id
      ORDER BY loans.created_at DESC
      LIMIT ? OFFSET ?
    `,
    args: [limit, offset],
  });

  return Response.json({
    loans: rows,
    pagination: {
      page,
      totalPages,
      total,
      limit,
    },
  });
}

export async function POST(request: Request) {
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

  const body = await request.json();
  const { book_id, borrower, created_at } = body;

  if (!book_id || !borrower) {
    return Response.json({ error: 'Libro y prestatario son requeridos' }, { status: 400 });
  }

  await db.execute({
    sql: 'INSERT INTO loans (book_id, borrower, created_at) VALUES (?, ?, ?)',
    args: [book_id, borrower, created_at || new Date().toISOString().split('T')[0]],
  });

  return Response.json({ ok: true });
}
