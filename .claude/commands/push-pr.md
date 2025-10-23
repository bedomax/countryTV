---
description: Push changes and create PR with automatic code review and human-friendly description
---

You are an expert Git workflow assistant and PR writer. Push changes safely and create a well-written Pull Request.

## Step 0: Prerequisites Check

Verify environment:
```bash
if ! command -v git &> /dev/null; then
  echo "❌ git not installed"
  exit 1
fi

if ! git rev-parse --git-dir &> /dev/null 2>&1; then
  echo "❌ Not a git repository"
  exit 1
fi

if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI not installed"
  echo "Install: brew install gh (Mac) or https://cli.github.com"
  exit 1
fi
```

## Step 1: Pre-Push Validation

First, perform all validations from the `/push` command:

1. Check for uncommitted changes
2. Get current branch info
3. Review commits to be pushed
4. Check for suspicious commits (WIP, temp, debug - use regex ^(WIP|temp|debug|tmp):)
5. Verify remote tracking
6. Check for remote changes

If any issues found, handle them before continuing (offer to commit, warn about WIP commits, etc.)

## Step 2: Push to Remote

Once validations pass, push the branch:
```bash
git push -u origin [branch-name]
```

Show:
```
📤 Pushing branch to remote...
✅ Push successful!
```

## Step 3: Automatic Code Review (Optional)

Ask user for review preference:
```
🔍 Quick code review before creating PR?
1. Yes, full review (20-30 seconds)
2. Quick security check only (5 seconds) [RECOMMENDED]
3. Skip review, create PR immediately

Choose (1/2/3, default: 2): _
```

If user chooses **Option 2 (Quick check)** - DEFAULT:
- Only scan for: API keys, passwords, secrets, .env files
- Check for: hardcoded credentials, exposed tokens
- Takes <5 seconds
- Show brief result:
```
✅ Security check: No exposed secrets detected
```

If user chooses **Option 1 (Full review)**:
Run these commands to analyze changes:
```bash
git diff origin/main...HEAD        # Full diff vs main
git log origin/main..HEAD --oneline # All commits
git diff --stat origin/main...HEAD  # Files changed summary
```

Analyze and provide assessment:
```
📊 Code Review Summary

Files changed: [N] files
Lines: +[additions] -[deletions]

✅ Strengths:
  • [2-3 positive points]

⚠️ Potential Concerns:
  • [Any issues found - security, performance, bugs]
  • [If none, say "None - looks good!"]

Quality Rating: [Excellent/Good/Needs Review]
```

If **critical issues** found (security, exposed secrets, major bugs):
```
🚨 Critical Issues Found!

❌ [Issue 1]: [Description]
❌ [Issue 2]: [Description]

Recommendation: Fix these before creating PR.

What would you like to do?
1. Cancel and fix issues
2. Create PR anyway (not recommended)
3. Show detailed review
```

If user chooses **Option 3 (Skip)**: Continue immediately to PR creation.

## Step 4: Generate PR Title

Based on the commits and changes, create a **clear, descriptive title**:

**Rules for PR titles**:
- ✅ Start with conventional type: `feat:`, `fix:`, `refactor:`, `docs:`, etc.
- ✅ Be specific but concise (under 72 characters)
- ✅ Focus on WHAT was added/changed/fixed
- ✅ Use present tense: "Add" not "Added", "Fix" not "Fixed"
- ✅ No emojis in title
- ✅ No ticket numbers (those go in description)

**Examples**:
- ✅ `feat: add Spotify playlist integration`
- ✅ `fix: resolve viewer counter reset on cold start`
- ✅ `refactor: optimize YouTube video search algorithm`
- ❌ `Added some stuff` (too vague)
- ❌ `WIP: working on things` (not descriptive)
- ❌ `🎉 New feature` (no emojis)

Show the generated title with streamlined input:
```
📝 PR Title: "[generated-title]"

Press ENTER to accept, or type new title:
> _
```

**Flow**:
- If user presses ENTER → use generated title
- If user types text → use their title
- No "yes/no" question - faster workflow!

## Step 5: Detect Base Branch Automatically

Auto-detect target branch based on naming convention:
```bash
CURRENT_BRANCH=$(git branch --show-current)

# Smart detection
if [[ $CURRENT_BRANCH == hotfix/* ]]; then
  BASE_BRANCH="main"  # or "production" if exists
elif [[ $CURRENT_BRANCH == feature/* ]]; then
  # Check if develop exists
  if git ls-remote --heads origin develop | grep -q develop; then
    BASE_BRANCH="develop"
  else
    BASE_BRANCH="main"
  fi
else
  BASE_BRANCH="main"  # default
fi
```

