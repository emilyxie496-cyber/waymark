import { useEffect, useId, useRef, useState } from 'react'
import { LEGAL_LINKS, PERSONAS, SIGNUP_PAGE } from '../data/content.js'
import { isValidEmail } from '../utils/validation.js'
import { Button, ErrorText, FieldLabel, Icon, Logo, inputBase, inputState } from './ui.jsx'

const EMPTY_FORM = { email: '', name: '', company: '', password: '', role: '' }
const FOOTER_LINKS = LEGAL_LINKS.filter((l) => ['terms', 'privacy', 'security'].includes(l.target))

function validate(form) {
  const errors = {}
  if (!isValidEmail(form.email)) errors.email = 'Enter a work email, e.g. name@company.ca.'
  if (!form.name.trim()) errors.name = 'Enter your full name.'
  if (!form.company.trim()) errors.company = 'Enter your company name.'
  if (form.password.length < 8) errors.password = 'Use at least 8 characters.'
  return errors
}

/** Full-page trial signup. Minimal header and footer to keep the focus on the form. */
export default function SignupPage({ onExit, onOpenDemo, onOpenDialog }) {
  const { trialDays, outcome, reassurance, afterTrial, referral } = SIGNUP_PAGE
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | done
  const headingRef = useRef(null)
  const timer = useRef(null)

  // Move focus to the page heading so screen readers announce the new view.
  // No scroll: on mobile the heading sits below the form, which should show first.
  useEffect(() => headingRef.current?.focus({ preventScroll: true }), [])
  useEffect(() => () => clearTimeout(timer.current), [])

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors(({ [field]: _removed, ...rest }) => rest)
  }

  const submit = (e) => {
    e.preventDefault()
    const errs = validate(form)
    setErrors(errs)
    const first = Object.keys(EMPTY_FORM).find((f) => errs[f])
    if (first) return document.querySelector(`[data-field="${first}"]`)?.focus()
    setStatus('submitting')
    // No backend yet: nothing is sent. The delay only shows the loading state.
    timer.current = setTimeout(() => setStatus('done'), 1200)
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <button type="button" onClick={onExit} className="rounded-lg" aria-label="Waymark home page">
            <Logo />
          </button>
        </div>
      </header>

      <main id="main" className="flex-1">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_28rem] lg:gap-14 lg:py-16">
          {/* Value + reassurance (second on mobile) */}
          <div className="order-2 lg:order-1">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-3xl font-extrabold tracking-tight text-balance text-slate-900 focus:outline-none sm:text-4xl"
            >
              Start your {trialDays}-day free trial
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-pretty text-slate-600">{outcome}</p>

            <ul className="mt-8 space-y-3">
              {reassurance.map((r) => (
                <li key={r.title} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Icon name={r.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{r.title}</p>
                    <p className="mt-0.5 text-sm text-slate-600">{r.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <section className="mt-6 rounded-xl border border-brand-200 bg-brand-50/60 p-5" aria-labelledby="after-trial">
              <h2 id="after-trial" className="font-semibold text-slate-900">
                What happens after day {trialDays}?
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {afterTrial.map((t) => (
                  <li key={t} className="flex gap-2">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" strokeWidth={2.4} />
                    {t}
                  </li>
                ))}
              </ul>
            </section>

            <ReferralBox {...referral} />
          </div>

          {/* Form (first on mobile) */}
          <div className="order-1 lg:order-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 sm:p-7 lg:sticky lg:top-8">
              {status === 'done' ? (
                <Done name={form.name} onOpenDemo={onOpenDemo} />
              ) : (
                <form onSubmit={submit} noValidate aria-labelledby="signup-title">
                  <h2 id="signup-title" className="text-xl font-bold text-slate-900">
                    Create your account
                  </h2>
                  <div className="mt-5 space-y-4">
                    <Field field="email" label="Work email" type="email" autoComplete="email" placeholder="name@company.ca" value={form.email} onChange={set('email')} error={errors.email} />
                    <Field field="name" label="Full name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
                    <Field field="company" label="Company name" autoComplete="organization" value={form.company} onChange={set('company')} error={errors.company} />
                    <Field field="password" label="Password" type="password" autoComplete="new-password" hint="At least 8 characters." value={form.password} onChange={set('password')} error={errors.password} />
                    <RoleSelect value={form.role} onChange={set('role')} />
                  </div>

                  <Button type="submit" size="lg" className="mt-6 w-full" disabled={status === 'submitting'} aria-busy={status === 'submitting'}>
                    {status === 'submitting' ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                        Starting your trial…
                      </>
                    ) : (
                      'Start free trial'
                    )}
                  </Button>
                  <p className="mt-3 text-center text-sm text-slate-600">No credit card. Cancel anytime.</p>
                  <p className="mt-1 text-center text-xs text-slate-500">
                    By signing up you agree to our{' '}
                    <LinkButton onClick={() => onOpenDialog('terms')}>Terms</LinkButton> and{' '}
                    <LinkButton onClick={() => onOpenDialog('privacy')}>Privacy Policy</LinkButton>.
                  </p>
                  <p className="mt-5 border-t border-slate-100 pt-4 text-center text-sm text-slate-600">
                    Already have an account? <LinkButton onClick={() => onOpenDialog('signIn')}>Sign in</LinkButton>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-sm text-slate-500 sm:px-6">
          <span>© 2026 Waymark.</span>
          <ul className="flex gap-4">
            {FOOTER_LINKS.map((l) => (
              <li key={l.target}>
                <button type="button" onClick={() => onOpenDialog(l.target)} className="hover:text-brand-800 hover:underline">
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  )
}

function Field({ field, label, hint, error, ...rest }) {
  const id = useId()
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined
  return (
    <div>
      <FieldLabel htmlFor={id} label={label} />
      <input
        id={id}
        data-field={field}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`${inputBase} ${inputState(error)}`}
        {...rest}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      )}
      <ErrorText id={`${id}-err`} error={error} />
    </div>
  )
}

function RoleSelect({ value, onChange }) {
  const id = useId()
  return (
    <div>
      <FieldLabel htmlFor={id} label="I'm a…" optional />
      <select id={id} value={value} onChange={onChange} className={`${inputBase} ${inputState()} ${value ? '' : 'text-slate-500'}`}>
        <option value="">Select your role</option>
        {PERSONAS.map((p) => (
          <option key={p.role} value={p.role}>
            {p.role}
          </option>
        ))}
      </select>
    </div>
  )
}

/** No referral system yet: the button copies the signup link (or shows it) so it can be shared. */
function ReferralBox({ title, text, cta }) {
  const [state, setState] = useState('idle') // idle | copied | manual
  const url = `${window.location.origin}${window.location.pathname}#signup`
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setState('copied')
    } catch {
      setState('manual') // clipboard blocked: show the link to copy by hand
    }
  }
  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="referral-title">
      <h2 id="referral-title" className="font-semibold text-slate-900">
        {title}
      </h2>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
      <div className="mt-4 flex items-center gap-3">
        <Button variant="secondary" onClick={copy}>
          <Icon name="user" className="h-4 w-4" /> {cta}
        </Button>
        <span role="status" className="text-sm font-medium text-brand-700">
          {state === 'copied' && 'Signup link copied. Paste it into an email or chat.'}
        </span>
      </div>
      {state === 'manual' && (
        <label className="mt-3 block text-sm text-slate-600">
          Copy this link and send it to a colleague:
          <input
            readOnly
            value={url}
            onFocus={(e) => e.target.select()}
            autoFocus
            className={`${inputBase} ${inputState()} text-sm`}
          />
        </label>
      )}
    </section>
  )
}

function LinkButton({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="font-medium text-brand-700 hover:text-brand-900 hover:underline">
      {children}
    </button>
  )
}

/** Shown after a valid submit. Accounts are not live, so say so plainly. */
function Done({ name, onOpenDemo }) {
  const first = name.trim().split(/\s+/)[0]
  return (
    <div role="status">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Icon name="check" className="h-6 w-6" strokeWidth={2.4} />
      </span>
      <h2 className="mt-4 text-xl font-bold text-slate-900">Thanks, {first}.</h2>
      <p className="mt-2 text-slate-600">
        Accounts are not live yet, so nothing was saved or sent. You can start the questionnaire now and see your first
        scenario.
      </p>
      <Button size="lg" className="mt-6 w-full" onClick={() => onOpenDemo('blank')}>
        Start the questionnaire <Icon name="arrowRight" className="h-4 w-4" />
      </Button>
    </div>
  )
}
