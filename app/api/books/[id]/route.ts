import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { title, author, year } = body;

  if (!title || !author) {
    return Response.json({ error: 'Título y autor son requeridos' }, { status: 400 });
  }

  await db.execute({
    sql: 'UPDATE books SET title = ?, author = ?, year = ? WHERE id = ?',
    args: [title, author, year || null, id],
  });

  const { rows } = await db.execute({
    sql: 'SELECT * FROM books WHERE id = ?',
    args: [id],
  });

  return Response.json(rows[0] ?? null);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db.execute({
    sql: 'DELETE FROM loans WHERE book_id = ?',
    args: [id],
  });

  await db.execute({
    sql: 'DELETE FROM books WHERE id = ?',
    args: [id],
  });

  return Response.json({ ok: true });
}
