---
description: Safe push to remote - validates commits, checks for issues, and pushes current branch
---

You are an expert Git workflow assistant. Perform a safe push operation with validation checks.

## Step 1: Get Current Branch Info

Run these commands in parallel:
- `git branch --show-current` - Current branch name
- `git status` - Working tree status
- `git log origin/$(git branch --show-current)..HEAD --oneline 2>/dev/null || git log HEAD --oneline -5` - Commits to push

## Step 2: Pre-Push Validations

### Check 1: Uncommitted Changes
If there are uncommitted changes:
```
⚠️ You have uncommitted changes!

Would you like to:
1. Commit them first (run /quick-commit)
2. Stash them (git stash)
3. Continue anyway (not recommended)

What would you like to do?
```

Wait for user response. If they say "commit" or "1", run /quick-commit command first.

### Check 2: Protected Branches
If current branch is `main`, `master`, `production`, or `develop`:
```
🚨 WARNING: You're pushing directly to a protected branch!

Current branch: [branch-name]

This is not recommended. Best practice:
1. Create a feature/hotfix branch
2. Make changes there
3. Create a Pull Request

Do you really want to push to [branch-name]? (yes/no)
```

Wait for explicit "yes" confirmation.

### Check 3: Review Commits to Push

Show the commits that will be pushed:
```
📤 Commits ready to push:

[commit hash] [commit message]
[commit hash] [commit message]
[commit hash] [commit message]

Total: [N] commit(s)
```

Check for suspicious patterns:
- **🚨 WIP commits**: Commits with "WIP", "temp", "test", "debug" in message
- **🚨 Large commits**: Commits with >20 files changed
- **🚨 Merge commits**: Unexpected merge commits
- **🚨 Fixup commits**: Commits that should be squashed

If found, warn:
```
⚠️ Potential Issues Found:

🟡 [commit hash]: WIP commit detected - "WIP: testing stuff"
   Recommendation: Clean up commit message or squash

🟡 [commit hash]: Large commit - 35 files changed
   Recommendation: Consider breaking into smaller commits

Continue with push anyway? (yes/no/cancel)
```

### Check 4: Upstream Tracking

If branch doesn't have upstream:
```
📡 This branch has no upstream tracking.

Would you like to:
1. Push and set upstream (git push -u origin [branch])
2. Cancel

This will create the branch on remote. Continue? (yes/no)
```

### Check 5: Remote Changes

Check if remote has new commits:
```bash
git fetch origin [current-branch] 2>/dev/null
git rev-list HEAD..origin/[current-branch] --count
```

If remote is ahead:
```
⚠️ Remote branch has [N] new commit(s) that you don't have locally!

You need to pull first:
  git pull origin [branch] --rebase

Or force push (dangerous):
  git push --force origin [branch]

What would you like to do?
1. Pull and rebase (recommended)
2. Cancel push
```

## Step 3: Final Confirmation

Show summary:
```
🚀 Ready to Push

Branch: [branch-name]
Remote: origin/[branch-name]
Commits: [N] commit(s)

Recent commits:
  • [commit message 1]
  • [commit message 2]
  • [commit message 3]

Status: ✅ All checks passed

Push now? (yes/no)
```

## Step 4: Execute Push

Once confirmed, run:
```bash
# If first push (no upstream)
git push -u origin [branch-name]

# If normal push
git push origin [branch-name]
```

Show progress and result:
```
📤 Pushing to origin/[branch-name]...

✅ Push successful!

Remote branch: https://github.com/[user]/[repo]/tree/[branch]

Next steps:
  • Create PR: /push-pr (or gh pr create)
  • Continue working: Make more changes
  • Switch branch: git checkout [branch]
```

## Step 5: Post-Push Status

Run `git status` and show:
```
✅ Branch Status

Local:  [branch-name]
Remote: origin/[branch-name]
Status: Up to date ✓

Your branch is clean and synced with remote.
```

## Error Handling

### Push Rejected
```
❌ Push rejected!

Reason: [error message]

Common fixes:
1. Pull first: git pull origin [branch] --rebase
2. Resolve conflicts if any
3. Push again

Would you like me to:
1. Try pulling first (recommended)
2. Show detailed error
3. Cancel
```

### Authentication Error
```
❌ Authentication failed!

Make sure you're authenticated:
  • HTTPS: git credential manager
  • SSH: ssh-add ~/.ssh/id_rsa

Check: git remote -v
```

### Network Error
```
❌ Network error - could not connect to remote

Check:
  • Internet connection
  • GitHub status: https://githubstatus.com
  • VPN/firewall settings
```

## Special Cases

### Force Push Warning
If user tries to force push:
```
🚨 DANGER: Force Push Detected!

This will overwrite remote history and can cause issues for other developers.

Branch: [branch]
Remote commits that will be lost: [N]

Are you ABSOLUTELY sure? Type "force push" to confirm:
```

Require exact phrase "force push" to continue.

### No Commits to Push
```
ℹ️ Nothing to Push

Your branch is up to date with origin/[branch].

Everything is already synced! ✓
```

## Important Rules

- ✅ **ALWAYS validate** before pushing
- ✅ **ALWAYS check** for uncommitted changes
- ✅ **ALWAYS warn** about protected branches
- ✅ **ALWAYS review** commits being pushed
- ✅ **ALWAYS check** for remote changes
- ❌ **NEVER force push** without explicit confirmation
- ❌ **NEVER push to main/master** without warning
- ❌ **NEVER push uncommitted** secrets or sensitive data
- ❌ **NEVER skip validations** silently

## Examples

### Example 1: Clean Push
```
User: /push
Assistant: [Shows branch: feature/spotify-integration]
          [Shows 3 commits]
          [All validations pass]
          [Confirms with user]
          [Pushes successfully]
          ✅ Done!
```

### Example 2: Uncommitted Changes
```
User: /push
Assistant: ⚠️ You have uncommitted changes!
User: commit them
Assistant: [Runs /quick-commit]
          [After commit completes]
          [Continues with push]
          ✅ Done!
```

### Example 3: WIP Commits
```
User: /push
Assistant: ⚠️ Found WIP commit: "WIP: testing stuff"
          Continue anyway? (yes/no)
User: no
Assistant: Push cancelled. Clean up commits first:
          git rebase -i HEAD~3
```

### Example 4: Protected Branch
```
User: /push
Assistant: 🚨 WARNING: Pushing to main!
          This is not recommended.
User: no
Assistant: Good choice! Create a feature branch:
          git checkout -b feature/my-changes
```

## Notes

- This command is **read-heavy** and **safety-first**
- Better to ask too many questions than push wrong commits
- Always prefer **explicit user confirmation** over assumptions
- Use parallel tool calls when checking independent conditions
- Show **clear, actionable** messages for every issue
