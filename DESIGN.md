# Design

Which token to use when, and the components with their states. Values live only in `src/styles/theme.css`; the rules that keep them there are in `STACK.md` section 5.

## Colour

Pick a token by its role, not by how it looks. A new role gets a new semantic token pointing at a primitive.

| Token                           | Use for                                                                                                                                |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `background`                    | the page, the sticky header, the email field                                                                                           |
| `foreground`                    | text; ink outlines, hard shadows and the rules between rows; the current week's bar; the dark button                                   |
| `foreground-hover`              | the dark button on hover                                                                                                               |
| `muted-foreground`              | secondary text: intros, meta lines, captions, chart labels, the footer row; the sound toggle when off                                  |
| `inverse-foreground`            | text on `foreground`                                                                                                                   |
| `placeholder`                   | field placeholders                                                                                                                     |
| `border`                        | a line that should recede: the hairline above the footer row, the divider between the header's icons                                   |
| `primary`, `primary-foreground` | the call to action and the text on it                                                                                                  |
| `accent`                        | the hover fill behind icon buttons                                                                                                     |
| `card`                          | plates and the newsletter card                                                                                                         |
| `ring`                          | the focus outline                                                                                                                      |
| `chart`                         | past weeks' bars                                                                                                                       |
| `pencil`                        | the sketch layer: the name's outline and guidelines, the dashed plate, the empty ledger's rule                                         |
| `annotation`                    | the hand-written voice: the aside and its arrow, the best-week mark, win and flop marks, lessons, draft labels, the form's status line |
| `canvas-text`, `link-text`      | forced colours only: `forced-colors:border-canvas-text` on ink outlines, `forced-colors:text-link-text` on icon buttons                |

- Hand-font text is `annotation`, except on a `primary` surface, where it keeps `primary-foreground`.
- Rules between rows are ink (`foreground`); `border` is never a row rule.

## Type

Families:

- `font-show`: the name, section titles and plate numerals. Nothing else.
- `font-text`: the default. Set it again on form controls, which do not inherit fonts.
- `font-hand`: annotations, with `font-medium` (`font-semibold` for a plate numeral) and the `/hand` leading.

Roles carry their own leading, tracking and weight. Use them bare:

| Role           | Use for                                                  |
| -------------- | -------------------------------------------------------- |
| `text-display` | the name                                                 |
| `text-section` | section titles                                           |
| `text-strap`   | the hero strapline                                       |
| `text-title`   | a project's name                                         |
| `text-stat`    | big numbers and card headings                            |
| `text-handle`  | the X handle on the card on phones; `md:text-stat` above |
| `text-figure`  | user counts on the shelf                                 |
| `text-signoff` | the footer handle                                        |

Plain sizes set only the size. Add a leading modifier when the inherited body leading is wrong:

| Size           | Use for                                               |
| -------------- | ----------------------------------------------------- |
| `text-plate`   | the numeral inside a plate, with `/none`              |
| `text-heading` | small headings: post titles, channel links, the aside |
| `text-lead`    | the footer note                                       |
| `text-body`    | running text; the page default                        |
| `text-small`   | secondary text, the field and its button, the nav     |
| `text-meta`    | dates, captions, counts, chart labels                 |

- Leading: `/none` for one-line labels, `/heading` for headings at a plain size, `/hand` for the hand font, `/body` for paragraphs at `text-small`.
- Tracking: `tracking-tight` for bold headings at `text-body` and the unit beside a figure, `tracking-heading` for bold headings at `text-heading` and the brand, `tracking-wide` only for `font-show` at `text-plate`.
- Weight: `font-bold` for headings and emphasis, `font-semibold` for standalone links and the nav, `font-extrabold` for the brand, `font-medium` for the hand font.
- `tabular-nums` on every number that lines up with another or changes.

## Space and size

- Inside a component, use the numeric steps: whole steps, plus `0.5` and `1.5` for optical nudges.
- The named tokens keep the layout in line across the page:
  - `pad`: the side padding of every content row;
  - `nav-h`: the header height, and the scroll offset for anchors;
  - `hero-top`: the space above the name;
  - `section`: the space below each section; the last one is shorter;
  - `col-2`: where the second column starts in the ledger and the post list, through `grid-cols-entry` and `grid-cols-post`;
  - `chart-inset`: lines the chart caption up with the axis;
  - `aside-x`, `aside-y`: place the pencil note beside the name.
- Widths: `max-w-page` wraps every section. `max-w-shelf` holds the hero shelf below `lg`. `max-w-intro`, `max-w-lede`, `max-w-what` and `max-w-aside` cap the line length of a section intro, the hero lede, a project's description and the pencil note.

## Shape and depth

- Radius: `rounded-xl` for controls and cards, `rounded-2xl` for a row plate, `rounded-3xl` for a shelf plate. The focus ring takes `radius-sm` from the base rule.
- Borders:
  - `border-3`: the ink outline on plates and on anything you can press or type into, and the rule above the footer;
  - `border-2`: rules between rows and above a list, and the header's rule once scrolled;
  - `border`: hairlines.