Show detected base:
```
🎯 Target branch: $BASE_BRANCH (auto-detected)
Press ENTER to confirm, or type different branch:
> _
```

## Step 6: Generate PR Description

Create a **human-friendly, well-structured** PR description.

**IMPORTANT Guidelines**:
- ✅ Write for **humans**, not engineers
- ✅ Explain **why** this change matters
- ✅ Use **simple language**, avoid jargon
- ✅ Be **descriptive** but concise
- ✅ Use **bullet points** for readability
- ✅ Include **before/after** if relevant
- ✅ Add **testing notes** if applicable
- ✅ Mention **breaking changes** if any
- ❌ Don't list technical implementation details
- ❌ Don't copy commit messages
- ❌ Don't use engineer-speak
- ❌ Don't be too brief or too verbose

**Adapt length to PR size**:

Check diff size:
```bash
LINES_CHANGED=$(git diff --stat origin/main...HEAD | tail -1 | awk '{print $4+$6}')
```

**For SMALL PRs (<50 lines changed)** - Use short template:
```markdown
## What Changed
[1-2 sentences]

## Testing
[Quick test if needed]

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**For MEDIUM PRs (50-200 lines)** - Use medium template:
```markdown
## What's New
[1-2 sentences]

## What Changed
- [Key changes]

## How to Test
[Steps]

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**For LARGE PRs (>200 lines)** - Use full template below:

**PR Description Template (Full)**:

```markdown
## What's New

[1-2 sentences explaining what this PR does in simple terms]

## Why This Matters

[Explain the benefit or problem this solves - why should someone care?]

## What Changed

- [Key change 1 - user-facing impact]
- [Key change 2 - user-facing impact]
- [Key change 3 - user-facing impact]

## How to Test

1. [Step 1]
2. [Step 2]
3. [Expected result]

## Screenshots (if applicable)

[Mention if there are visual changes]

## Notes

- [Any important context]
- [Breaking changes if any]
- [Dependencies or requirements]

---

**Checklist**:
- [ ] Code reviewed
- [ ] Tests passing
- [ ] Documentation updated
- [ ] No breaking changes (or documented if any)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**Examples of Good Descriptions**:

### Example 1: Feature
```markdown
## What's New

Added the ability to search your Spotify playlists and add your favorite country songs to Country TV. Now you can personalize your streaming experience with your own music collection!

## Why This Matters

Users wanted a way to add songs they love without waiting for them to appear on Billboard charts. This feature gives them control over their playlist while keeping the country music vibe.

## What Changed

- New "Search Spotify" button in the UI
- Modal window for searching playlists
- Automatic YouTube video matching for found songs
- Songs are added to the main playlist immediately

## How to Test

1. Click the "🎵 Search Spotify" button
2. Enter your Spotify username or playlist URL
3. Browse songs and click "Add to TV"
4. Song should appear in the main playlist

## Notes

- Requires Spotify credentials in `.env` file
- Only adds country music (filters by genre)
- YouTube videos are matched automatically

---

**Checklist**:
- [x] Code reviewed
- [x] Tests passing
- [ ] Documentation updated
- [x] No breaking changes
```

### Example 2: Bug Fix
```markdown
## What's New

Fixed an issue where the viewer counter would reset to zero when the server restarts, making it look like nobody was watching.

## Why This Matters

Users reported feeling alone when they saw "0 viewers" despite others being online. This was happening because the counter wasn't persistent across server restarts.

## What Changed

- Viewer sessions now persist for 15 minutes
- Counter maintains state during brief server hiccups
- More accurate representation of actual viewers

## How to Test

1. Open Country TV in multiple browser tabs
2. Check viewer counter (should be 2+)
3. Restart the server
4. Counter should maintain approximately the same number

## Notes

- Uses in-memory storage (Vercel limitation)
- Count may vary slightly during cold starts
- Real users only (no fake numbers)

---

**Checklist**:
- [x] Code reviewed
- [x] Tests passing
- [x] Documentation updated
- [x] No breaking changes
```

Show the generated description with streamlined input:
```
📄 PR Description:

[show full description]

---

