# Agent Protocol

## 1. Worklogs

### 1.1. Granular Worklog (Long-term Memory)
- **Action:** Every change requires a worklog file.
 - **Path:** `agents/worklogs/YYYY-MM-DD-HH-mm-{short-desc}.md`
  - **Date and time:** Use `date` command to fetch date and time.
- **Front Matter (Strict):** Must contain ONLY these keys:
  ```yaml
  ---
  when: 2026-02-14T12:00:00Z  # ISO 8601 UTC
  why: one-sentence reason
  what: one-line summary
  model: model-id (e.g. github-copilot/gpt-4)
  tags: [list, of, tags]
  ---
  ```
- **Body:** 1–3 sentences summarizing changes and files touched, and don't add redundant information about creating worklog.
- **Safety:** NO secrets, API keys, or prompt text.
- **Template:** agents/WORKLOG_TEMPLATE.md
- **Validate:** ALWAYS validate the worklog with scripts/validate_worklogs.sh

### 1.2. State Compaction (Short-term Memory)
- **Action:** Immediately after creating a granular log, create or update `agents/CONTEXT.md`.
- **Constraint:** This file MUST stay under 20 lines.
- **Structure:**
    - **Overall Context:** A concise summary of the current state of the system, including any relevant notes or observations. Don't add redundant information.
    - **Current Goal:** The high-level "vibe" we are chasing right now.
    - **Last 3 Changes:** Bullet points referencing the last 3 worklog filenames.
    - **Next Steps:** The immediate next 2 tactical moves.

-### 1.3. Context Hygiene
- **Rule:** If `agents/CONTEXT.md` exceeds 20 lines, the agent must "garbage collect" by moving older tactical notes into a new worklog and resetting the `agents/CONTEXT.md` to the current priority only.
- **Safety:** Never include raw code snippets or secrets in these files; use descriptive summaries only.

## 2. Workflow
1. **Context:** Read recent logs in `agents/CONTEXT.md`.
2. **Code:** Reach the goal of instructions.
3. **Test:** Create, and run unit tests.
    - **Test fail**: Problem solve, code and test until success.
    - **Improve unit tests:** (Optional) Improve edge case testing.
4. **Version:** Bump version using `scripts/bump-version.sh` (SemVer).
    - **Patch:** Bug fixes (0.0.x)
    - **Minor:** New features (0.x.0)
    - **Major:** Breaking changes (x.0.0)
5. **Create:** Generate the worklog file BEFORE committing. Validate worklog file.
6. **Update:** Update short term memory, `agents/CONTEXT.md`. 
7. **Commit:** Commit changes + worklog.
   - **Commit message:** Conventional commit message format.

## 3. Versioning
- **Rule:** EVERY commit MUST bump the version in `src/sw.js`.
  - **Patch (0.0.x):** Bug fixes, refactors, documentation updates
  - **Minor (0.x.0):** New features, enhancements
  - **Major (x.0.0):** Breaking changes, API changes
- **Tool:** Always use `scripts/bump-version.sh [patch|minor|major]`
- **Action:** Mention the new version in the worklog body.
- **Why:** Service worker cache invalidation requires version bumps for users to receive updates.

## 4. Enforcement
- Worklogs must validate against the schema above.
- If `scripts/bump-version.sh` exists, use it. Otherwise, update manually.
- Do not create Github Actions, or any CI/CD under `.github`.
