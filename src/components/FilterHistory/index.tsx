import { useEffect, useId, useState } from 'react'

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

type Option = { label: string; value: string }

export type FilterHistoryProps = {
  darkMode?: boolean
  categories?: Option[]
  value?: { category?: string; date?: string }
  onChange?: (next: { category?: string; date?: string }) => void
  onClear?: () => void
  className?: string
}

export default function FilterHistory({
  darkMode = false,
  categories = [
    { label: 'Todas', value: '' },
    { label: 'Tecnologia', value: 'technology' },
    { label: 'Educação', value: 'education' },
    { label: 'Saúde', value: 'health' },
  ],
  value,
  onChange,
  onClear,
  className = '',
}: FilterHistoryProps) {
  const categoryId = useId()
  const dateId = useId()

  // Estado interno para modo não-controlado (fallback)
  const [internalCategory, setInternalCategory] = useState<string>('')
  const [internalDate, setInternalDate] = useState<string>('')

  // Sincroniza quando componente é usado de forma controlada
  useEffect(() => {
    if (value) {
      setInternalCategory(value.category ?? '')
      setInternalDate(value.date ?? '')
    }
  }, [value?.category, value?.date])

  const category = value ? (value.category ?? '') : internalCategory
  const date = value ? (value.date ?? '') : internalDate

  function setCategory(v: string) {
    if (!value) setInternalCategory(v)
    onChange?.({ category: v, date })
  }

  function setDate(v: string) {
    if (!value) setInternalDate(v)
    onChange?.({ category, date: v })
  }

  return (
    <div
      className={cn(
        // Fixa no canto superior esquerdo
        'fixed top-6 left-6 z-10',
        'p-6 rounded-2xl border flex-shrink-0',
        darkMode ? 'bg-slate-800 border-slate-700 shadow-xl' : 'bg-white border-gray-300 shadow-lg',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <FilterIcon className={cn('w-5 h-5', darkMode ? 'text-white' : 'text-gray-900')} />
        <h3 className={cn('font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>Filtros</h3>
      </div>

      <div className="space-y-4 min-w-[280px]">
        {/* Categoria */}
        <div>
          <label htmlFor={categoryId} className={cn('text-sm mb-2 block', darkMode ? 'text-gray-300' : 'text-gray-600')}>
            Categoria
          </label>
          <div className="relative">
            <select
              id={categoryId}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={cn(
                'w-full appearance-none rounded-lg border px-3 py-2 text-sm outline-none cursor-pointer',
                darkMode
                  ? 'bg-slate-900 border-slate-600 text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-900',
                'focus:ring-2 focus:ring-primary',
              )}
            >
              {categories.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {/* caret */}
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className={cn(
                'pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2',
                darkMode ? 'text-white' : 'text-gray-500',
              )}
            >
              <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Data */}
        <div>
          <label htmlFor={dateId} className={cn('text-sm mb-2 block', darkMode ? 'text-gray-300' : 'text-gray-600')}>
            Data
          </label>
          <div className="relative">
            <CalendarIcon className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none', darkMode ? 'text-gray-100' : 'text-gray-500')} />
            <input
              id={dateId}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-2 rounded-lg border outline-none text-sm',
                darkMode
                  ? 'bg-slate-900 border-slate-600 text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-900',
                'focus:ring-2 focus:ring-primary',
              )}
              style={{ colorScheme: darkMode ? 'dark' : 'light' }}
            />
          </div>
        </div>

        {/* Limpar filtros */}
        <button
          onClick={() => {
            onClear?.()
            if (!value) {
              setInternalCategory('')
              setInternalDate('')
            }
            onChange?.({ category: '', date: '' })
          }}
          className={cn(
            'w-full mt-4 px-4 py-2 rounded-lg font-medium transition-all border cursor-pointer',
            darkMode
              ? 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300',
          )}
        >
          Limpar filtros
        </button>
      </div>
    </div>
  )
}

{/* Icons */}
function CalendarIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-4 w-4', className)} aria-hidden>
      <path
        fill="currentColor"
        d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 1 1 2 0v1zm13 6H4v11h16z"
      />
    </svg>
  )
}

function FilterIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-5 w-5', className)} aria-hidden>
      <path fill="currentColor" d="M3 5h18l-7 8v4l-4 2v-6L3 5z" />
    </svg>
  )
}
