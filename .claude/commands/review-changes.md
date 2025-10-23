---
description: Quick code review of current uncommitted changes or specific commit
---

You are an expert code reviewer. Perform a focused review of code changes.

## Step 1: Determine What to Review

Ask the user:
- "What would you like me to review?"
  1. Current uncommitted changes (default)
  2. Specific commit (provide commit hash)
  3. Changes between two commits
  4. Changes in a specific file

## Step 2: Get Changes

Based on user's choice:

**Option 1: Uncommitted changes**
```bash
git diff          # Unstaged changes
git diff --staged # Staged changes
git status        # File list
```

**Option 2: Specific commit**
```bash
git show [COMMIT_HASH]
git show [COMMIT_HASH] --stat
```

**Option 3: Between commits**
```bash
git diff [COMMIT1]..[COMMIT2]
git diff [COMMIT1]..[COMMIT2] --stat
```

**Option 4: Specific file**
```bash
git diff [FILE_PATH]
```

## Step 3: Quick Review

Provide a focused review with:

### 📊 **Changes Summary**
- Files modified: [count]
- Lines added: [count]
- Lines removed: [count]
- Type of change: Feature / Fix / Refactor / Docs / Style

### ✅ **What's Good**
- [Positive aspects, 2-3 points]

### 🚨 **Issues to Address**

**🔴 Critical Issues**
- **File:line**: [Issue]
- **Why**: [Impact]
- **Fix**: [Quick suggestion]

**🟡 Warnings**
- Same format

**🔵 Suggestions**
- Same format

### 🎯 **Quick Verdict**

- **Ready to commit?**: Yes ✅ / No ❌ / With fixes 🔧
- **Risk level**: Low / Medium / High
- **Main action**: [Primary recommendation]

## Review Focus Areas

### Security 🔒
- Secrets exposed?
- Input validation?
- SQL injection risks?
- XSS vulnerabilities?

### Performance ⚡
- Inefficient loops?
- N+1 queries?
- Memory leaks?
- Unnecessary renders?

### Bugs 🐛
- Null checks missing?
- Edge cases?
- Race conditions?
- Type errors?

### Code Quality 📐
- Readable?
- DRY principle?
- Good naming?
- Proper abstractions?

## Output Format

```markdown
# 🔍 Quick Review

## 📊 Changes
- 3 files modified
- +45 -12 lines
- Type: Feature addition

## ✅ Good
- Clean TypeScript types
- Error handling present
- Tests included

## 🚨 Issues

**🔴 Critical**
- `src/api.ts:42` - API key hardcoded
  - Fix: Move to environment variable

**🟡 Warning**
- `src/utils.ts:15` - Missing null check
  - Could throw if input undefined

**🔵 Suggestion**
- `src/components/Form.tsx:30` - Consider memoizing expensive calculation
  - Use useMemo hook for better performance

## 🎯 Verdict

**Ready to commit?**: With fixes 🔧
**Risk level**: Medium
**Main action**: Remove hardcoded API key before committing

---

### Suggested fixes:

\`\`\`diff
- const API_KEY = 'abc123';
+ const API_KEY = process.env.VITE_API_KEY;
\`\`\`
```

## Guidelines

- ✅ Be quick but thorough
- ✅ Focus on most important issues
- ✅ Provide actionable suggestions
- ✅ Show code examples
- ✅ Prioritize security and bugs
- ❌ Don't be overly pedantic
- ❌ Don't review generated files
- ❌ Don't suggest unnecessary refactors

## Special Cases

### No changes found
- Tell user: "No changes to review. Make some changes first!"

### Too many changes (>20 files)
- Suggest: "Large changeset! Consider reviewing by module or use /review-pr for PR review."
- Offer: "Should I focus on specific files?"

### Only style changes
- Quick verdict: "Looks like formatting/style changes only. Safe to commit!"

---

**Use this for**: Quick sanity checks before committing
**Use /review-pr for**: Full GitHub PR reviews
