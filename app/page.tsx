'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Book,
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Menu,
  Library,
  Clock,
  CheckCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  RotateCcw,
  Database,
} from 'lucide-react'

interface BookType {
  id: number
  title: string
  author: string
  year: number | null
  created_at: string
}

interface LoanType {
  id: number
  book_id: number
  borrower: string
  returned: number
  created_at: string
  book_title: string
  book_author: string
}

interface Stats {
  totalBooks: number
  activeLoans: number
  pendingReturns: number
}

interface Pagination {
  page: number
  totalPages: number
  total: number
  limit: number
}

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'books' | 'loans'>('books')

  const [books, setBooks] = useState<BookType[]>([])
  const [booksPagination, setBooksPagination] = useState<Pagination>({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 15,
  })
  const [booksLoading, setBooksLoading] = useState(true)
  const [booksError, setBooksError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [loans, setLoans] = useState<LoanType[]>([])
  const [loansPagination, setLoansPagination] = useState<Pagination>({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 15,
  })
  const [loansLoading, setLoansLoading] = useState(true)
  const [loansError, setLoansError] = useState<string | null>(null)

  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    activeLoans: 0,
    pendingReturns: 0,
  })

  const [bookModalOpen, setBookModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<BookType | null>(null)
  const [bookForm, setBookForm] = useState({ title: '', author: '', year: '' })
  const [bookFormLoading, setBookFormLoading] = useState(false)

  const [loanModalOpen, setLoanModalOpen] = useState(false)
  const [loanForm, setLoanForm] = useState({ book_id: '', borrower: '', created_at: '' })
  const [loanFormLoading, setLoanFormLoading] = useState(false)
  const [bookSearchQuery, setBookSearchQuery] = useState('')
  const [bookSearchResults, setBookSearchResults] = useState<BookType[]>([])
  const [showBookDropdown, setShowBookDropdown] = useState(false)
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null)

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [bookToDelete, setBookToDelete] = useState<BookType | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [returnConfirmOpen, setReturnConfirmOpen] = useState(false)
  const [loanToReturn, setLoanToReturn] = useState<LoanType | null>(null)
  const [returnLoading, setReturnLoading] = useState(false)

  const [seedLoading, setSeedLoading] = useState(false)
  const [seedMessage, setSeedMessage] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      setStats(data)
    } catch {
      console.error('Error fetching stats')
    }
  }, [])

  const fetchBooks = useCallback(async (page = 1, search = '') => {
    setBooksLoading(true)
    setBooksError(null)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (search) params.set('search', search)
      const res = await fetch(`/api/books?${params}`)
      const data = await res.json()
      setBooks(data.books)
      setBooksPagination(data.pagination)
    } catch {
      setBooksError('Error al cargar los libros')
    } finally {
      setBooksLoading(false)
    }
  }, [])

  const fetchLoans = useCallback(async (page = 1) => {
    setLoansLoading(true)
    setLoansError(null)
    try {
      const res = await fetch(`/api/loans?page=${page}`)
      const data = await res.json()
      setLoans(data.loans)
      setLoansPagination(data.pagination)
    } catch {
      setLoansError('Error al cargar los préstamos')
    } finally {
      setLoansLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    fetchBooks()
    fetchLoans()
  }, [fetchStats, fetchBooks, fetchLoans])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchBooks(1, searchQuery)
  }

  const handleBookPageChange = (page: number) => {
    fetchBooks(page, searchQuery)
  }

  const handleLoanPageChange = (page: number) => {
    fetchLoans(page)
  }

  const openAddBookModal = () => {
    setEditingBook(null)
    setBookForm({ title: '', author: '', year: '' })
    setBookModalOpen(true)
  }

  const openEditBookModal = (book: BookType) => {
    setEditingBook(book)
    setBookForm({
      title: book.title,
      author: book.author,
      year: book.year?.toString() || '',
    })
    setBookModalOpen(true)
  }

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBookFormLoading(true)
    try {
      if (editingBook) {
        await fetch(`/api/books/${editingBook.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: bookForm.title,
            author: bookForm.author,
            year: bookForm.year ? parseInt(bookForm.year) : null,
          }),
        })
      } else {
        await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: bookForm.title,
            author: bookForm.author,
            year: bookForm.year ? parseInt(bookForm.year) : null,
          }),
        })
      }
      setBookModalOpen(false)
      fetchBooks(booksPagination.page, searchQuery)
      fetchStats()
    } catch {
      console.error('Error saving book')
    } finally {
      setBookFormLoading(false)
    }
  }

  const openDeleteConfirm = (book: BookType) => {
    setBookToDelete(book)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteBook = async () => {
    if (!bookToDelete) return
    setDeleteLoading(true)
    try {
      await fetch(`/api/books/${bookToDelete.id}`, { method: 'DELETE' })
      setDeleteConfirmOpen(false)
      setBookToDelete(null)
      fetchBooks(booksPagination.page, searchQuery)
      fetchStats()
      fetchLoans(loansPagination.page)
    } catch {
      console.error('Error deleting book')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSeedBooks = async () => {
    setSeedLoading(true)
    setSeedMessage(null)
    try {
      const res = await fetch('/api/books/seed', { method: 'POST' })
      const data = await res.json()
      setSeedMessage(data.message)
      if (data.seeded) {
        fetchBooks()
        fetchStats()
      }
    } catch {
      setSeedMessage('Error al cargar libros de ejemplo')
    } finally {
      setSeedLoading(false)
    }
  }

  const openAddLoanModal = () => {
    setLoanForm({ book_id: '', borrower: '', created_at: new Date().toISOString().split('T')[0] })
    setSelectedBook(null)
    setBookSearchQuery('')
    setBookSearchResults([])
    setLoanModalOpen(true)
  }

  const handleBookSearchForLoan = async (query: string) => {
    setBookSearchQuery(query)
    if (query.length < 2) {
      setBookSearchResults([])
      setShowBookDropdown(false)
      return
    }
    try {
      const res = await fetch(`/api/books?search=${encodeURIComponent(query)}`)
      const data = await res.json()
      setBookSearchResults(data.books.slice(0, 10))
      setShowBookDropdown(true)
    } catch {
      console.error('Error searching books')
    }
  }

  const selectBookForLoan = (book: BookType) => {
    setSelectedBook(book)
    setLoanForm({ ...loanForm, book_id: String(book.id) })
    setBookSearchQuery(book.title)
    setShowBookDropdown(false)
  }

  const handleLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loanForm.book_id || !loanForm.borrower) return
    setLoanFormLoading(true)
    try {
      await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: parseInt(loanForm.book_id),
          borrower: loanForm.borrower,
          created_at: loanForm.created_at,
        }),
      })
      setLoanModalOpen(false)
      fetchLoans(loansPagination.page)
      fetchStats()
    } catch {
      console.error('Error creating loan')
    } finally {
      setLoanFormLoading(false)
    }
  }

  const openReturnConfirm = (loan: LoanType) => {
    setLoanToReturn(loan)
    setReturnConfirmOpen(true)
  }

  const handleReturnLoan = async () => {
    if (!loanToReturn) return
    setReturnLoading(true)
    try {
      await fetch(`/api/loans/${loanToReturn.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returned: true }),
      })
      setReturnConfirmOpen(false)
      setLoanToReturn(null)
      fetchLoans(loansPagination.page)
      fetchStats()
    } catch {
      console.error('Error returning loan')
    } finally {
      setReturnLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const navItems = [
    { id: 'books' as const, label: 'Libros', icon: Book },
    { id: 'loans' as const, label: 'Préstamos', icon: Users },
  ]

  return (
    <div className="min-h-screen flex bg-[var(--color-background)]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-20 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col items-center py-4 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)] flex items-center justify-center mb-8">
          <Library className="w-5 h-5 text-white" />
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                setSidebarOpen(false)
              }}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                activeTab === item.id
                  ? 'bg-[var(--color-secondary)] text-[var(--color-primary)]'
                  : 'text-[var(--color-muted)] hover:bg-[var(--color-secondary)]'
              }`}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-[var(--color-secondary)] rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl lg:text-2xl font-semibold text-[var(--color-foreground)]">
                QA Biblioteca DB
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('books')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'books'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-secondary)] text-[var(--color-foreground)] hover:bg-[var(--color-border)]'
                }`}
              >
                Libros
              </button>
              <button
                onClick={() => setActiveTab('loans')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'loans'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-secondary)] text-[var(--color-foreground)] hover:bg-[var(--color-border)]'
                }`}
              >
                Préstamos
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-secondary)] flex items-center justify-center">
                  <Book className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-muted)]">Total Libros</p>
                  <p className="text-2xl font-semibold text-[var(--color-primary)]">
                    {stats.totalBooks}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[var(--color-warning)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-muted)]">Préstamos Activos</p>
                  <p className="text-2xl font-semibold text-[var(--color-warning)]">
                    {stats.activeLoans}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-[var(--color-warning)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-muted)]">Devoluciones Pendientes</p>
                  <p className="text-2xl font-semibold text-[var(--color-warning)]">
                    {stats.pendingReturns}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {activeTab === 'books' && (
            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
              <div className="p-4 border-b border-[var(--color-border)]">
                <div className="flex flex-col sm:flex-row gap-3">
                  <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                      <Input
                        type="text"
                        placeholder="Buscar por título..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Button type="submit" variant="outline">
                      Buscar
                    </Button>
                  </form>
                  <div className="flex gap-2">
                    <Button onClick={openAddBookModal} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Libro
                    </Button>
                    <Button
                      onClick={handleSeedBooks}
                      variant="outline"
                      disabled={seedLoading}
                      className="whitespace-nowrap"
                    >
                      {seedLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Database className="w-4 h-4 mr-2" />
                      )}
                      Cargar Ejemplo
                    </Button>
                  </div>
                </div>
                {seedMessage && (
                  <p className="mt-2 text-sm text-[var(--color-muted)]">{seedMessage}</p>
                )}
              </div>

              {booksLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--color-primary)]" />
                  <p className="mt-2 text-[var(--color-muted)]">Cargando libros...</p>
                </div>
              ) : booksError ? (
                <div className="p-8 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-[var(--color-destructive)]" />
                  <p className="mt-2 text-[var(--color-destructive)]">{booksError}</p>
                  <Button onClick={() => fetchBooks()} variant="outline" className="mt-4">
                    Reintentar
                  </Button>
                </div>
              ) : books.length === 0 ? (
                <div className="p-8 text-center">
                  <Book className="w-12 h-12 mx-auto text-[var(--color-muted)] opacity-50" />
                  <p className="mt-2 text-[var(--color-muted)]">
                    {searchQuery ? 'No se encontraron libros' : 'No hay libros en la biblioteca'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={handleSeedBooks} variant="outline" className="mt-4">
                      Cargar 60 libros de ejemplo
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[var(--color-surface-alt)]">
                          <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider w-16">
                            ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider">
                            Título
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider">
                            Autor
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider w-20">
                            Año
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider w-24">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {books.map((book, i) => (
                          <tr
                            key={book.id}
                            className={i % 2 === 0 ? 'bg-white' : 'bg-[var(--color-surface-alt)]'}
                          >
                            <td className="px-4 py-3 text-sm text-[var(--color-muted)]">
                              {book.id}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-[var(--color-foreground)]">
                              {book.title}
                            </td>
                            <td className="px-4 py-3 text-sm text-[var(--color-foreground)]">
                              {book.author}
                            </td>
                            <td className="px-4 py-3 text-sm text-[var(--color-muted)]">
                              {book.year || '-'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => openEditBookModal(book)}
                                  className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-primary)]"
                                  title="Editar"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openDeleteConfirm(book)}
                                  className="p-1.5 rounded hover:bg-red-50 text-[var(--color-destructive)]"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-[var(--color-muted)]">
                      Página {booksPagination.page} de {booksPagination.totalPages} ({booksPagination.total} libros)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBookPageChange(booksPagination.page - 1)}
                        disabled={booksPagination.page <= 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <select
                        value={booksPagination.page}
                        onChange={(e) => handleBookPageChange(parseInt(e.target.value))}
                        className="px-2 py-1 text-sm border border-[var(--color-border)] rounded bg-white"
                      >
                        {Array.from({ length: booksPagination.totalPages }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBookPageChange(booksPagination.page + 1)}
                        disabled={booksPagination.page >= booksPagination.totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'loans' && (
            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
              <div className="p-4 border-b border-[var(--color-border)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                  Préstamos de Libros
                </h2>
                <Button onClick={openAddLoanModal} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Préstamo
                </Button>
              </div>

              {loansLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--color-primary)]" />
                  <p className="mt-2 text-[var(--color-muted)]">Cargando préstamos...</p>
                </div>
              ) : loansError ? (
                <div className="p-8 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-[var(--color-destructive)]" />
                  <p className="mt-2 text-[var(--color-destructive)]">{loansError}</p>
                  <Button onClick={() => fetchLoans()} variant="outline" className="mt-4">
                    Reintentar
                  </Button>
                </div>
              ) : loans.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto text-[var(--color-muted)] opacity-50" />
                  <p className="mt-2 text-[var(--color-muted)]">No hay préstamos registrados</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[var(--color-surface-alt)]">
                          <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider w-16">
                            ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider">
                            Título del Libro
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider">
                            Prestatario
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider w-32">
                            Fecha
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider w-24">
                            Estado
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider w-24">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {loans.map((loan, i) => (
                          <tr
                            key={loan.id}
                            className={i % 2 === 0 ? 'bg-white' : 'bg-[var(--color-surface-alt)]'}
                          >
                            <td className="px-4 py-3 text-sm text-[var(--color-muted)]">
                              {loan.id}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-[var(--color-primary)]">
                              {loan.book_title || 'Libro eliminado'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-xs font-medium text-[var(--color-primary)]">
                                  {getInitials(loan.borrower)}
                                </div>
                                <span className="text-sm text-[var(--color-foreground)]">
                                  {loan.borrower}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-[var(--color-muted)]">
                              {(() => {
                                const [y, m, d] = loan.created_at.split('-').map(Number)
                                return new Date(y, m - 1, d).toLocaleDateString('es-ES')
                              })()}
                            </td>
                            <td className="px-4 py-3">
                              {loan.returned ? (
                                <Badge className="bg-green-100 text-[var(--color-success)] hover:bg-green-100">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Devuelto
                                </Badge>
                              ) : (
                                <button onClick={() => openReturnConfirm(loan)}>
                                  <Badge className="bg-orange-100 text-[var(--color-warning)] hover:bg-orange-200 cursor-pointer">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Activo
                                  </Badge>
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {!loan.returned && (
                                <button
                                  onClick={() => openReturnConfirm(loan)}
                                  className="p-1.5 rounded hover:bg-green-50 text-[var(--color-success)]"
                                  title="Marcar como devuelto"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-[var(--color-muted)]">
                      Página {loansPagination.page} de {loansPagination.totalPages} ({loansPagination.total} préstamos)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoanPageChange(loansPagination.page - 1)}
                        disabled={loansPagination.page <= 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <select
                        value={loansPagination.page}
                        onChange={(e) => handleLoanPageChange(parseInt(e.target.value))}
                        className="px-2 py-1 text-sm border border-[var(--color-border)] rounded bg-white"
                      >
                        {Array.from({ length: loansPagination.totalPages }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoanPageChange(loansPagination.page + 1)}
                        disabled={loansPagination.page >= loansPagination.totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {bookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setBookModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <button
              onClick={() => setBookModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-[var(--color-secondary)] rounded"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {editingBook ? 'Editar Libro' : 'Agregar Libro'}
            </h2>
            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Título <span className="text-[var(--color-destructive)]">*</span>
                </label>
                <Input
                  type="text"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  required
                  placeholder="Ej: Cien años de soledad"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Autor <span className="text-[var(--color-destructive)]">*</span>
                </label>
                <Input
                  type="text"
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  required
                  placeholder="Ej: Gabriel García Márquez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Año de publicación</label>
                <Input
                  type="number"
                  value={bookForm.year}
                  onChange={(e) => setBookForm({ ...bookForm, year: e.target.value })}
                  placeholder="Ej: 1967"
                  min="1000"
                  max={new Date().getFullYear()}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setBookModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white"
                  disabled={bookFormLoading}
                >
                  {bookFormLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingBook ? (
                    'Guardar'
                  ) : (
                    'Agregar'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setLoanModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <button
              onClick={() => setLoanModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-[var(--color-secondary)] rounded"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold mb-4">Agregar Préstamo</h2>
            <form onSubmit={handleLoanSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Libro <span className="text-[var(--color-destructive)]">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={bookSearchQuery}
                    onChange={(e) => handleBookSearchForLoan(e.target.value)}
                    onFocus={() => bookSearchResults.length > 0 && setShowBookDropdown(true)}
                    placeholder="Buscar libro por título..."
                    required={!selectedBook}
                  />
                  {showBookDropdown && bookSearchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-[var(--color-border)] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {bookSearchResults.map((book) => (
                        <button
                          key={book.id}
                          type="button"
                          onClick={() => selectBookForLoan(book)}
                          className="w-full px-3 py-2 text-left hover:bg-[var(--color-secondary)] text-sm"
                        >
                          <span className="font-medium">{book.title}</span>
                          <span className="text-[var(--color-muted)]"> - {book.author}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedBook && (
                  <p className="mt-1 text-xs text-[var(--color-success)]">
                    Seleccionado: {selectedBook.title}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Prestatario <span className="text-[var(--color-destructive)]">*</span>
                </label>
                <Input
                  type="text"
                  value={loanForm.borrower}
                  onChange={(e) => setLoanForm({ ...loanForm, borrower: e.target.value })}
                  required
                  placeholder="Nombre del prestatario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de préstamo</label>
                <Input
                  type="date"
                  value={loanForm.created_at}
                  onChange={(e) => setLoanForm({ ...loanForm, created_at: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setLoanModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white"
                  disabled={loanFormLoading || !selectedBook}
                >
                  {loanFormLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Agregar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmOpen && bookToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeleteConfirmOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-xl font-semibold mb-2">Eliminar Libro</h2>
            <p className="text-[var(--color-muted)] mb-4">
              ¿Estás seguro de que quieres eliminar &ldquo;{bookToDelete.title}&rdquo;? Esta acción
              también eliminará todos los préstamos asociados.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[var(--color-destructive)] hover:bg-[var(--color-destructive-hover)] text-white"
                onClick={handleDeleteBook}
                disabled={deleteLoading}
              >
                {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {returnConfirmOpen && loanToReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setReturnConfirmOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-xl font-semibold mb-2">Confirmar Devolución</h2>
            <p className="text-[var(--color-muted)] mb-4">
              ¿Confirmar que &ldquo;{loanToReturn.borrower}&rdquo; ha devuelto el libro &ldquo;
              {loanToReturn.book_title}&rdquo;?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setReturnConfirmOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[var(--color-success)] hover:opacity-90 text-white"
                onClick={handleReturnLoan}
                disabled={returnLoading}
              >
                {returnLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
