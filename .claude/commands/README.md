# Claude Commands - Country TV

Custom slash commands for Git workflow automation and code review in Claude Code.

## ⚡ Quick Reference

| Command | What It Does | When to Use |
|---------|--------------|-------------|
| `/commit` | Create branch + commit | Starting new feature/hotfix |
| `/quick-commit` | Fast commit on current branch | Iterative development |
| `/push` | Safe push with validation | Backup work to remote |
| `/push-pr` | Push + review + create PR | Feature complete, ready for review |
| `/review-changes` | Quick review of changes | Before committing |
| `/review-pr` | Full PR code review | Review PRs (yours or teammates) |

### 🎯 Common Workflows

**New Feature**: `/commit` → code → `/quick-commit` → code → `/push-pr` → merge
**Quick Fix**: `/commit` → fix → `/quick-commit` → `/push-pr`
**Backup Work**: `/quick-commit` → `/push`
**Review PR**: `/review-pr` → give feedback

---

## 📦 Available Commands

### Git Workflow Commands

#### `/commit` - Smart Git Commit Workflow

Full workflow for creating branches and committing changes.

**What it does:**
1. Asks if this is a `hotfix` or `feature`
2. Asks for branch name
3. Creates/switches to branch (e.g., `feature/spotify-integration`)
4. Reviews all changes with `git status` and `git diff`
5. Summarizes what changed
6. Asks for confirmation
7. Commits with AI-generated conventional commit message
8. Shows next steps (push command)

**When to use:**
- Starting new features or hotfixes
- Need to create a new branch
- Want full review of changes before commit

**Example:**
```
You: /commit
Claude: Is this a hotfix or a feature?
You: feature
Claude: What is the name/description for this branch?
You: add manual song tool
Claude: [Creates feature/add-manual-song-tool, reviews changes, commits]
```

---

#### `/quick-commit` - Quick Commit on Current Branch

Fast commit workflow when you're already on the correct branch.

**What it does:**
1. Shows current branch
2. Reviews changes with `git status` and `git diff`
3. Summarizes changes
4. Generates commit message
5. Asks for confirmation
6. Commits with conventional format
7. Shows next steps

**When to use:**
- Already on correct branch
- Quick commits during development
- Iterative changes on same feature

**Example:**
```
You: /quick-commit
Claude:
  Branch: feature/spotify-integration
  Files: 3 modified
  Summary: Added Spotify search modal to index.html
  Proposed commit: "feat: add Spotify playlist search modal"

  Proceed with commit? (yes/no)
You: yes
Claude: [Commits and shows success message]
```

---

#### `/push` - Safe Push to Remote

Safely push your current branch to remote with comprehensive validation checks.

**What it does:**
1. Checks for uncommitted changes
2. Reviews all commits that will be pushed
3. Validates commit quality (no WIP, temp, test commits)
4. Warns about protected branches (main, master, production)
5. Checks if remote has new changes (pull needed)
6. Confirms before pushing
7. Pushes to remote safely

**When to use:**
- Ready to push your branch to GitHub
- Want validation before pushing
- Ensure no mistakes in commits
- Safety check before sharing code

**Example:**
```
You: /push
Claude:
  Branch: feature/spotify-integration
  Commits to push: 3

  ✅ All validations passed
  • No uncommitted changes
  • No suspicious commits
  • Remote is up to date

  Push now? (yes/no)
You: yes
Claude: ✅ Pushed successfully!
        Remote: https://github.com/user/repo/tree/feature/spotify-integration
```

**Safety features:**
- 🚨 Blocks push to main/master without confirmation
- ⚠️ Warns about WIP/test/debug commits
- 🔍 Checks for uncommitted changes first
- 📡 Verifies remote tracking
- ⚡ Detects if pull is needed first

---

#### `/push-pr` - Push and Create Pull Request

Push your branch and create a well-written Pull Request with automatic code review.

**What it does:**
1. Validates and pushes branch (same as `/push`)
2. Runs automatic code review of changes
3. Generates clear, human-friendly PR title
4. Creates descriptive PR description (not technical jargon)
5. Creates PR on GitHub
6. Offers to add reviewers/labels

**When to use:**
- Feature is complete and ready for review
- Want to create PR with good description
- Need automatic code quality check
- Ready to share work with team

**Example:**
```
You: /push-pr
Claude:
  📤 Pushing branch...
  ✅ Pushed!

  🔍 Running code review...

  📊 Review Summary:
  Files: 5 changed (+230 -45)
  Quality: Good ✅
  Issues: None critical

  📝 PR Title: "feat: add Spotify playlist integration"

  📄 PR Description:
  ## What's New
  Added ability to search Spotify playlists and add favorite
  country songs to Country TV...

  [Full human-friendly description]

  Is this good? (yes/no)
You: yes
Claude: ✅ PR Created!
        🔗 https://github.com/user/repo/pull/42
```

