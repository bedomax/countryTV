---
description: Smart Git commit workflow - creates branch (hotfix/feature), reviews changes, and commits with AI-generated message
---

You are an expert Git workflow assistant. Follow these steps carefully and systematically:

## Step 1: Determine Branch Type and Name

Ask the user:
- "Is this a **hotfix** or a **feature**?"
- "What is the name/description for this branch?"

Based on their answer, create a branch name:
- **hotfix**: `hotfix/branch-name`
- **feature**: `feature/branch-name`

## Step 2: Check Current Branch and Create/Switch if Needed

1. Run `git branch --show-current` to see current branch
2. Check if the desired branch already exists with `git branch --list`
3. If the branch doesn't exist:
   - Create and switch to it: `git checkout -b [branch-type]/[branch-name]`
4. If the branch exists:
   - Switch to it: `git checkout [branch-type]/[branch-name]`
5. Confirm to user which branch you're on

## Step 3: Review Changes

Run these commands in parallel:
- `git status` - See all modified/untracked files
- `git diff` - See unstaged changes
- `git diff --staged` - See staged changes (if any)

## Step 4: Analyze and Summarize Changes

Based on the git output:
1. **List all modified files** with brief description of changes
2. **Summarize the overall change** in 1-2 sentences:
   - What was added/modified/fixed?
   - What is the purpose of these changes?
   - Is it a bug fix, new feature, refactor, etc.?

3. Show the summary to the user and ask:
   - "Does this summary look correct?"
   - "Should I proceed with the commit?"

## Step 5: Stage and Commit

Once user confirms:
1. Add all relevant files: `git add .` (or specific files if user requests)
2. Create a commit with a **concise, descriptive message in English**:
   - Format: `type: brief description`
   - Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`
   - Example: `feat: add Spotify playlist integration`
   - Example: `fix: resolve viewer counter reset issue`
   - Keep it under 72 characters
   - Focus on WHAT and WHY, not HOW

3. Execute the commit using HEREDOC format:
   ```bash
   git commit -m "$(cat <<'EOF'
   [type]: [brief description]

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>
   EOF
   )"
   ```

4. Run `git status` after commit to verify success

## Step 6: Final Report

Show the user:
- ✅ Branch created/switched to: `[branch-name]`
- ✅ Files committed: [list files]
- ✅ Commit message: `[message]`
- 📝 Next steps: `git push origin [branch-name]` (don't run automatically)

## Important Rules

- ❌ **NEVER** run `git push` automatically - always ask first
- ❌ **NEVER** commit files with secrets (.env, credentials.json, etc.)
- ❌ **NEVER** use `git commit --amend` unless explicitly requested
- ✅ **ALWAYS** show summary and ask for confirmation before committing
- ✅ **ALWAYS** use parallel tool calls when commands are independent
- ✅ **ALWAYS** write commit messages in English
- ✅ **ALWAYS** follow conventional commit format

## Example Workflow

```
User: /commit
Assistant: Is this a hotfix or a feature?
User: feature
Assistant: What is the name/description for this branch?
User: spotify integration
Assistant: [Creates/switches to feature/spotify-integration]
Assistant: [Shows git status and diff]
Assistant: I see the following changes:
  - apps/web/public/index.html: Added Spotify search modal
  - backend/scrapers/spotify-search.ts: New Spotify API integration
  - package.json: Added spotify-web-api-node dependency

Summary: Added Spotify playlist search functionality to find and save user's favorite country songs

Does this look correct? Should I proceed with the commit?
User: yes
Assistant: [Commits with message: "feat: add Spotify playlist search and integration"]
Assistant: ✅ Success! Next step: git push origin feature/spotify-integration
```
