# 🤖 Claude AI Automatic Code Review Setup

This guide explains how to set up automatic code reviews using Claude AI for your GitHub Pull Requests.

## 🎯 What It Does

When you create or update a Pull Request, Claude AI will automatically:

1. ✅ **Analyze the code changes** in your PR
2. 🔒 **Check for security vulnerabilities** (XSS, SQL injection, exposed secrets)
3. ⚡ **Identify performance issues** (inefficient algorithms, memory leaks, N+1 queries)
4. 🐛 **Find potential bugs** (null checks, edge cases, race conditions)
5. 📐 **Review code quality** (readability, maintainability, best practices)
6. 🧪 **Evaluate test coverage**
7. 💬 **Post a detailed review comment** on your PR

## 📋 Prerequisites

1. **GitHub repository** with admin access
2. **Anthropic API key** for Claude AI
3. **Node.js 18+** (handled automatically by GitHub Actions)

## 🚀 Setup Instructions

### Step 1: Get Your Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create Key**
5. Copy your API key (starts with `sk-ant-...`)

**Pricing**: Claude Sonnet 4.5 costs ~$3 per 1M input tokens, $15 per 1M output tokens
- Typical PR review: ~10K tokens = **~$0.05 per review**
- You get free credits when you sign up

### Step 2: Add API Key to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `ANTHROPIC_API_KEY`
5. Value: Paste your API key
6. Click **Add secret**

### Step 3: Verify Files Are in Place

Make sure these files exist in your repository:

```
.github/
├── workflows/
│   └── claude-code-review.yml    # GitHub Actions workflow
└── scripts/
    └── claude-review.js          # Claude API integration script
```

These files should already be in your repository. If not, they need to be added.

### Step 4: Commit and Push (if needed)

If you just added the files:

```bash
git add .github/
git commit -m "feat: add Claude AI automatic code review"
git push origin main
```

### Step 5: Test the Setup

1. Create a new branch:
   ```bash
   git checkout -b test/claude-review
   ```

2. Make a small change:
   ```bash
   echo "// Test change" >> apps/web/public/app.js
   git add apps/web/public/app.js
   git commit -m "test: trigger Claude review"
   git push origin test/claude-review
   ```

3. Create a Pull Request on GitHub

4. Wait 30-60 seconds

5. Check the PR for:
   - ✅ A comment from Claude AI with the review
   - ✅ Green checkmark on "Claude AI Code Review" workflow

## 📊 How It Works

### Workflow Trigger

The workflow runs when:
- A PR is **opened** against `main` or `develop` branches
- A PR is **updated** (new commits pushed)
- A PR is **reopened**

### Review Process

1. **GitHub Action starts** on PR event
2. **Fetches PR diff** and changed files
3. **Calls Claude API** with the diff and PR metadata
4. **Claude analyzes** the code (30-60 seconds)
5. **Posts review comment** on the PR automatically

### Review Format

The review includes:

```markdown
# 🤖 Claude AI Code Review

## 🎯 Overall Assessment
- Summary of changes
- Code quality rating
- Recommendation (Approve/Request Changes/Discuss)

## ✅ Strengths
- What's good about this PR

## 🔒 Security Issues
- Critical security vulnerabilities

## ⚡ Performance Concerns
- Performance problems and optimizations

## 🐛 Potential Bugs
- Edge cases, null checks, type errors

## 📐 Code Quality
- Readability, maintainability, best practices

## 🧪 Testing
- Test coverage evaluation

## 🚨 Issues Found

🔴 Critical (must fix)
🟡 Warning (should fix)
🔵 Suggestion (nice to have)

## 💡 Recommendations
- Specific actionable items

## 📋 Author Checklist
- [ ] Action items for PR author

## 🎯 Final Verdict
- Overall rating and recommendation
```

## ⚙️ Configuration

### Change Trigger Branches

Edit [.github/workflows/claude-code-review.yml](.github/workflows/claude-code-review.yml):

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
    branches:
      - main
      - develop
      - production  # Add your branches here
```

### Change Claude Model

Edit [.github/scripts/claude-review.js](.github/scripts/claude-review.js):

```javascript
const CLAUDE_MODEL = 'claude-sonnet-4-5-20250929'; // Change model here
```

Available models:
- `claude-sonnet-4-5-20250929` - Latest, most capable (recommended)
- `claude-3-5-sonnet-20241022` - Previous version
- `claude-3-opus-20240229` - Most powerful but slower

### Adjust Review Depth

Edit the prompt in `claude-review.js` to focus on specific areas:

```javascript
// Add or remove review areas
// Security, Performance, Bugs, Quality, Testing, etc.
```

### Skip Reviews for Certain PRs

Add labels to skip reviews:

```yaml
# In claude-code-review.yml
jobs:
  claude-review:
    if: "!contains(github.event.pull_request.labels.*.name, 'skip-review')"
