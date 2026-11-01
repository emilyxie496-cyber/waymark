/*
  Landing-page copy. Edit text here without touching component markup.
  Keep claims honest: this is a hackathon prototype using illustrative data.
*/

// type: 'link' scrolls to a section; 'dialog' opens an info dialog by key;
// 'page' opens a full page view (see App.jsx).
export const NAV_LINKS = [
  { label: 'Company', type: 'page', target: 'company' },
  { label: 'Customer', type: 'page', target: 'customer' },
  { label: 'Tariffs', type: 'page', target: 'tariffs' },
  { label: 'Products', type: 'link', target: '#product-classification' },
  { label: 'Platform API', type: 'dialog', target: 'platformApi', planned: true },
]

export const PERSONAS = [
  {
    initials: 'OW',
    role: 'Owner / founder',
    question: 'Is our margin at risk if freight costs jump again?',
    needs: 'A plain-language view of total exposure and which response is worth discussing first.',
    tone: 'bg-brand-100 text-brand-800',
  },
  {
    initials: 'PM',
    role: 'Procurement manager',
    question: 'Which supplier dependency should we reduce first?',
    needs: 'Supplier and region concentration, plus what a switch might cost and how long it takes.',
    tone: 'bg-sky-100 text-sky-800',
  },
  {
    initials: 'OL',
    role: 'Operations lead',
    question: 'How many days of stock do we really have if a shipment slips?',
    needs: 'Lead times, inventory cover and the gap a delay could open.',
    tone: 'bg-emerald-100 text-emerald-800',
  },
  {
    initials: 'FM',
    role: 'Finance manager',
    question: 'What does each option cost, and what assumptions sit behind it?',
    needs: 'Comparable cost estimates over the same period, with every formula visible.',
    tone: 'bg-amber-100 text-amber-800',
  },
]

export const FAQS = [
  {
    q: 'What is Waymark?',
    a: 'Waymark helps Canadian importing SMEs build a preliminary profile of their supply chain and compare illustrative responses to disruptions such as freight-cost increases, supplier delays or a hypothetical tariff change.',
  },
  {
    q: 'How can AI support trade planning?',
    a: 'The intended role of AI is to help organize scattered inputs, ask useful follow-up questions and explain scenarios in plain language. This local demo uses mock information and transparent, rule-based calculations — no live AI service is connected.',
  },
  {
    q: 'Does it replace our ERP or planning system?',
    a: 'No. The prototype is a standalone demonstration. Integrations with ERP, WMS or logistics systems are future possibilities, not current features.',
  },
  {
    q: 'Are classification suggestions and tariff results verified?',
    a: 'No. Sample codes, rates and results are illustrative and must be verified — for example with a licensed customs broker or official CBSA guidance — before business use. The demo does not certify compliance.',
  },
  {
    q: 'What happens when business assumptions change?',
    a: 'You can edit the questionnaire answers and scenario inputs at any time, and the profile, scenario results and strategy comparison recalculate from the same inputs.',
  },
  {
    q: 'What happens on a discovery call?',
    a: 'A discovery call would be a conversation about how you plan today, your main pain points and a possible first use case. This demo does not schedule calls or collect contact details.',
  },
]

export const FOOTER_GROUPS = [
  {
    title: 'Product',
    links: [
      { label: 'Tariffs', type: 'page', target: 'tariffs' },
      { label: 'Products', type: 'link', target: '#product-classification' },
      { label: 'Compliance Monitoring', type: 'link', target: '#compliance-monitoring' },
      { label: 'Interactive demo', type: 'demo', target: 'sample' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'For Importers', type: 'link', target: '#audience' },
      { label: 'For Exporters (roadmap)', type: 'link', target: '#audience' },
    ],
  },
  {
    title: 'Pricing',
    links: [{ label: 'Free trial', type: 'dialog', target: 'pricing' }],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Waymark', type: 'page', target: 'company' },
      { label: 'Discovery call', type: 'dialog', target: 'discovery' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Common questions', type: 'link', target: '#faq' },
      { label: 'Newsletter', type: 'link', target: '#newsletter' },
    ],
  },
]

