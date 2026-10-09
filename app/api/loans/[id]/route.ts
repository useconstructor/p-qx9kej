import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { returned } = body;

  await db.execute({
    sql: 'UPDATE loans SET returned = ? WHERE id = ?',
    args: [returned ? 1 : 0, id],
  });

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
      WHERE loans.id = ?
    `,
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
    sql: 'DELETE FROM loans WHERE id = ?',
    args: [id],
  });

  return Response.json({ ok: true });
}
