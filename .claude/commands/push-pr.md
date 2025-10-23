---
description: Push changes and create PR with automatic code review and human-friendly description
---

You are an expert Git workflow assistant and PR writer. Push changes safely and create a well-written Pull Request.

## Step 1: Pre-Push Validation

First, perform all validations from the `/push` command:

1. Check for uncommitted changes
2. Get current branch info
3. Review commits to be pushed
4. Check for suspicious commits (WIP, temp, test)
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

## Step 3: Automatic Code Review

Before creating the PR, perform an automatic code review:

```
🔍 Running code review before creating PR...
```

Run these commands to analyze changes:
```bash
git diff origin/main...HEAD        # Full diff vs main
git log origin/main..HEAD --oneline # All commits
git diff --stat origin/main...HEAD  # Files changed summary
```

Analyze the changes and provide a **quick assessment**:

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

If issues are minor or none, continue automatically.

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

Show the generated title:
```
📝 PR Title:
[generated-title]

Is this title good? (yes/no/edit)
```

If user says "edit", ask: "What title would you like?"

## Step 5: Generate PR Description

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

**PR Description Template**:

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

Show the generated description:
```
📄 PR Description:

[show full description]

---

Is this description good? (yes/no/edit)
```

If user says "edit", ask: "What would you like to change?"

## Step 6: Determine Base Branch

Ask the user:
```
🎯 Which branch should this PR target?

1. main (default)
2. develop
3. Other (specify)

Choose: (1/2/3 or branch name)
```

If user doesn't respond, default to `main`.

## Step 7: Create Pull Request

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

## Step 9: Optional Actions

Ask the user:
```
Would you like to:
1. Add reviewers
2. Add labels
3. View PR in browser
4. Nothing, I'm done

Choose: (1/2/3/4)
```

Handle each option:

**1. Add reviewers:**
```
Who should review this PR? (GitHub usernames, comma-separated)
Example: @user1,@user2
```

Then run:
```bash
gh pr edit [number] --add-reviewer [users]
```

**2. Add labels:**
```
Which labels? (comma-separated)
Common: enhancement, bug, documentation, performance
```

Then run:
```bash
gh pr edit [number] --add-label [labels]
```

**3. View in browser:**
```bash
gh pr view [number] --web
```

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