Press ENTER to create PR, or type 'edit' to modify:
> _
```

**Flow**:
- If user presses ENTER → create PR immediately
- If user types 'edit' → let them modify
- Default action: create PR (fastest workflow)

## Step 7: Create Pull Request

Use GitHub CLI to create the PR (base branch was auto-detected in Step 5):

Use GitHub CLI to create the PR:

```bash
gh pr create \
  --title "[title]" \
  --body "[description]" \
  --base [base-branch] \
  --head [current-branch]
```

If `gh` is not installed:
```
❌ GitHub CLI not found!

Install it:
  Mac:     brew install gh
  Windows: winget install GitHub.CLI
  Linux:   See https://cli.github.com

After installing, run: gh auth login
```

## Step 8: Success Message

Once PR is created:
```
✅ Pull Request Created!

🔗 PR URL: [url]
📝 Title: [title]
🎯 Base: [base-branch]
🌿 Head: [current-branch]

📊 Changes:
  • [N] commits
  • [N] files changed
  • +[additions] -[deletions] lines

🤖 Automatic code review will run in ~30 seconds (if configured)

Next steps:
  • View PR: [url]
  • Request reviewers: gh pr review [number] --request-reviewer @user
  • Add labels: gh pr edit [number] --add-label "enhancement"
  • Wait for review and merge!

---

Great job! 🎉
```

## Step 9: Optional Actions (Streamlined)

**Simplified approach** - Only ask if user wants to do more:

```
Want to add reviewers or labels? (yes/no, default: no):
> _
```

If user presses ENTER or says "no" → Done! Exit successfully.

If user says "yes":
```
What would you like to add?
- Reviewers: @user1,@user2
- Labels: enhancement,bug
- Or press ENTER to skip

> _
```

Parse input and apply:
- If contains @ → treat as reviewers
- If contains letters → treat as labels
- Apply both if needed

**Benefits**:
- 1 question instead of 4
- Default is "done" (fast exit)
- Power users can still customize

## Error Handling

### PR Already Exists
```
ℹ️ PR already exists for this branch!

Existing PR: [url]

Would you like to:
1. View existing PR
2. Update PR description
3. Cancel
```

### No Changes to Push
```
ℹ️ No changes to push

Your branch is up to date with remote.
Cannot create PR without changes.

Make some changes first!
```

### Base Branch Conflicts
```
⚠️ Merge conflicts detected!

Your branch conflicts with [base-branch].

You need to:
1. Pull latest: git pull origin [base-branch]
2. Resolve conflicts
3. Try again

Continue anyway? (yes/no)
```

## Important Rules

- ✅ **ALWAYS review code** before creating PR
- ✅ **ALWAYS generate human-friendly** descriptions
- ✅ **ALWAYS check for critical issues** first
- ✅ **ALWAYS push before** creating PR
- ✅ **ALWAYS validate** commits and changes
- ✅ **ALWAYS use clear language** (no jargon)
- ✅ **ALWAYS include testing steps** in description
- ❌ **NEVER create PR** with critical issues without warning
- ❌ **NEVER use technical jargon** in descriptions
- ❌ **NEVER copy commit messages** as PR description
- ❌ **NEVER skip code review** step
- ❌ **NEVER be too brief** or too verbose

## Examples

### Example 1: Happy Path
```
User: /push-pr
Assistant: [Validates changes]
          [Pushes successfully]
          [Reviews code - all good!]
          [Generates title: "feat: add Spotify integration"]
          [Generates human-friendly description]
          [Asks for confirmation]
User: yes
Assistant: [Creates PR]
          ✅ PR created: [url]
```

### Example 2: Critical Issues Found
```
User: /push-pr
Assistant: [Validates]
          [Finds exposed API key]
          🚨 Critical issue: API key hardcoded!

          Fix before creating PR? (yes/no)
User: yes
Assistant: [Cancels]
          Please fix and run /push-pr again
```

### Example 3: User Edits Title
```
User: /push-pr
Assistant: [Everything validated]
          PR Title: "feat: add search feature"
          Is this good?
User: no, use "feat: add Spotify playlist search"
Assistant: ✅ Updated title
          [Continues with PR creation]
```

## Final Notes

- This command combines **safety**, **code review**, and **PR creation**
- Focus on **human-readable** descriptions over technical details
- Always **explain the WHY**, not just the WHAT
- Make PRs **easy to review** and understand
- Be **thorough but not overwhelming**

---

**Remember**: A good PR is one that anyone can understand, not just engineers!
