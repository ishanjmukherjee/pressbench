# Project

Pressbench logs the user's strength as a proxy for aesthetics. It will be a
static site served at https://ishanjmukherjee.github.io/pressbench with a few
simple plots: for each lift, a linear line from a starting point to a target
N months out, with the real datapoints plotted alongside.

All lifts are weighted; there are no bodyweight lifts. The y-axis is the
Epley-implied load at the lift's target reps: 20 for wrist curl ins, 10 for
everything else. For a set of `r` reps at load `w`, that is
`w * (30 + r) / 40` at 10 reps, or `w * (30 + r) / 50` at 20 reps. Each point
also marks the actual weight lifted, unobtrusively.

The user reports sets in agent sessions. Each set goes in the Workout Log
Google Sheet
(https://docs.google.com/spreadsheets/d/1vbwOJGCh1Xv6aR7FNua1aPG77t7kODYGgVRWAD7KpI8),
written through the Google Sheets connector with the time of the report. Only
the first set of each lift on a given day becomes a datapoint on the plot, and
that datapoint is recorded with a commit to this repository.

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
