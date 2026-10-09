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

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 15;
  const offset = (page - 1) * limit;

  let countResult;
  let booksResult;

  if (search) {
    countResult = await db.execute({
      sql: 'SELECT COUNT(*) as total FROM books WHERE title LIKE ?',
      args: [`%${search}%`],
    });
    booksResult = await db.execute({
      sql: 'SELECT * FROM books WHERE title LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?',
      args: [`%${search}%`, limit, offset],
    });
  } else {
    countResult = await db.execute('SELECT COUNT(*) as total FROM books');
    booksResult = await db.execute({
      sql: 'SELECT * FROM books ORDER BY id DESC LIMIT ? OFFSET ?',
      args: [limit, offset],
    });
  }

  const total = Number(countResult.rows[0]?.total || 0);
  const totalPages = Math.ceil(total / limit);

  return Response.json({
    books: booksResult.rows,
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
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      year INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  const body = await request.json();
  const { title, author, year } = body;

  if (!title || !author) {
    return Response.json({ error: 'Título y autor son requeridos' }, { status: 400 });
  }

  await db.execute({
    sql: 'INSERT INTO books (title, author, year) VALUES (?, ?, ?)',
    args: [title, author, year || null],
  });

  return Response.json({ ok: true });
}