**Special features:**
- 🔍 Automatic code review before creating PR
- 📝 Human-friendly descriptions (not engineer-speak)
- ✅ Explains WHY changes matter, not just WHAT
- 🎯 Includes testing instructions
- 🤖 Professional but readable

---

### Code Review Commands

#### `/review-pr` - Comprehensive Pull Request Review

Full code review of GitHub Pull Requests with security, performance, and best practices analysis.

**What it does:**
1. Asks for PR number or URL
2. Fetches PR details using GitHub CLI (`gh`)
3. Reviews all changed files thoroughly
4. Analyzes: Security, Performance, Bugs, Architecture, Testing, Documentation
5. Provides detailed feedback with code examples
6. Rates code quality and gives recommendation (Approve/Request Changes)
7. Optionally posts review comment to GitHub

**When to use:**
- Reviewing team member's Pull Requests
- Pre-merge quality checks
- Learning from code reviews
- Getting second opinion on your own PRs

**Requirements:**
- GitHub CLI installed: `brew install gh` (Mac)
- Authenticated: `gh auth login`
- Access to the repository

**Example:**
```
You: /review-pr
Claude: What is the Pull Request number or URL?
You: 123
Claude: [Fetches PR #123]
        [Reviews all files]
        [Provides comprehensive analysis]

        📊 Changes: 5 files, +230 -45 lines
        ✅ Strengths: [3 points]
        🚨 Issues: 2 critical, 3 warnings, 5 suggestions
        🎯 Verdict: Request Changes

        Would you like me to post this review to GitHub?
You: yes
Claude: [Posts review comment to PR]
```

**Review covers:**
- 🔒 Security vulnerabilities (XSS, SQL injection, exposed secrets)
- ⚡ Performance issues (N+1 queries, memory leaks, inefficient algorithms)
- 🐛 Potential bugs (null checks, edge cases, race conditions)
- 📐 Architecture & design patterns
- 🧪 Test coverage and quality
- 📝 Documentation completeness
- 🎨 Code style and conventions

---

#### `/review-changes` - Quick Review of Current Changes

Fast code review of uncommitted changes or specific commits.

**What it does:**
1. Asks what to review (uncommitted/commit/range/file)
2. Gets the diff
3. Quick focused review of key issues
4. Provides verdict: Ready to commit? Yes/No/With fixes

**When to use:**
- Quick sanity check before committing
- Review your own changes
- Check specific commits
- Focus on particular files

**Example:**
```
You: /review-changes
Claude: What would you like me to review?
You: current changes
Claude: [Reviews uncommitted changes]

        📊 3 files, +45 -12 lines
        ✅ Good: Clean types, error handling
        🚨 Issues: 1 critical (hardcoded API key)
        🎯 Verdict: Fix API key before committing
```

**Perfect for:**
- Pre-commit checks
- Learning and improving
- Catching mistakes early
- Quick feedback loop

---

## Commit Message Format

Both commands use **Conventional Commits** format:

```
type: brief description

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **refactor**: Code refactoring
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, configs, etc.)

### Examples

- `feat: add Spotify playlist integration`
- `fix: resolve viewer counter reset on cold start`
- `refactor: optimize YouTube video search logic`
- `docs: update README with deployment guide`
- `chore: add npm script for manual song additions`

---

## Safety Features

Both commands include safety checks:

- ✅ **Always ask confirmation** before committing
- ✅ **Never push automatically** - you control when to push
- ✅ **Warn about secrets** - won't commit .env, credentials, etc.
- ✅ **Show full summary** - you see what will be committed
- ✅ **Conventional format** - consistent commit history
- ✅ **English messages** - standard language for commits

---

## 🔄 Workflow Examples

### Scenario 1: Full Feature Development (Complete Workflow)

```bash
# 1. Start new feature
/commit
> feature
> spotify-integration

# 2. Make changes to code...

# 3. Commit changes
/quick-commit

# 4. Make more changes...
/quick-commit

# 5. Review changes before pushing
/review-changes
> Fix any issues found

# 6. Push and create PR (all in one!)
/push-pr
> yes

# 7. PR is created with:
#    - Code review done ✅
#    - Human-friendly description ✅
#    - Ready for team review ✅

# 8. Address feedback if any and merge
```

### Scenario 2: Quick Push Without PR

```bash
# Already on feature branch
# Made some commits

# Want to backup to remote without creating PR
/push

