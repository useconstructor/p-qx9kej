import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const sampleBooks = [
  { title: 'Cien años de soledad', author: 'Gabriel García Márquez', year: 1967 },
  { title: 'Don Quijote de la Mancha', author: 'Miguel de Cervantes', year: 1605 },
  { title: 'La sombra del viento', author: 'Carlos Ruiz Zafón', year: 2001 },
  { title: 'Rayuela', author: 'Julio Cortázar', year: 1963 },
  { title: 'El amor en los tiempos del cólera', author: 'Gabriel García Márquez', year: 1985 },
  { title: 'La casa de los espíritus', author: 'Isabel Allende', year: 1982 },
  { title: 'Pedro Páramo', author: 'Juan Rulfo', year: 1955 },
  { title: 'Ficciones', author: 'Jorge Luis Borges', year: 1944 },
  { title: 'El Aleph', author: 'Jorge Luis Borges', year: 1949 },
  { title: 'Los detectives salvajes', author: 'Roberto Bolaño', year: 1998 },
  { title: '2666', author: 'Roberto Bolaño', year: 2004 },
  { title: 'La ciudad y los perros', author: 'Mario Vargas Llosa', year: 1963 },
  { title: 'Conversación en La Catedral', author: 'Mario Vargas Llosa', year: 1969 },
  { title: 'La fiesta del chivo', author: 'Mario Vargas Llosa', year: 2000 },
  { title: 'Como agua para chocolate', author: 'Laura Esquivel', year: 1989 },
  { title: 'El laberinto de la soledad', author: 'Octavio Paz', year: 1950 },
  { title: 'Aura', author: 'Carlos Fuentes', year: 1962 },
  { title: 'La muerte de Artemio Cruz', author: 'Carlos Fuentes', year: 1962 },
  { title: 'El túnel', author: 'Ernesto Sabato', year: 1948 },
  { title: 'Sobre héroes y tumbas', author: 'Ernesto Sabato', year: 1961 },
  { title: 'El beso de la mujer araña', author: 'Manuel Puig', year: 1976 },
  { title: 'Santa Evita', author: 'Tomás Eloy Martínez', year: 1995 },
  { title: 'La invención de Morel', author: 'Adolfo Bioy Casares', year: 1940 },
  { title: 'El obsceno pájaro de la noche', author: 'José Donoso', year: 1970 },
  { title: 'Paradiso', author: 'José Lezama Lima', year: 1966 },
  { title: 'Tres tristes tigres', author: 'Guillermo Cabrera Infante', year: 1967 },
  { title: 'La vorágine', author: 'José Eustasio Rivera', year: 1924 },
  { title: 'María', author: 'Jorge Isaacs', year: 1867 },
  { title: 'Doña Bárbara', author: 'Rómulo Gallegos', year: 1929 },
  { title: 'Los ríos profundos', author: 'José María Arguedas', year: 1958 },
  { title: 'El señor Presidente', author: 'Miguel Ángel Asturias', year: 1946 },
  { title: 'Hombres de maíz', author: 'Miguel Ángel Asturias', year: 1949 },
  { title: 'El reino de este mundo', author: 'Alejo Carpentier', year: 1949 },
  { title: 'Los pasos perdidos', author: 'Alejo Carpentier', year: 1953 },
  { title: 'El siglo de las luces', author: 'Alejo Carpentier', year: 1962 },
  { title: 'Crónica de una muerte anunciada', author: 'Gabriel García Márquez', year: 1981 },
  { title: 'El coronel no tiene quien le escriba', author: 'Gabriel García Márquez', year: 1961 },
  { title: 'El otoño del patriarca', author: 'Gabriel García Márquez', year: 1975 },
  { title: 'Memorias de mis putas tristes', author: 'Gabriel García Márquez', year: 2004 },
  { title: 'La tregua', author: 'Mario Benedetti', year: 1960 },
  { title: 'Gracias por el fuego', author: 'Mario Benedetti', year: 1965 },
  { title: 'Primavera con una esquina rota', author: 'Mario Benedetti', year: 1982 },
  { title: 'El astillero', author: 'Juan Carlos Onetti', year: 1961 },
  { title: 'Juntacadáveres', author: 'Juan Carlos Onetti', year: 1964 },
  { title: 'La vida breve', author: 'Juan Carlos Onetti', year: 1950 },
  { title: 'Hijo de hombre', author: 'Augusto Roa Bastos', year: 1960 },
  { title: 'Yo el Supremo', author: 'Augusto Roa Bastos', year: 1974 },
  { title: 'La región más transparente', author: 'Carlos Fuentes', year: 1958 },
  { title: 'Terra Nostra', author: 'Carlos Fuentes', year: 1975 },
  { title: 'Gringo viejo', author: 'Carlos Fuentes', year: 1985 },
  { title: 'Paula', author: 'Isabel Allende', year: 1994 },
  { title: 'Eva Luna', author: 'Isabel Allende', year: 1987 },
  { title: 'Retrato en sepia', author: 'Isabel Allende', year: 2000 },
  { title: 'Inés del alma mía', author: 'Isabel Allende', year: 2006 },
  { title: 'El juego del ángel', author: 'Carlos Ruiz Zafón', year: 2008 },
  { title: 'El prisionero del cielo', author: 'Carlos Ruiz Zafón', year: 2011 },
  { title: 'El laberinto de los espíritus', author: 'Carlos Ruiz Zafón', year: 2016 },
  { title: 'Marina', author: 'Carlos Ruiz Zafón', year: 1999 },
  { title: 'Nocturno de Chile', author: 'Roberto Bolaño', year: 2000 },
  { title: 'Estrella distante', author: 'Roberto Bolaño', year: 1996 },
];

export async function POST() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      year INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  const { rows } = await db.execute('SELECT COUNT(*) as count FROM books');
  const count = Number(rows[0]?.count || 0);

  if (count > 0) {
    return Response.json({ message: 'La base de datos ya contiene libros', seeded: false });
  }

  for (const book of sampleBooks) {
    await db.execute({
      sql: 'INSERT INTO books (title, author, year) VALUES (?, ?, ?)',
      args: [book.title, book.author, book.year],
    });
  }

  return Response.json({ message: `Se agregaron ${sampleBooks.length} libros de ejemplo`, seeded: true });
}
