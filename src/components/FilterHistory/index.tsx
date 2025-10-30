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
        'fixed top-6 left-6 z-10',
        'fh-container',
        darkMode ? 'fh-container-dark' : 'fh-container-light',
        className,
      )}
    >
      {/* Header */}
      <div className="fh-header">
        <FilterIcon className={cn('fh-icon', darkMode ? 'fh-icon-dark' : 'fh-icon-light')} />
        <h3 className={cn('fh-title', darkMode ? 'fh-title-dark' : 'fh-title-light')}>Filtros</h3>
      </div>

      <div className="fh-sections">
        {/* Categoria */}
        <div>
          <label htmlFor={categoryId} className={cn('fh-label', darkMode ? 'fh-label-dark' : 'fh-label-light')}>
            Categoria
          </label>
          <div className="relative">
            <select
              id={categoryId}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={cn('fh-select', darkMode ? 'fh-select-dark' : 'fh-select-light')}
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
              className={cn('fh-caret', darkMode ? 'fh-caret-dark' : 'fh-caret-light')}
            >
              <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Data */}
        <div>
          <label htmlFor={dateId} className={cn('fh-label', darkMode ? 'fh-label-dark' : 'fh-label-light')}>
            Data
          </label>
          <div className="fh-date-wrapper">
            <CalendarIcon className={cn('fh-date-icon', darkMode ? 'fh-date-icon-dark' : 'fh-date-icon-light')} />
            <input
              id={dateId}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={cn('fh-input', darkMode ? 'fh-input-dark' : 'fh-input-light')}
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
          className={cn('fh-button', darkMode ? 'fh-button-dark' : 'fh-button-light')}
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
