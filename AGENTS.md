# Logging sets

The user reports sets in short, informal messages ("curls 12", "10 AMRAP
decline pushups", "lat raises 10 lbs per hand, 5 reps"), often late at night.
For each set: append a row to the Workout Log sheet, and if it is the first set
of that lift on that workout day, also add it to `data/sets.csv`, commit, and
push to `main`. The defaults below fill in missing details; ask for
clarification only when they do not cover something.

## Interpreting a report

- Every set is to failure unless the user says otherwise. Do not ask about RPE
  or effort.
- A bare number, or one in parentheses, is reps, not sets.
- Weight: if none is named, use the last logged weight for that exercise.
- Exercise: if only a muscle group is named ("triceps, 10 per arm"), use the
  exercise most recently logged for that group.
- Weights the user names for dumbbell lifts are plates per hand. The dumbbell
  bar weighs 5 lb, so the real weight is plates + 5.
- For pushups the user reports the bag weight. The pushup weight is the total,
  bag plus the latest bodyweight in `data/bodyweight.json`. When the user
  reports a new bodyweight, update that file with the value and the workout
  day, and commit it with the set.
- If the arms differ ("22 right / 25 left"), the weaker arm's reps count for the
  plot.
- If the user corrects an earlier set ("sorry, that was 22.5"), fix that sheet
  row in place, and the matching `data/sets.csv` row if there is one.

## Exercises

| Sheet name | Lift id | Muscle group | Target reps |
| --- | --- | --- | --- |
| Bicep curls | `bicep-curls` | biceps | 10 |
| Lateral raises | `lateral-raises` | shoulders, delts | 10 |
| Overhead tricep extensions | `overhead-tricep-extensions` | triceps | 10 |
| Wrist curl ins | `wrist-curl-ins` | forearms | 20 |
| Reverse curls | `reverse-curls` | forearms, brachioradialis | 10 |
| Weighted pushups (decline or flat) | `pushups` | chest | 10 |

Reverse curls replace wrist curl outs. Pushups default to the variation last
logged.

## Time and workout day

- Get the current time with `TZ=America/Chicago date '+%b %-d, %Y %-I:%M %p'`.
  The user is in Central time.
- A set reported before 6:00 AM belongs to the previous calendar day. Use that
  day in the sheet's Date column and in `data/sets.csv`, and note the real time.

## Sheet row

Sheet: https://docs.google.com/spreadsheets/d/1vbwOJGCh1Xv6aR7FNua1aPG77t7kODYGgVRWAD7KpI8,
tab `Workout Log`. Append one row per set through the Google Sheets connector:

| Column | Content | Example |
| --- | --- | --- |
| Date | workout day | `Nov 13, 2026` |
| Exercise | sheet name from the table above | `Bicep curls` |
| Sets | always `1` | `1` |
| Reps | per arm, or both arms when they differ | `12 reps each arm`, `22 reps right / 25 reps left` |
| Notes | time, weight as reported (plates, or bag plus bodyweight for pushups) and whether it was defaulted, to failure | `~10:18 PM CT; 25 lb (last logged weight); to failure` |
| Set debt balance | running balance, see below | `17` |

## Set debt balance

There is a daily quota of 3 sets. The balance counts sets owed, not counting
today's quota. To compute it for a new row:

1. Start from the most recent non-blank balance in the sheet.
2. For each workout day after that row's day and before today, and for that
   row's own day if today is later, add 3 minus the sets logged that day (never
   less than 0).
3. If this set is beyond the third set logged today, subtract 1.

State the new balance in the reply. Otherwise keep replies minimal: no
congratulations and no commentary on the hour; the user says when they are done
for the day.

## Plot data

Only the first set of each lift on each workout day goes on the plot, because
the first set, done fresh, is the proxy for strength. Append it to
`data/sets.csv` as `date,lift,weight,reps`:

- `date` is the workout day as `YYYY-MM-DD`.
- `lift` is the lift id from the table above.
- `weight` is the real weight: plates + 5 for dumbbell lifts, bag plus
  bodyweight for pushups. For a decline pushup set, multiply the total by
  0.70 / 0.64 and round to 0.1, which converts it to its flat equivalent.
- `reps` is the weaker arm's reps.

Commit `data/sets.csv`, plus `data/bodyweight.json` if it changed, with a
subject like `Log bicep curls 30 x 12`, and push to `main`.

# User preferences

## No attribution to coding agent

- Never add `Co-Authored-By` trailers to git commits.
- Never add "Generated with ..." or other coding agent/company signature lines
  to commits or PRs.

## Tests

- Do not add tests or functionally modify tests unless explicitly requested.
- Mechanical fixes that preserve test behavior are allowed.
- You may proactively propose a test when you believe one is necessary, but wait
  for approval before implementing it.

## Git worktree layout

- For repository `<repo>` under `<git-root>`, use a layout with
  sibling-directory worktrees with explicit branch names:
  - Container: `<git-root>/<repo>-wt/`
  - Primary checkout: `<git-root>/<repo>-wt/<repo>/`
  - Linked worktrees: `<git-root>/<repo>-wt/<worktree-name>/`
- Place linked worktrees directly beside the primary checkout.
- Never nest worktrees inside the primary checkout.

## No decorative comment lines

- No `# -----`, `# =====`, ASCII bars, `############`, or similar decoration.
- No banner-style section headers such as `# ----- Reward -----` or `# ======
  Section ======`. A bare `# Reward` is the most to use as a section label;
  prefer extracting the section into a docstring.
- This applies to code, docstrings, config files, and Markdown.

## Commit authoring style

- Before authoring any commit, inspect a representative sample of recent
  repository commits and follow the prevailing conventions for subject wording,
  capitalization, prefixes or scopes, body structure, and issue references.

## Audience scope

- Do not leak session-internal planning terminology such as "phase 1/2", "the
  workaround we discussed", or "step 3 of the plan" into commit messages, PR
  titles and descriptions, code comments, or other documentation. External
  reviewers cannot see the chat. "Multi-instance vLLM prototype" is better than
  "phase 1".

## Reasoning transparency

- When describing a fix, distinguish observation from inference and anchor
  claims to the smallest defensible version. "Un-nests the padding gate so it
  runs at ep=1+FSDP2" is better than "fixes the strides error" when the only
  evidence is that the gate now fires.
- Hedge where there is actual uncertainty, not where direct evidence supports a
  claim. "Previously failing test now passes" is simply true. Reasoning
  transparency is for verifying causal claims, not a tax on every sentence.

## Patching dependencies

- Never edit package-manager-owned dependency files; undeclared changes are not
  reproducible from manifests and lockfiles.
- Prefer, in order: supported configuration or extension points, wrapping or
  subclassing, a documented runtime patch, an idempotent repository patch
  applied during installation, or a fork pinned to an immutable revision.
