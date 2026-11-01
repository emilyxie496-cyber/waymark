# Waymark — Hackathon Prototype

**Plan. Pivot. Progress.** A landing page and an interactive demo for Waymark, a proposed supply-chain risk and cost intelligence platform for Canadian importing SMEs.

> Hackathon prototype · all companies, suppliers, rates and results are fictional or illustrative. No AI service, tariff feed, backend or account system is connected.

## Requirements

- **Node.js 20.19+ or 22.12+** (built and tested with Node 24)
- npm (bundled with Node)

## Setup & commands

```bash
npm install        # install dependencies (uses package-lock.json)
npm run dev        # start the dev server → http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve the production build locally
```

No API keys, environment variables or external accounts are needed. After `npm install` the app runs fully offline.

## Demo walkthrough (about 7 minutes)

1. **Landing page.** Click **Get a Demo** to open a pre-filled questionnaire for *Maple Trail Home Goods*, a fictional company. Click **Get started for free** to start with a blank one.
2. **Questionnaire** (3 short steps). Show the approximate ranges and the optional fields. Click **Next** through the steps. **Try sample company** and **Reset answers** are in the sidebar.
3. **Company profile.** Walk through the summary cards, the rule-based *Review/Watch* indicators, the missing information, and the midpoint assumptions.
4. **Scenario.** Move the **freight-cost** slider (default +30%) and the **supplier delay** slider (default 45 days). The formula table updates live.
5. **Compare responses.** This is the strongest moment. With the default settings, *expedited shipping* has the lowest estimated cost. Turn on **Add a hypothetical tariff** (10%), and the *alternative supplier* becomes the lowest-cost option. Explain that trade-off: cost, timing and feasibility.
6. **Report.** Show inputs, impacts, assumptions, limitations and next actions. Click **Print / Save as PDF** to export.
7. To run it again, use **Reset scenario** (keeps the answers) or **Reset demo** (clears everything) in the header.

## How the numbers work

All amounts are in CAD over one **12-month scenario period**. The formulas live in `src/utils/calculations.js`.

| Item | Formula |
| --- | --- |
| Baseline landed cost | import spend + freight spend (range midpoints) |
| Additional freight | freight spend × freight increase % |
| Hypothetical tariff | import spend × share from main region × hypothetical rate |
| Uncovered days | max(0, delay days − inventory buffer days); an unknown buffer counts as 0 |
| Delay shortfall | uncovered days × *your* cost per shortfall day. If you enter nothing, the delay is not costed. |
| Alternative supplier | moves X% of main-region volume: price premium + onboarding + adjusted freight. Tariff and delay apply only to the volume that isn't moved. |
| Expedited shipping | (main-region freight ÷ 365) × uncovered days × (cost multiplier − 1); removes the shortfall |

A supplier delay on its own is never treated as lost revenue.

## Folder structure

```text
waymark-demo/
  public/favicon.svg
  src/
    components/
      ui.jsx               Icons, buttons, badges, logo, headings
      Navbar.jsx, Hero.jsx, Features.jsx, LandingSections.jsx, Footer.jsx
      InfoDialog.jsx       Native <dialog> for nav/footer info popups
      demo/
        DemoWorkspace.jsx  Demo shell, stepper, shared session state
        Questionnaire.jsx  3-step form + field components
        ProfileStep.jsx, ScenarioStep.jsx, ScenarioControls.jsx
        StrategyStep.jsx, StrategyChart.jsx, ReportStep.jsx
    data/
      content.js           Landing copy, FAQ, personas, dialogs, footer links
      demoData.js          Questionnaire options, midpoints, sample company,
                           scenario defaults, fictional strategy assumptions
    utils/
      calculations.js      All demo formulas (deterministic)
      validation.js, classify.js, format.js
    App.jsx, main.jsx, index.css
```

## Where to edit

- **Copy, FAQ, personas, dialogs, footer:** `src/data/content.js`
- **Sample company, ranges/midpoints, scenario defaults, Supplier B and expedite assumptions:** `src/data/demoData.js`
- **Formulas and indicator thresholds:** `src/utils/calculations.js`
- **Brand colours and font stack:** the `@theme` block in `src/index.css`. Inter is used if it's installed locally; otherwise the system font is used.

## Limitations

- All results are preliminary estimates based on questionnaire ranges. They are not validated, company-specific forecasts.
- Tariff rates are hypothetical. Classification hints come from a simple keyword lookup and must be verified with a customs broker or CBSA guidance.
- Supplier B, its prices and lead times, and the expedite multiplier are fictional.
- Accounts, the discovery call, the newsletter, tariff audits, the API and automated monitoring are not implemented. The UI labels them as unavailable or planned.
- Answers are kept in memory only. They are cleared on reset or when the tab is closed, and they are never sent anywhere.