```

Then add `skip-review` label to PRs you want to skip.

## 💰 Cost Estimation

Based on Claude Sonnet 4.5 pricing:

| PR Size | Tokens | Cost per Review |
|---------|--------|-----------------|
| Small (<100 lines) | ~5K | $0.02 |
| Medium (100-500 lines) | ~15K | $0.06 |
| Large (500-1000 lines) | ~30K | $0.12 |
| Very Large (1000+ lines) | ~50K+ | $0.20+ |

**Monthly estimates**:
- 10 PRs/month: ~$0.60
- 50 PRs/month: ~$3.00
- 100 PRs/month: ~$6.00

**Free tier**: Anthropic provides free credits for new accounts.

## 🐛 Troubleshooting

### ⚠️ Common Issues & Fixes

#### 1. ES Module Error (FIXED)
```
ReferenceError: require is not defined in ES module scope
```

**Status**: ✅ Fixed in latest version
- Script now uses `import` instead of `require`
- Node.js upgraded to version 20
- No action needed if using latest files

#### 2. Node Version Error (FIXED)
```
EBADENGINE Unsupported engine - required: { node: '>=20.0.0' }
```

**Status**: ✅ Fixed in workflow
- Workflow now uses Node.js 20
- Check `.github/workflows/claude-code-review.yml` line 59

#### 3. Missing API Key
```
Error: ANTHROPIC_API_KEY secret is not configured
```

**Fix**:
1. Get API key from https://console.anthropic.com/
2. Add to GitHub: Settings → Secrets → Actions → New secret
3. Name: `ANTHROPIC_API_KEY`
4. Value: Your key (starts with `sk-ant-`)

### Review Not Appearing

1. **Check workflow status**:
   - Go to PR → "Checks" tab
   - Look for "Claude AI Code Review"
   - Check logs if failed

2. **Verify API key**:
   - Go to Settings → Secrets → Actions
   - Ensure `ANTHROPIC_API_KEY` exists
   - Key should start with `sk-ant-`

3. **Check API quota**:
   - Log in to [Anthropic Console](https://console.anthropic.com/)
   - Check usage and limits
   - Add payment method if needed

### Review Failed / Error

1. **Check workflow logs**:
   ```
   GitHub → PR → Checks → Claude AI Code Review → View logs
   ```

2. **Common errors**:
   - `ANTHROPIC_API_KEY not set` → Add secret (see above)
   - `require is not defined` → Update to latest script (uses ES modules)
   - `Authentication error` → Invalid API key
   - `Rate limit exceeded` → Wait or upgrade plan
   - `Diff too large` → PR is too big (>100K chars)
   - `Node version error` → Update workflow to Node 20

3. **Re-run workflow**:
   - Go to failed workflow
   - Click "Re-run failed jobs"

4. **Detailed troubleshooting**:
   - See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for complete guide

### Review Quality Issues

1. **Review too generic**:
   - PR might be too large
   - Consider breaking into smaller PRs
   - Large PRs get truncated

2. **Missing context**:
   - Claude only sees the diff, not full files
   - Add more details to PR description
   - Link to related issues/docs

3. **False positives**:
   - AI may not understand project context
   - Use human judgment for final decisions
   - You can ask for clarification in comments

## 🔒 Security & Privacy

### What Data Is Sent to Anthropic?

- ✅ PR diff (code changes)
- ✅ PR metadata (title, description, author)
- ✅ Changed file names
- ❌ Full repository code
- ❌ Git history
- ❌ Secrets (if properly stored)

### Security Best Practices

1. **Never commit secrets** to your repository
2. **Use GitHub Secrets** for all API keys
3. **Review Anthropic's privacy policy**
4. **Consider using self-hosted runners** for sensitive code
5. **Disable for private/sensitive PRs** using labels

### Data Retention

- Anthropic stores API requests for 30 days
- GitHub Actions logs retained for 90 days
- Review artifacts retained for 30 days (configurable)

## 📚 Additional Resources

- [Anthropic Documentation](https://docs.anthropic.com/)
- [Claude API Reference](https://docs.anthropic.com/en/api/messages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Country TV Repository](https://github.com/bedomax/countryTV)

## 🎨 Customization Ideas

### Add Review Summaries to PR Description

Modify the workflow to update PR description with summary.

### Create Review Labels

Automatically add labels based on review verdict:
- `needs-changes` for Request Changes
- `approved-by-ai` for Approve
- `high-risk` for critical issues

### Send Slack Notifications

Add Slack webhook to notify team of critical issues.

### Track Review Metrics

Store review data in a database to track:
- Average issues per PR
- Most common problems
- Code quality trends

### Multi-Stage Review

Run different review types:
1. Quick security scan (fast)
2. Full detailed review (slower)
3. Performance profiling

## 💡 Pro Tips

1. **Write good PR descriptions** - Claude uses them for context
2. **Keep PRs small** - Better reviews for <500 lines
3. **Use conventional commits** - Helps Claude understand intent
4. **Review the review** - AI can make mistakes, use judgment
5. **Iterate based on feedback** - Claude learns from patterns
6. **Combine with human reviews** - AI + human = best results

## 🤝 Contributing

Have ideas to improve the Claude review workflow?

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a PR with description

---

## 📞 Support

**Issues with setup?**
- Create an issue in the repository
- Include workflow logs
- Describe what you tried

**Questions about Claude?**
- Check [Anthropic Support](https://support.anthropic.com/)
- Read the [API docs](https://docs.anthropic.com/)

---

**Created for**: Country TV Project
**Last Updated**: 2025-10-22
**Version**: 1.0.0
