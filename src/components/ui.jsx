// Small shared UI pieces: icons, buttons, badges, logo, section headings, form fields.

const ICONS = {
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  arrowLeft: 'M19 12H5M11 18l-6-6 6-6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  chevronDown: 'M6 9l6 6 6-6',
  alert: 'M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  info: 'M12 16v-4M12 8h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  tag: 'M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8ZM7.5 7.5h.01',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  ship: 'M2 20c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0M4 18l-1-5h18l-2 5M6 13V8h12v5M12 4v4',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18',
  printer: 'M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z',
  refresh: 'M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5',
  sparkles: 'M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3ZM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z',
  layers: 'M12 3 2 8l10 5 10-5-10-5ZM2 13l10 5 10-5M2 17.5l10 5 10-5',
  user: 'M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  card: 'M3 6h18v12H3zM3 10h18M7 15h4',
}

export function Icon({ name, className = 'h-5 w-5', strokeWidth = 1.8 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  )
}

const BUTTON_VARIANTS = {
  primary:
    'bg-brand-700 text-white shadow-sm shadow-brand-900/10 hover:bg-brand-800 active:bg-brand-900 disabled:bg-slate-300 disabled:shadow-none',
  secondary: 'bg-white text-slate-800 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 hover:ring-slate-400',
  ghost: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
  soft: 'bg-brand-50 text-brand-800 hover:bg-brand-100',
}
const BUTTON_SIZES = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2',
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-lg font-semibold whitespace-nowrap transition-colors duration-150 disabled:cursor-not-allowed ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

const BADGE_TONES = {
  brand: 'bg-brand-50 text-brand-800 ring-brand-200',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  emerald: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  sky: 'bg-sky-50 text-sky-800 ring-sky-200',
  rose: 'bg-rose-50 text-rose-800 ring-rose-200',
}

export function Badge({ tone = 'brand', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${BADGE_TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <rect width="32" height="32" rx="8" className="fill-brand-700" />
        <path d="M16 6c-4.4 0-8 3.4-8 7.7 0 5.6 8 12.3 8 12.3s8-6.7 8-12.3C24 9.4 20.4 6 16 6Z" fill="#fff" />
        <path
          d="m12.5 13.5 2.5 2.5 4.5-4.5"
          className="stroke-brand-700"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-xl font-extrabold tracking-tight text-slate-900">Waymark</span>
    </span>
  )
}

export function SectionHeading({ eyebrow, title, children, center = false, id }) {
  return (
    <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <p className="text-sm font-semibold tracking-wide text-brand-700 uppercase">{eyebrow}</p>}
      <h2 id={id} className="mt-2 text-3xl font-bold tracking-tight text-balance text-slate-900 sm:text-4xl">
        {title}
      </h2>
      {children && <p className="mt-4 text-lg text-pretty text-slate-600">{children}</p>}
    </div>
  )
}

/** Level chip for rule-based indicators. */
export function LevelChip({ level }) {
  const map = {
    review: { tone: 'rose', label: 'Review' },
    watch: { tone: 'amber', label: 'Watch' },
    ok: { tone: 'emerald', label: 'OK' },
  }
  const { tone, label } = map[level] ?? map.ok
  return <Badge tone={tone}>{label}</Badge>
}

// ---------- Form fields ----------

export const inputBase =
  'mt-1.5 h-11 w-full rounded-lg border bg-white px-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2'
export const inputState = (error) =>
  error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:border-brand-600 focus:ring-brand-200'

export function FieldLabel({ htmlFor, label, optional, as: Tag = 'label' }) {
  return (
    <Tag htmlFor={htmlFor} className="text-sm font-semibold text-slate-800">
      {label} {optional && <span className="font-normal text-slate-500">(optional)</span>}
    </Tag>
  )
}

export function ErrorText({ id, error }) {
  if (!error) return null
  return (
    <p id={id} className="mt-1.5 text-sm text-rose-700">
      {error}
    </p>
  )
}
