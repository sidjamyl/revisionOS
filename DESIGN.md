---
name: RevisionOS
description: Warm paper, one marked trail. Students see what to revise, in which order, and why.
colors:
  paper: "#FFFCF7"
  peach-panel: "#FCF1E3"
  surface: "#FFFFFF"
  inset: "#F6F5F1"
  ink: "#1C1B21"
  ink-soft: "#4A4951"
  ink-muted: "#646269"
  label-muted: "#6E6B78"
  hairline: "#E4E0DB"
  hairline-strong: "#CFCAC3"
  ember: "#ED8139"
  ember-tint: "#FCF0E4"
  ember-deep: "#965935"
  ember-edge: "#EEA973"
  urgent: "#DD524C"
  urgent-tint: "#FBEBE9"
  urgent-ink: "#B8322C"
  important: "#EAB83E"
  important-tint: "#FDF5D4"
  important-ink: "#7A5A00"
  acquis: "#57B279"
  acquis-tint: "#F4FAF5"
  acquis-border: "#D5E8D9"
  acquis-ink: "#346D4A"
  later: "#7C8798"
  later-tint: "#EFF2F6"
  later-ink: "#56606F"
  module-teal: "#53B1A5"
  module-teal-tint: "#E2F5F3"
  module-rose: "#D95597"
  module-rose-tint: "#F9E8F1"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  title-sm:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body-lg:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.5
  node:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.3
  label:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.08em"
  status:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  3xl: "48px"
  4xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "14px 28px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.ink-soft}"
    textColor: "{colors.paper}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.inset}"
  button-ghost-ember:
    backgroundColor: "{colors.ember-tint}"
    textColor: "{colors.ember-deep}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 24px"
  nav-item:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  nav-item-active:
    backgroundColor: "{colors.ember-tint}"
    textColor: "{colors.ember-deep}"
  status-chip-urgent:
    backgroundColor: "{colors.urgent-tint}"
    textColor: "{colors.urgent-ink}"
    typography: "{typography.status}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  status-chip-important:
    backgroundColor: "{colors.important-tint}"
    textColor: "{colors.important-ink}"
    typography: "{typography.status}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  status-chip-acquis:
    backgroundColor: "{colors.acquis-tint}"
    textColor: "{colors.acquis-ink}"
    typography: "{typography.status}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  status-chip-later:
    backgroundColor: "{colors.later-tint}"
    textColor: "{colors.later-ink}"
    typography: "{typography.status}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  countdown-badge:
    backgroundColor: "{colors.later-tint}"
    textColor: "{colors.later-ink}"
    typography: "{typography.status}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  choice-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  choice-card-selected:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
  concept-node:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.node}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    width: "180px"
  concept-node-acquis:
    backgroundColor: "{colors.acquis-tint}"
    textColor: "{colors.ink}"
  source-row:
    backgroundColor: "{colors.inset}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  module-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  progress-track:
    backgroundColor: "{colors.ember-tint}"
    rounded: "{rounded.full}"
    height: "8px"
---

# Design System: RevisionOS

## 1. Overview

**Creative North Star: "The Marked Trail"**