- Icon buttons keep a transparent `border`. It looks like a no-op, but forced colours paint it, and it becomes the button's only outline there.
- Shadows are hard and ink only. `shadow-hard-4` rests a plate; `shadow-hard-6` rests a card or the main button. Pencil plates cast none.
- **The lift:** on hover, `-translate-0.5` and one shadow step up; on press, `translate-1` and `shadow-hard-2`. The footprint never moves.

## Motion

- `duration-fast`: hover changes and the lift. `duration-base`: the header's rule and the arrow's nudge. `duration-slow` and `duration-spring` belong to `effects.css`: chart labels, bars, the squash and the bounce.
- `ease-out` for anything that settles; `ease-spring` for anything that overshoots.
- Name what moves: `transition-lift`, `transition-background`, `transition-colors`, `transition-transform`.
- Entrances, the bounce and the chart draw-in only run under `prefers-reduced-motion: no-preference`. Under reduce, the charts are drawn from the start.

## Breakpoints

Mobile first: write the phone layout bare, then add `md:`, `lg:` and `xl:`. `max-md:` appears only in `effects.css`.

## Components

**SiteHeader**

- Sticky. Its bottom rule appears through the `scrolled:` variant, once `main.ts` puts `scrolled` on the root.
- Nav links underline on hover.
- Icon buttons: hover `bg-accent` through `transition-background`, the transparent border from Shape and depth, and `forced-colors:text-link-text` on the icon. The footer's icon links are the same.
- Sound toggle (`data-sound`): `aria-pressed` holds the state. Off shows `muted-foreground` and the sound-off icon, through `not-aria-pressed:` and `group-not-aria-pressed:`. The choice survives a reload.

**Hero**

- The name: `.name`, then `.w` per word (with its pencil guideline), then `.l` per letter (`data-ch`, `data-letter`, `--i`). On load the letters flood in and squash. On hover the ink layer lifts off its pencil outline, with a tick when sound is on. The pencil layer hides below `md` and in forced colours.
- The aside note shows on `xl` only.
- The main button is `primary` with the lift.
- The shelf shows up to four apps. With more than four it shows three and a dashed `+N` plate; with fewer than two it adds a pencil `#N` plate for the next app.

**Plate** (`size`: shelf or row; `tone`: solid, dashed or pencil; `href`; `label`; `bounce`)

- Solid and dashed: an ink outline on `card` with `shadow-hard-4`. Pencil: a dashed `pencil` outline, no shadow.
- With `href`: hover lift.
- With `bounce` (`data-plate`): a click plays `boing` and a sound. Under reduced motion only the sound plays.

**Section** (`id`, `title`, `intro`, `last`): every section after the hero. A `font-show text-section` title, an optional muted intro, and `pb-section` below; `last` shortens it.

**ProjectRow**: plate, name and stores, description, chart, users and rating. Rows are divided by ink rules. The layout steps through `grid-cols-project-sm`, `md:grid-cols-project-md` and `lg:grid-cols-project`.

**WeeklyChart** (`data-chart`; effect hooks `.chart`, `.bar`, `.ev`, `.ink`; `--b` per bar)

- Past weeks are `fill-chart`, the current week `fill-foreground`, and the best week is circled in `annotation`.
- States: `armed` keeps the bars flat and the labels hidden; `drawn` grows them once half the chart is in view.
- The SVG's `aria-label` carries every number the chart shows.

**Wins**

- Empty: one dashed `pencil` rule with a hand note.
- Entry: the month, a `mk-win` or `mk-flop` mark in `annotation`, the text behind a screen-reader "Win:" or "Flop:", and an optional lesson in hand. `grid-cols-entry-sm`, then `md:grid-cols-entry`.
- No entry exists yet, so no test renders this state.

**Writing**: post rows divided by ink rules, a `draft` label in hand, titles in `text-heading/heading`. Titles have no link and no hover state yet.

**Follow**

- X card: a `primary` card with the lift. The arrow nudges right on hover, through `group-hover:`.
- Newsletter card (`data-mail`): a `card` surface. The field sits on `background` with an ink outline and the focus ring. Subscribe is the dark button.
- The status line (`data-mail-status`, `role="status"`) is replaced on submit.
- Other channels: `text-heading` links, each with a meta line.

**SiteFooter**: the hand note, the signoff handle (underlined on hover), the email link, then a `border` hairline and the meta row, whose icon links are the header's icon buttons.

**Sprite**: icons (`i-*`) and marks (`mk-*`) draw in `currentColor`, so colour them with `text-*`. `#graphite` is the pencil filter.

## Shared states

- **Focus:** every focusable element gets the base `:focus-visible` ring. Never remove it.
- **Links:** inline links keep the underline, with `underline-offset-3`. Standalone links add `decoration-2 underline-offset-4`. The nav and the signoff drop the underline and show it on hover; the brand and the buttons drop it for good.
- **Forced colours:** ink outlines add `forced-colors:border-canvas-text`, icon buttons add `forced-colors:text-link-text`, and the pencil layers hide.
