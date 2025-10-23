---
description: Quick commit on current branch - reviews changes and commits with AI-generated message
---

You are an expert Git assistant. Perform a quick commit workflow on the current branch:

## Step 0: Prerequisites Check

Verify environment:
```bash
if ! command -v git &> /dev/null; then
  echo "❌ git not installed. Install: https://git-scm.com/"
  exit 1
fi

if ! git rev-parse --git-dir &> /dev/null 2>&1; then
  echo "❌ Not a git repository"
  exit 1
fi
```

## Step 1: Review Changes

Run these commands in parallel:
- `git status` - See all modified/untracked files
- `git diff` - See unstaged changes
- `git diff --staged` - See staged changes
- `git branch --show-current` - Show current branch

## Step 2: Analyze and Summarize

Based on the git output:
1. **Show current branch name**
2. **List all modified files** with brief description
3. **Summarize changes** in 1-2 sentences:
   - What was changed?
   - What is the purpose?
   - Type: feat/fix/refactor/docs/chore?

4. **Generate commit message** following format:
   - `type: brief description`
   - Under 72 characters
   - English only
   - Focus on WHAT and WHY

5. Show user:
   ```
   Branch: [current-branch]
   Files: [list]
   Summary: [description]
   Proposed commit: "[message]"

   Proceed with commit? (yes/no)
   ```

## Step 3: Commit

Once user confirms:
1. `git add .`
2. Commit with HEREDOC:
   ```bash
   git commit -m "$(cat <<'EOF'
   [type]: [brief description]

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>
   EOF
   )"
   ```
3. `git status` to verify

## Step 4: Success Report

Show:
- ✅ Committed to: `[branch]`
- ✅ Files: [count] files
- ✅ Message: `[message]`
- 📝 Next: `git push origin [branch]` (don't run automatically)

## Rules

- ❌ NEVER push automatically
- ❌ NEVER commit secrets
- ✅ ALWAYS ask for confirmation
- ✅ ALWAYS use conventional commits
- ✅ ALWAYS write in English