RevisionOS is a walk along a trail someone has already marked for you. The ground is warm paper (#FFFCF7); almost nothing on it is colored. Color appears only where it marks the route: the concept you should open now, the status of each concept on the graph, the module you are in, and how far along you are. The mockup's own line carries the whole system: *"Toi, tu suis simplement le chemin."* If a screen has color that does not mark position, status, or module identity, the color is decoration and must go.

The student is an Algerian university student at a desk or in a university library, in daylight or under a lamp in the evening, a few days before an exam and slightly anxious about what to open first. That scene forces a light, warm theme: paper that reads like a printed course polycopié, dark ink for text, low contrast between surfaces so the page stays calm, and strong contrast only on the next action. The MVP ships light only; dark mode is not designed and must not be improvised. Density is moderate: generous page margins (48 to 64px), compact graph nodes, and one clear primary action per view. The product is product-register UI. It should feel as trustworthy as Linear or Notion, not like a marketing page.

This system rejects the look of a generic SaaS dashboard: no hero-metric tiles, no identical icon-card grids, no gradient glow buttons, no glassmorphism, no purple-on-dark AI styling. It also rejects gamified study apps: no streak flames, confetti, mascots, or points economies. Trust comes from evidence on the page (course page, TD exercise, exam year and points), not from decoration.

**Layout skeleton.** App shell: a fixed left sidebar (256px, `surface` on `paper` with a hairline divider) holding the wordmark, primary nav, the student's module list with countdown badges, and the profile at the bottom; the content column sits on `paper` with 48 to 64px padding. The module view splits into the concept graph canvas (flexible) and a source panel (360px) on the right. Onboarding uses a split screen: a `peach-panel` story panel (about 40%, `xl` radius, inset 24px from the viewport edge) and the question on `paper` (about 60%) with the step progress at the top and the primary action anchored bottom right. Below 1024px the sidebar collapses to a top bar with a menu sheet; below 768px the source panel becomes a bottom sheet over the graph, onboarding drops the story panel, and choice cards stack to one column. The graph stays pannable and zoomable at every width; never shrink nodes below the `node` type size to make them fit.

**Motion.** Motion conveys state only. Transitions run 150 to 250ms with an ease-out-quart curve (`cubic-bezier(0.25, 1, 0.5, 1)`); no bounce, no elastic, no page-load choreography. Allowed moments: the selected card's halo fading in, the source panel sliding in when a node is opened, the essential route edges brightening when the exam date changes the emphasis, a progress bar filling after "J'ai compris cette notion". Animate `opacity` and `transform` only. Under `prefers-reduced-motion`, cut to instant state changes.

**Voice on screen.** French first, informal *tu*, short sentences that name the benefit ("On récupère les cours et les annales de ton école."). Numbers use French formatting (3,75 pts; Mardi 29 sept.). No em dashes in UI copy.

**Implementation mapping (Next.js).** Tokens in the frontmatter are the source of truth. They become CSS custom properties in `src/app/globals.css`, exposed to Tailwind v4 through `@theme` (e.g. `--color-paper`, `--color-ember`, `--color-urgent-ink`, `--radius-md`, `--font-sans`) so utilities read `bg-paper`, `text-urgent-ink`, `rounded-md`. shadcn/ui variables map onto the same tokens: `--background` = paper, `--foreground` = ink, `--card` / `--popover` = surface, `--primary` = ink, `--primary-foreground` = paper, `--secondary` = inset, `--muted` = inset, `--muted-foreground` = ink-muted, `--accent` = ember-tint, `--accent-foreground` = ember-deep, `--destructive` = urgent-ink, `--border` / `--input` = hairline, `--ring` = ember, `--radius` = 10px. Load Plus Jakarta Sans once in `src/app/layout.tsx` with `next/font/google` (`Plus_Jakarta_Sans`, subsets `latin` and `latin-ext`, weights 400/500/700/800, `display: "swap"`, `variable: "--font-sans"`) so there is no layout shift and no external font request. React Flow nodes and edges are custom components styled with these tokens; the React Flow default theme is never shipped. Icons come from `lucide-react` at 20px with a 1.75 stroke, in `ink-muted` unless they mark state.

**Key Characteristics:**
- Warm paper canvas, white working surfaces, near-black ink; color only marks the trail.
- One ember accent for "you are here": current concept, selected choice, progress, active nav.
- A four-word status vocabulary (Urgent, Important, Plus tard, Acquis), always dot + word + tint.
- Evidence rows (course page, TD exercise, exam year and points) sit next to every recommendation.
- Heavy 800-weight headlines, calm 400/500 body, one family.
- Flat surfaces with hairlines; a single warm halo for the focused item.

## 2. Colors: The Marked Trail Palette

Restrained strategy: tinted warm neutrals carry the screen, ember marks position, and a small semantic set marks status and module identity.

### Primary
- **Trail Ember** (#ED8139): the "you are here" color. Logo tile, current onboarding step, progress fill for the active module, the solid essential-route edges (in its lighter `ember-edge` form), the halo around the selected choice card and the current concept node. Never used as text: it fails contrast on paper.
- **Ember Wash** (#FCF0E4): active nav item, the "Passer" ghost button, avatar circle, progress track behind ember fills.
- **Burnt Ember** (#965935): text and icons placed on Ember Wash (active nav label, "Passer"). This is the only ember that may be text.
- **Trail Edge** (#EEA973): solid prerequisite edges on the essential route.

### Secondary (status)
Each status has a dot color, a tint for chips and node backgrounds, and a text ink that passes 4.5:1 on its tint and on white.
- **Signal Red** (#DD524C dot, #FBEBE9 tint, #B8322C ink): *Urgent*. A concept on the essential route that is not yet acquired, or an exam in 3 days or fewer.
- **Exam Amber** (#EAB83E dot, #FDF5D4 tint, #7A5A00 ink): *Important*. Historically frequent or high-point concept, not on today's essential route; exam in 4 to 7 days.
- **Meadow Green** (#57B279 dot, #F4FAF5 tint, #D5E8D9 border, #346D4A ink): *Acquis*. The student marked the concept mastered.
- **Slate Later** (#7C8798 dot, #EFF2F6 tint, #56606F ink): *Plus tard*. Lower priority now; exam more than 7 days away.

### Tertiary (module identity)
- **Algebra Ember** (uses #ED8139), **Lagoon Teal** (#53B1A5, tint #E2F5F3), **Rose Ink** (#D95597, tint #F9E8F1): a module's color square in the sidebar, module card, and page title, plus its progress bar. They name modules and nothing else.

### Neutral
- **Polycopié Paper** (#FFFCF7): app canvas behind everything.
- **Peach Panel** (#FCF1E3): the onboarding story panel only.
- **Sheet White** (#FFFFFF): working surfaces: sidebar, cards, graph canvas, source panel, graph nodes.
- **Inset Stone** (#F6F5F1): recessed rows inside a surface (course source row, input fields, secondary hover).
- **Study Ink** (#1C1B21): headings, primary text, primary button fill.
- **Soft Ink** (#4A4951): body and explanation text, nav labels.
- **Quiet Ink** (#646269): subtitles, meta text, icons at rest.
- **Label Ink** (#6E6B78): uppercase section labels ("À RÉVISER MAINTENANT", "DANS TON COURS"). The mockup's lighter gray fails contrast at 12px; this value replaces it.
- **Hairline** (#E4E0DB): card, button, and node borders; the dotted graph grid.
- **Pencil Line** (#CFCAC3): dashed prerequisite edges, dashed borders for uncertain or untested states.

### Named Rules
**The Ember Marks the Trail Rule.** Ember and its variants cover at most 10% of any screen and only ever mean "current position, current selection, or progress". A second ember element that is not the current thing is forbidden.

**The Dot Word Tint Rule.** A status is always three things together: a colored dot, the French word, and the status tint. Color alone never carries a status, so it survives color blindness and grayscale printing.

**The Module Colors Are Names Rule.** Teal and rose identify modules and never signal status. A new module gets the next identity hue from a fixed list (ember, teal, rose, then an indigo and an olive to be chosen with contrast checks); it never reuses a status hue.

## 3. Typography

**Display Font:** Plus Jakarta Sans (with ui-sans-serif, system-ui, sans-serif)
**Body Font:** Plus Jakarta Sans
**Label/Mono Font:** none; numerals use `font-variant-numeric: tabular-nums` where they align.

**Character:** One warm, slightly geometric sans with full Latin Extended coverage for French accents. Very heavy 800 headlines give the calm pages a confident spine; 400 to 500 body keeps explanations easy to read under tired eyes.

### Hierarchy
- **Display** (800, 2.75rem, 1.1, -0.025em): onboarding story headline only ("Tu sais enfin quoi réviser, et dans quel ordre.").
- **Headline** (800, 2.25rem, 1.15, -0.02em): page titles ("Bonjour Amine", "Où étudies-tu ?", "Algèbre 1").
- **Title** (800, 1.75rem, 1.2): the focused concept ("Morphismes de groupes" in the focus card and the source panel).
- **Title Small** (700, 1.25rem, 1.3): section titles ("Tes modules"), module card names, choice card acronyms (ESI, ENP).
- **Body Large** (400, 1.125rem, 1.5): page subtitles and nav labels. Cap at 65ch.
- **Body** (500, 1rem, 1.5): explanations, reasons, source rows, buttons. Cap explanations at 70ch.
- **Node** (700, 1rem, 1.3): concept node titles; wrap to at most 3 lines, never truncate a concept name with an ellipsis on the graph.
- **Label** (700, 0.75rem, 0.08em, uppercase): section labels in the sidebar, focus card, and source panel.
- **Status** (700, 0.8125rem): status chips, countdown badges, the status word inside nodes.

### Named Rules
**The One Family Rule.** Plus Jakarta Sans is the only typeface. Hierarchy comes from size and the 800 versus 500 weight contrast, never from a second family, italics for emphasis, or color.

**The French Numbers Rule.** Points and dates use French formatting (3,75 pts, Mardi 29 sept., J-2) and tabular numerals wherever numbers stack in a column, such as exam rows.

## 4. Elevation

The system is flat and tonal. Depth comes from three layers of warmth (paper, then white surface, then inset stone) separated by 1px hairlines. Shadows are soft, low, and warm-tinted; they lift a surface slightly off the paper, they never float it. One focused item per view may carry a warm ember halo. The only heavy shadow belongs to floating controls, which are outside the MVP.

### Shadow Vocabulary
- **Rest** (`box-shadow: 0 1px 2px rgba(28, 27, 33, 0.04), 0 2px 8px rgba(28, 27, 33, 0.04)`): cards, graph nodes, secondary buttons, the source panel.
- **Lift** (`box-shadow: 0 2px 4px rgba(28, 27, 33, 0.05), 0 8px 20px rgba(28, 27, 33, 0.07)`): hover on clickable cards and nodes.
- **Ember Halo** (`box-shadow: 0 0 0 4px rgba(237, 129, 57, 0.14), 0 6px 18px rgba(237, 129, 57, 0.16)`): with a 2px ember border, marks the selected choice card and the current concept node.
- **Float** (`box-shadow: 0 10px 30px rgba(28, 27, 33, 0.22)`): reserved for floating pills (future Coach button).

### Named Rules
**The Single Halo Rule.** Exactly one element per view may wear the Ember Halo: the current concept or the selected choice. If two things glow, neither is current.

**The Paper Weight Rule.** If a shadow is visible from across the room, it is too dark. Rest shadows must be nearly invisible on paper; the hairline does the separating.

## 5. Components

### Buttons
Confident and quiet: dark ink for the one action that moves the trail forward, white outline for everything else.
- **Shape:** gently rounded (10px), 48 to 52px tall, icon then label with an 8px gap.
- **Primary:** Study Ink fill, paper text, weight 700, padding 14px 28px ("Continuer →", "Commencer", "Session guidée"). One per view.
- **Hover / Focus:** hover lightens to Soft Ink; focus shows a 2px ember ring offset 2px from the button. Press scales to 0.98 over 120ms. Disabled drops to 40% opacity with no hover.
- **Secondary:** white surface, 1px hairline, Rest shadow, ink text ("C'est fait, suivante", "Plein écran", "Mode focus"). Hover moves to Inset Stone.
- **Ghost Ember:** Ember Wash fill, Burnt Ember text, no border ("Passer"). Used only for skipping an optional step.
- **Loading:** label stays, a 16px spinner replaces the leading icon, width does not change.
- The mockup's multicolor glow rings around "Commencer" and "Session guidée" are dropped; they are gradient decoration.

### Status Chips
- **Style:** status tint background, 6px radius, 4px 10px padding, 8px status-colored dot, then the word in the status ink ("Urgent", "Important", "Plus tard", "Acquis").
- **Placement:** after a concept title, at the top of each graph node (dot and word only, no tint, since the node itself carries the tint when acquired), and at the top of the source panel.

### Countdown Badges
- **Style:** compact chip (6px radius, 4px 8px padding, Status type) showing days to the exam: "J-2" in the sidebar, "Dans 2 jours" on module cards, "Mardi 09:00 · dans 2 jours" beside the module title.
- **Color by proximity:** 3 days or fewer uses the Urgent pair, 4 to 7 days the Important pair, beyond 7 days the Plus tard pair. The exam date changes emphasis; it never creates a schedule.

### Sidebar Navigation
- **Style:** white surface, 256px wide, wordmark at top (40px ember tile with a white graduation-cap glyph, then "Revision OS" in Title Small).
- **Items:** 20px outline icon plus Body Large label, 12px 16px padding, 10px radius. Default Soft Ink; hover Inset Stone; active Ember Wash with Burnt Ember label and icon.
- **Module list:** under a "MES MODULES" label, each row shows the module identity square (10px, 3px radius), the name in Body weight 700, and its countdown badge right-aligned. "+ Ajouter un module" closes the list in Quiet Ink.
- **Profile:** bottom-anchored: 40px Ember Wash avatar with initials in Burnt Ember, name in Body weight 700, "ESI · 1CP" in Quiet Ink.
- **Mobile:** collapses into a top bar with the wordmark and a menu button opening a left sheet with the same content.

### Onboarding Choice Cards and Step Progress
- **Choice card:** white surface, 1px Hairline, 16px radius, 24px padding; acronym in Title Small, full name in Body in Quiet Ink. Two columns on desktop, one on mobile. Cards are radio options: the whole card is the hit target, arrow keys move between them.
- **Selected:** 2px ember border plus Ember Halo. Hover (unselected) uses Lift and a Pencil Line border.
- **Step progress:** a row of short pill segments (36px by 6px, full radius): done and current segments in ember, remaining in Hairline, followed by "Étape 1 sur 3" in Quiet Ink. The flow stays short: institution, program and module, then the level test.
- **Story panel:** Peach Panel with a small static preview of the concept graph (four nodes) and the Display headline at the bottom. Hidden below 768px.

### Level Test Question (derived; not in the PDF)
- Same split layout as onboarding. The question in Headline, four answer options as choice cards (single select, full-card hit target), a "Je ne sais pas" secondary button that leaves the concept `unknown`, and step progress showing "Question 3 sur 8". No timer, no score reveal between questions.

### Focus Card ("À réviser maintenant")
- **Style:** white surface, Hairline border, 16px radius, Rest shadow, 32px padding. Label on top, concept in Title with its status chip, a meta row (module square and name), then the reason in Body ("Tombé à chaque examen depuis 2020, souvent pour 3 à 4 points. C'est la base de la notion suivante."), then Primary and Secondary buttons.
- **Rule:** the reason line always cites evidence: exam frequency, points, or a prerequisite link. A focus card without a reason is incomplete.
- The mockup's "Notion 1 sur 3 aujourd'hui" counter and "45 min" duration imply a daily plan and are future items (see below). In the MVP the card shows the next concept on the essential route, nothing about today.

### Module Cards
- **Style:** white surface, Hairline, 16px radius, 24px padding, Rest shadow; Lift on hover; the whole card links to the module graph. Module square and name in Title Small, arrow icon right-aligned in Quiet Ink, countdown badge plus the exam date, then an 8px progress bar (module color on the module tint) and "12 notions acquises sur 32" with the number in Body weight 700.
- Three modules sit in a row on desktop; they are allowed to look alike because they are the same object. Do not add icons or decorative illustrations to them.

### Concept Graph (signature component)
- **Canvas:** white surface, 16px radius, Hairline border, a dotted grid (1px Hairline dots every 20px). Built on React Flow with custom nodes and edges; pan and zoom enabled, fit-to-view on load, top-to-bottom layout by prerequisite depth.
- **Node:** 180px wide, white, 1px Hairline, 10px radius, 12px 16px padding, Rest shadow. Status dot and word on the first line (Status type), concept name in Node type below.
- **Node states:** *Acquis* nodes take the Meadow tint and Meadow border. The *current* node takes a 2px ember border and the Ember Halo. Hover uses Lift. Keyboard focus uses a 2px ember ring. Selected nodes open the Source Panel.
- **Untested (`unknown`):** until the level test or the student says otherwise, a concept's mastery is unknown. Show a small hollow Pencil Line ring and "Non testé" in Label Ink after the status word. Never show untested as not mastered. Wording is provisional until the domain glossary confirms it.
- **Low confidence:** when extraction confidence is low, the node border turns dashed Pencil Line and carries an "À vérifier" tag; the edge from it is dashed too. Uncertainty is visible, never hidden.
- **Edges:** `prerequisite of` only. Essential-route edges are solid Trail Edge (2px) with smooth-step curves; all other prerequisite edges are dashed Pencil Line (1.5px, 4 4 dash). Direction reads top to bottom (prerequisite above, dependent below); a small arrowhead (6px, same color as the edge) at the dependent end keeps the page's instruction "Suis les flèches, de haut en bas." literally true.
- **Independent concepts** sit in a separate column at the right edge, not forced into the tree.
- **Demonstration data:** when the module uses sample content, a "Données de démonstration" chip (Later pair) sits in the canvas top-left corner and never disappears.

### Source Panel (signature component)
- **Style:** 360px white surface, Hairline, 16px radius, 24px padding, scrolls independently. Status chip, concept name in Title, the reason paragraph in Body in Soft Ink ("Tombée 6 années sur 6, environ 3,75 points à chaque fois.").
- **Evidence groups:** three labeled groups in Label type: "DANS TON COURS" (course rows on Inset Stone with a document icon in ember, "Chapitre 2, page 42", arrow), "POUR T'ENTRAÎNER" (TD rows with a pencil icon), "AUX EXAMENS" (exam rows with year and exercise on the left, points right-aligned in tabular numerals). Each row links to the cited page or question.
- **Excerpts:** a row may expand inline to show the supporting excerpt in Body on Inset Stone; no modal.
- **Mastery action:** "J'ai compris cette notion" is a Primary button pinned to the panel bottom. Once pressed it becomes a Secondary "Acquis · annuler" and the node turns Meadow.
- **Mobile:** becomes a bottom sheet at 60% height, draggable to full.

### Future (non-MVP) patterns
These appear in the mockup and are documented so their look stays consistent later. They must not be built in the MVP; PRODUCT.md excludes a daily schedule, and a conversational assistant is a V2 idea.
- **Coach pill:** floating bottom-right, Study Ink fill, paper text, full radius, Float shadow, chat-bubble icon plus "Coach".
- **Calendrier nav item:** calendar icon, same nav item style.
- **Mode focus / Plein écran:** Secondary button with a frame-corners icon; would hide the sidebar and source panel.
- **Session guidée:** Primary button that would step through the essential route one concept at a time.
- **Daily counter and durations:** "Notion 1 sur 3 aujourd'hui" with three dot segments, "45 min" with a clock icon.

## 6. Do's and Don'ts

### Do:
- **Do** attach a visible reason and source to every recommendation: course chapter and page, TD exercise, exam year, exercise, and points.
- **Do** keep the student flow short: choose a module, answer a brief test, explore the graph. Onboarding shows its step count ("Étape 1 sur 3").
- **Do** show uncertainty honestly: dashed Pencil Line borders and "À vérifier" for low-confidence concepts and links, "points inconnus" when an exam question has no point value.
- **Do** label demonstration data on every screen that shows it, with the "Données de démonstration" chip.
- **Do** keep every concept visible on the graph and highlight the essential route with solid Trail Edge lines as the exam approaches.
- **Do** pair every status color with its dot and French word (The Dot Word Tint Rule).
- **Do** use Study Ink (#1C1B21) for the single primary action per view and keep ember under 10% of the screen.
- **Do** give every interactive element default, hover, focus-visible (2px ember ring), active, disabled, and loading states, and a hit target of at least 44 by 44px.
- **Do** use skeleton placeholders shaped like nodes and rows while the graph and sources load, and empty states that explain the next step ("Aucun document pour ce module pour l'instant. Les notions apparaîtront dès qu'un cours sera ajouté.").

### Don't:
- **Don't** build a daily schedule, a day counter, or time estimates in the MVP; "Notion 1 sur 3 aujourd'hui" and "45 min" are future patterns only.
- **Don't** use recency as a visual priority signal. "Dernière apparition en 2025" may be shown as a fact; it must not change a node's status or color.
- **Don't** show an untested concept as not mastered. Untested stays `unknown` ("Non testé").
- **Don't** let students write content in the MVP; contribution entry points may appear only as clearly disabled future features.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored stripe on cards, nodes, rows, or alerts.
- **Don't** use gradient text, gradient borders, or multicolor glow rings (the mockup's glow around "Commencer" and "Session guidée" is removed).
- **Don't** use glassmorphism, backdrop blur, or translucent cards.
- **Don't** build hero-metric tiles (big number, small label, gradient accent) or grids of identical icon-plus-heading cards.
- **Don't** open a modal as the first answer; expand inline, use the source panel, or a bottom sheet on mobile.
- **Don't** use ember (#ED8139) as text, or pure #000 for text; text colors are the ink tokens only.
- **Don't** add streaks, confetti, mascots, leaderboards, or points economies; progress is "notions acquises", nothing else.
- **Don't** use em dashes in UI copy.
- **Don't** invent a dark theme ad hoc; it is not designed yet.