# Validates commits, checks everything
# Pushes safely to remote
# Continue working...
```

### Scenario 3: Hotfix (Fast Track)

```bash
# Critical bug fix needed!
/commit
> hotfix
> viewer-counter-reset

# Fix the bug...

# Commit the fix
/quick-commit

# Push and create PR immediately
/push-pr
> Target: main (hotfix)
> yes

# PR created and ready for emergency merge
```

### Scenario 4: Iterative Development

```bash
# Working on feature
/commit
> feature
> new-dashboard

# Implement part 1
/quick-commit

# Implement part 2
/quick-commit

# Implement part 3
/quick-commit

# Review all changes
/review-changes

# Push without PR (not ready yet)
/push

# Continue working tomorrow...
# When ready:
/push-pr
```

### Scenario 5: Reviewing PRs

```bash
# Teammate created PR #42
/review-pr
> 42

# Get detailed review with:
# - Security analysis
# - Performance checks
# - Bug detection
# - Quality assessment

# Post review to GitHub
> yes

# Later, review your own PR
/review-pr
> 50
```

---

## 💡 Tips

### Git Workflow
1. **Use `/commit` for new work** - Creates branches and sets you up
2. **Use `/quick-commit` for iterations** - Fast commits on same branch
3. **Use `/push` when ready to backup** - Safe push with validations
4. **Use `/push-pr` when feature is complete** - Push + PR in one command
5. **Review the summary carefully** - Claude shows what changed before actions

### Code Review
6. **Use `/review-changes` before commits** - Catch issues early
7. **Use `/review-pr` for all PRs** - Get thorough analysis
8. **Use `/push-pr` for instant reviews** - Combines push + review + PR
9. **Learn from reviews** - Claude explains WHY, not just WHAT
10. **Review your own PRs** - Get a second opinion before merging

### Best Practices
11. **Never push directly to main** - Always use feature branches
12. **Keep commits small** - Easier to review and revert
13. **Write good descriptions** - `/push-pr` helps with this
14. **Fix issues before PR** - Use `/review-changes` first
15. **Use conventional commits** - All commands follow this format

---

## 🤖 Automatic PR Reviews

In addition to manual reviews with `/review-pr`, you can set up **automatic code reviews** that run when you create or update a Pull Request on GitHub.

### How It Works

1. You create/update a PR on GitHub
2. GitHub Action automatically triggers
3. Claude AI analyzes the code changes
4. Review comment posted to your PR (30-60 seconds)

### Setup

See **[.github/CLAUDE_REVIEW_SETUP.md](../../.github/CLAUDE_REVIEW_SETUP.md)** for complete setup instructions.

**Quick setup**:
1. Get Anthropic API key from [console.anthropic.com](https://console.anthropic.com/)
2. Add as GitHub secret: `ANTHROPIC_API_KEY`
3. Push the workflow files (already in `.github/workflows/`)
4. Create a PR to test!

**Cost**: ~$0.05 per PR review (very affordable)

### Manual vs Automatic Reviews

| Feature | `/review-pr` (Manual) | GitHub Action (Automatic) |
|---------|----------------------|---------------------------|
| Trigger | You run command | Automatic on PR create/update |
| Location | Claude Code IDE | GitHub PR comments |
| Speed | Instant | 30-60 seconds |
| Cost | Free (uses your Claude Code) | ~$0.05/review (Anthropic API) |
| Best for | Quick local checks | Team collaboration, CI/CD |

**Recommendation**: Use both!
- `/review-pr` for quick local reviews before pushing
- GitHub Action for team reviews and CI/CD gates

---

## Customization

To modify these commands, edit:
- `.claude/commands/commit.md` - Full workflow
- `.claude/commands/quick-commit.md` - Quick workflow
- `.claude/commands/review-pr.md` - PR review
- `.claude/commands/review-changes.md` - Changes review

For automatic reviews:
- `.github/workflows/claude-code-review.yml` - GitHub Action
- `.github/scripts/claude-review.js` - Review logic

See [Claude Code Docs](https://docs.claude.com/en/docs/claude-code) for more info.

---

## Troubleshooting

**Command not found?**
- Make sure files are in `.claude/commands/` directory
- Restart Claude Code
- Check file has `.md` extension

**Wrong branch created?**
- Use `git checkout main` to go back
- Delete unwanted branch: `git branch -D branch-name`

**Want to modify commit message?**
- Before confirming, tell Claude: "Use this message instead: [your message]"

**Need to uncommit?**
- `git reset --soft HEAD~1` - Uncommit but keep changes
- `git reset --hard HEAD~1` - Uncommit and discard changes (dangerous!)

---

**Created for**: Country TV Project
**Last Updated**: 2025-10-22
