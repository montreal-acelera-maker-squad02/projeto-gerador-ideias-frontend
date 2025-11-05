import { useEffect, useId, useState } from 'react'
import { THEMES } from '@/constants/themes'

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

type Option = { label: string; value: string }

export type FilterHistoryProps = {
  darkMode?: boolean
  fixed?: boolean
  categories?: Option[]
  value?: { category?: string; startDate?: string; endDate?: string }
  onChange?: (next: { category?: string; startDate?: string; endDate?: string }) => void
  onClear?: () => void
  className?: string
}

export default function FilterHistory({
  darkMode = false,
  fixed = false,
  categories = [{ label: 'Todas', value: '' }, ...THEMES],
  value,
  onChange,
  onClear,
  className = '',
}: FilterHistoryProps) {
  const categoryId = useId()
  const startId = useId()
  const endId = useId()

  // Estado interno para modo não-controlado (fallback)
  const [internalCategory, setInternalCategory] = useState<string>('')
  const [internalStart, setInternalStart] = useState<string>('')
  const [internalEnd, setInternalEnd] = useState<string>('')

  // Sincroniza quando componente é usado de forma controlada
  useEffect(() => {
    if (value) {
      setInternalCategory(value.category ?? '')
      setInternalStart(value.startDate ?? '')
      setInternalEnd(value.endDate ?? '')
    }
  }, [value?.category, value?.startDate, value?.endDate])

  const category = value ? (value.category ?? '') : internalCategory
  const startDate = value ? (value.startDate ?? '') : internalStart
  const endDate = value ? (value.endDate ?? '') : internalEnd

  const isDark = !!darkMode
  const containerCls = cn(
    fixed && 'fixed top-6 left-6 z-10',
    'fh-container',
    isDark ? 'fh-container-dark' : 'fh-container-light',
    className,
  )

  function patch(next: Partial<{ category: string; startDate: string; endDate: string }>) {
    const nextVal = {
      category: next.category ?? category,
      startDate: next.startDate ?? startDate,
      endDate: next.endDate ?? endDate,
    }
    if (!value) {
      if (next.category !== undefined) setInternalCategory(next.category)
      if (next.startDate !== undefined) setInternalStart(next.startDate)
      if (next.endDate !== undefined) setInternalEnd(next.endDate)
    }
    onChange?.(nextVal)
  }

  const handleClear = () => {
    onClear?.()
    if (!value) {
      setInternalCategory('')
      setInternalStart('')
      setInternalEnd('')
    }
    onChange?.({ category: '', startDate: '', endDate: '' })
  }

  return (
    <div className={containerCls}>
      {/* Header */}
      <div className="fh-header">
        <FilterIcon className={cn('fh-icon', isDark ? 'fh-icon-dark' : 'fh-icon-light')} />
        <h3 className={cn('fh-title', isDark ? 'fh-title-dark' : 'fh-title-light')}>Filtros</h3>
      </div>

      <div className="fh-sections">
        <CategoryField id={categoryId} value={category} options={categories} dark={isDark} onChange={(v) => patch({ category: v })} />
        <DateField id={startId} label="Data Início" value={startDate} dark={isDark} onChange={(v) => patch({ startDate: v })} />
        <DateField id={endId} label="Data Fim" value={endDate} dark={isDark} onChange={(v) => patch({ endDate: v })} />

        <button onClick={handleClear} className={cn('fh-button', isDark ? 'fh-button-dark' : 'fh-button-light')}>
          Limpar filtros
        </button>
      </div>
    </div>
  )
}

type CategoryFieldProps = { id: string; value: string; options: Option[]; dark: boolean; onChange: (v: string) => void }
function CategoryField({ id, value, options, dark, onChange }: CategoryFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={cn('fh-label', dark ? 'fh-label-dark' : 'fh-label-light')}>Categoria</label>
      <div className="relative">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={cn('fh-select', dark ? 'fh-select-dark' : 'fh-select-light')}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <svg aria-hidden viewBox="0 0 24 24" className={cn('fh-caret', dark ? 'fh-caret-dark' : 'fh-caret-light')}>
          <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
        </svg>
      </div>
    </div>
  )
}

type DateFieldProps = { id: string; label: string; value: string; dark: boolean; onChange: (v: string) => void }
function DateField({ id, label, value, dark, onChange }: DateFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={cn('fh-label', dark ? 'fh-label-dark' : 'fh-label-light')}>{label}</label>
      <div className="fh-date-wrapper">
        <CalendarIcon className={cn('fh-date-icon', dark ? 'fh-date-icon-dark' : 'fh-date-icon-light')} />
        <input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} className={cn('fh-input', dark ? 'fh-input-dark' : 'fh-input-light')} style={{ colorScheme: dark ? 'dark' : 'light' }} />
      </div>
    </div>
  )
}

function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-4 w-4", className)} aria-hidden>
      <path
        fill="currentColor"
        d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 1 1 2 0v1zm13 6H4v11h16z"
      />
    </svg>
  )
}

function FilterIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} aria-hidden>
      <path fill="currentColor" d="M3 5h18l-7 8v4l-4 2v-6L3 5z" />
    </svg>
  )
}






