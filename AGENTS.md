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