export const LEGAL_LINKS = [
  { label: 'Terms', target: 'terms' },
  { label: 'Privacy Policy', target: 'privacy' },
  { label: 'Security', target: 'security' },
  { label: 'Trust Center', target: 'trust' },
]

/*
  Info dialogs. `action` adds a button:
  'sample' → opens the prefilled sample walkthrough
  'questionnaire' → opens a blank questionnaire
  `actionLabel` optionally overrides the button text.
*/
export const DIALOGS = {
  platformApi: {
    title: 'Platform API',
    badge: 'Planned capability',
    paragraphs: [
      'A future API could let teams send product and sourcing profiles from their own systems and retrieve scenario results programmatically.',
      'No API exists in this prototype, and no integrations are connected.',
    ],
  },
  signIn: {
    title: 'Sign in',
    badge: 'Not available in prototype',
    paragraphs: [
      'Accounts are not available yet, so there is nothing to sign in to.',
      'You can try every step with a fictional sample company instead — no account or personal details needed.',
    ],
    action: 'sample',
  },
  discovery: {
    title: 'Discovery call (sample)',
    badge: 'No booking is made',
    paragraphs: ['In a real engagement, a discovery call would be a short conversation covering:'],
    bullets: [
      'How you plan purchasing and inventory today',
      'Where disruptions or cost changes have hurt most',
      'Which decision a first scenario report should help with',
      'What data you would be comfortable sharing, and when',
    ],
    footnote: 'This demo does not schedule calls, collect contact details or send any messages.',
    action: 'sample',
  },
  pricing: {
    title: 'Try Waymark free for 14 days',
    badge: 'Free trial',
    paragraphs: [
      'See your landed cost, test what-if scenarios and get HS chapters suggested for your products. Start with a short questionnaire.',
    ],
    bullets: [
      'Full access to every feature',
      'Up to 30 tasks during the trial',
      'No credit card required',
      'Refer a colleague and get an extra week free for every sign-up',
    ],
    footnote: 'Plans start at $0/month. Paid plans grow with your usage, not your headcount.',
    action: 'questionnaire',
    actionLabel: 'Start free trial',
  },
  terms: {
    title: 'Terms',
    badge: 'Prototype information',
    paragraphs: [
      'This site is provided for demonstration only. Outputs are illustrative estimates and are not financial, legal, customs or compliance advice.',
      'No formal terms of service have been drafted for this prototype.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    badge: 'Prototype information',
    paragraphs: [
      'This demo runs entirely in your browser. Questionnaire answers are held in memory for the current session and are not sent to any server.',
      'The newsletter form does not store or send your email address.',
      'A formal privacy policy would be required before collecting any real business data. Lower-data onboarding reduces — but does not eliminate — privacy risk.',
    ],
  },
  security: {
    title: 'Security',
    badge: 'Prototype information',
    paragraphs: [
      'There is no backend, database or account system in this prototype, so no business data is stored.',
      'No security certifications or guarantees are claimed. A production version would need a proper security review.',
    ],
  },
  trust: {
    title: 'Trust Center',
    badge: 'Prototype information',
    paragraphs: [
      'Our approach for the prototype: label fictional and hypothetical data clearly, show every formula, and keep working features separate from planned ones.',
      'There are no audits, certifications or compliance attestations to report.',
    ],
  },
}

// "Company" page (Our Story). Plain-spoken narrative, short sentences.
export const COMPANY_STORY = {
  hero: {
    eyebrow: 'Our Story',
    headline:
      'Transforming global trade infrastructure into an effortless, accurate, and profitable experience for everyone.',
    subheading: 'A live model of your operations that turns your vision into flawless daily execution.',
    scope: 'For any product, any market, and any scale.',
  },
  mission: {
    quote: 'Every importer should know what a shipment will really cost before it leaves the dock.',
    closing: "That's why we built Waymark.",
  },
  vision: {
    eyebrow: 'Where this is going',
    heading: 'Trade decisions get made before the problem, not after it.',
    paragraph:
      'In five years, importing will run on live models, not spreadsheets and guesswork. A tariff change or a port delay will show up in your plan the same day, not on an invoice six weeks later. Small importers will plan with the clarity that large firms pay whole teams for. Waymark will hold that model: your products, your suppliers, your costs, and the options you have when something moves.',
    punchline: "The importers who win won't be the biggest. They'll be the ones who already ran the numbers.",
  },
}

// "Customer" page. Every number below is a fact about this prototype —
// there are no real customers yet, so no logos or usage stats.
export const CUSTOMER_PAGE = {
  hero: {
    eyebrow: 'Waymark for Canadian importers',
    headline: 'Know your landed cost before the next shock hits.',
    subheading:
      'Answer three short questions about your products, sourcing and spend, and Waymark models your exposure and compares your options side by side.',
    cta: 'Get started for free',
  },
  stats: [
    { value: '97', label: 'HS chapters mapped' },
    { value: '3', label: 'short questionnaire steps' },
    { value: '0', label: 'documents to upload' },
    { value: '12', label: 'month scenario horizon' },
  ],
  benefits: [
    {
      key: 'speed',
      icon: 'sparkles',
      heading: 'A first profile in minutes, not weeks.',
      body: 'Approximate ranges are enough to start. Three short steps cover products, sourcing and spend. No invoices, no CSV exports, no consultant.',
      proof: 'Three steps · no uploads · HS chapter filled in as you type',
    },
    {
      key: 'cost',
      icon: 'ship',
      heading: 'See which response costs least before you commit.',
      body: 'Freight spikes, supplier delays and tariff changes are priced over the same 12 months. Staying put, switching suppliers and expediting sit side by side. Every formula is visible.',
      proof: 'Three responses compared on one 12-month basis',
    },
    {
      key: 'risk',
      icon: 'alert',
      heading: 'Spot the dependency that could hurt you most.',
      body: 'Simple rules flag single-supplier reliance, regional concentration and thin inventory cover. Each flag says why it fired. You decide what to do next.',
      proof: 'Every “Review” and “Watch” flag comes with its reason',
    },
  ],
  differentiator: {
    eyebrow: 'Not just another trade compliance tool',
    heading: 'Spreadsheets show what you paid. Waymark shows what comes next.',
    paragraph:
      'Most importers plan in spreadsheets or ask a general-purpose AI chat. Spreadsheets break when the question changes. Chat answers sound sure but hide their working. Waymark keeps your inputs, assumptions and results in one model you can check.',
    themLabel: 'Spreadsheets & generic AI',
    usLabel: 'Waymark',
    rows: [
      { topic: 'Getting started', them: 'Weeks of data cleanup first', us: 'Approximate ranges in three steps' },
      { topic: 'Scenarios', them: 'One-off formulas that break', us: 'Freight, delay and tariff shocks on one 12-month basis' },
      { topic: 'Trust', them: 'Answers without the working', us: 'Every assumption and formula visible' },
      { topic: 'Classification', them: 'Manual HS lookups', us: 'HS chapter suggested from your product description' },
    ],
  },
}

// "Sign up" page. Plain and specific. No accounts exist yet, so the form
// validates in the browser and nothing is stored or sent.
export const SIGNUP_PAGE = {
  trialDays: 14,
  outcome: 'Answer three short questions and see your first cost scenario and HS chapter suggestions in about 5 minutes.',
  reassurance: [
    { icon: 'layers', title: 'All features, up to 30 tasks', text: 'Classifications, scenarios and reports are all switched on for the trial.' },
    { icon: 'card', title: 'No credit card required', text: 'We only ask for your work email, name and company.' },
    { icon: 'clock', title: 'Set up in about 5 minutes, 0 documents to upload', text: 'Approximate ranges are enough. No IT help, nothing to install.' },
  ],
  afterTrial: [
    'You move to the Free plan: 30 credits a year, and your profile stays saved.',
    'Need more? Paid plans start at $99/month, billed yearly, with more credits and unlimited users.',
    'Nothing is charged automatically. You only pay if you choose a paid plan.',
  ],
  referral: {
    title: 'Love Waymark? Share the love!',
    text: 'Refer a friend or colleague and get an extra free week of full access for every user who registers. It’s our way of saying thank you for spreading the word!',
    cta: 'Refer a friend',
  },
}
