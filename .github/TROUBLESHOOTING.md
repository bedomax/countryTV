# 🔧 Troubleshooting Claude Code Review

Common issues and solutions for the automatic Claude code review system.

## 🚨 Common Errors

### Error: "Claude code review failed to generate"

**Possible Causes:**

#### 1. Missing API Key
```
Error: ANTHROPIC_API_KEY secret is not configured
```

**Solution:**
1. Go to https://console.anthropic.com/
2. Create an API key
3. Go to your GitHub repo → Settings → Secrets and variables → Actions
4. Click "New repository secret"
5. Name: `ANTHROPIC_API_KEY`
6. Value: Your API key (starts with `sk-ant-`)
7. Click "Add secret"

#### 2. ES Module Error
```
ReferenceError: require is not defined in ES module scope
```

**Solution:**
- Script has been updated to use ES modules (`import` instead of `require`)
- Make sure Node.js 20+ is used in workflow
- Files updated:
  - `.github/scripts/claude-review.js` → Uses `import` now
  - `.github/workflows/claude-code-review.yml` → Uses Node 20

#### 3. Node Version Error
```
EBADENGINE Unsupported engine - required: { node: '>=20.0.0' }
```

**Solution:**
- Workflow now uses Node.js 20
- Check `.github/workflows/claude-code-review.yml` has `node-version: '20'`

#### 4. API Quota Exceeded
```
Error: 429 Too Many Requests
```

**Solution:**
1. Go to https://console.anthropic.com/
2. Check your usage and limits
3. Upgrade your plan if needed
4. Or wait for quota to reset

#### 5. Invalid Model
```
Error: model not found
```

**Solution:**
- Script uses `claude-sonnet-4-20250514` (stable)
- If this fails, update to: `claude-3-5-sonnet-20241022`
- Edit `.github/scripts/claude-review.js` line 15

---

## 🔍 How to Debug

### Step 1: Check Workflow Logs

1. Go to your PR
2. Click "Checks" tab
3. Click "Claude AI Code Review"
4. Click "Run Claude Code Review" step
5. Look for error messages

### Step 2: Verify API Key

```bash
# In GitHub repo
Settings → Secrets and variables → Actions → ANTHROPIC_API_KEY
```

- Should exist ✅
- Should start with `sk-ant-` ✅
- Should be valid (not expired) ✅

### Step 3: Test Locally

Create a test file to verify API key works:

```javascript
// test-claude.js
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: 'your-api-key-here'
});

const message = await client.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 100,
  messages: [{ role: 'user', content: 'Say hello' }]
});

console.log(message.content[0].text);
```

Run:
```bash
npm install @anthropic-ai/sdk
node test-claude.js
```

### Step 4: Check GitHub Actions Status

- GitHub Actions: https://www.githubstatus.com/
- Anthropic Status: https://status.anthropic.com/

---

## 📋 Quick Checklist

Before creating a PR, verify:

- [ ] `ANTHROPIC_API_KEY` is set in GitHub Secrets
- [ ] Workflow files are committed:
  - [ ] `.github/workflows/claude-code-review.yml`
  - [ ] `.github/scripts/claude-review.js`
- [ ] API key is valid (test it locally)
- [ ] Anthropic account has available credits
- [ ] Node.js 20+ is used in workflow

---

## 🔄 Re-running Failed Review

If review fails:

1. **Fix the issue** (add API key, etc.)
2. **Re-run workflow**:
   - Go to PR → Checks tab
   - Click "Re-run failed jobs"
3. **Or push a new commit**:
   ```bash
   git commit --allow-empty -m "trigger review"
   git push
   ```

---

## 🛠️ Manual Review Alternative

If automatic review is broken, use manual command:

```bash
# In Claude Code IDE
/review-pr
> [your PR number]
```

This uses your local Claude Code session instead of GitHub Actions.

---

## 📝 Common Fixes

### Fix 1: Update to ES Modules

If you see `require is not defined`:

```diff
- const Anthropic = require('@anthropic-ai/sdk');
- const fs = require('fs');
+ import Anthropic from '@anthropic-ai/sdk';
+ import fs from 'fs';
```

### Fix 2: Update Node Version

```diff
# .github/workflows/claude-code-review.yml
- node-version: '18'
+ node-version: '20'
```

### Fix 3: Update Claude Model

```diff
# .github/scripts/claude-review.js
- const CLAUDE_MODEL = 'claude-sonnet-4-5-20250929';
+ const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
```

---

## 🆘 Still Not Working?

### Option 1: Check Logs
Go to: Actions → Failed workflow → Logs

Look for:
- API key issues
- Network errors
- Model errors
- Timeout errors

### Option 2: Simplify
Try a minimal test PR:
1. Change one file
2. Create small PR
3. See if review works
4. If yes, issue was with large PR size

### Option 3: Disable Temporarily
Comment out the workflow:

```yaml
# .github/workflows/claude-code-review.yml
on:
  pull_request:
    types: [opened]  # Remove synchronize, reopened
    branches:
      - main
    # Only run manually:
  workflow_dispatch:
```

### Option 4: Use Manual Reviews Only
Remove automatic reviews and use `/review-pr` command instead.

---

## 📞 Support Resources

- **Anthropic Documentation**: https://docs.anthropic.com/
- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Claude Status**: https://status.anthropic.com/
- **Setup Guide**: [CLAUDE_REVIEW_SETUP.md](CLAUDE_REVIEW_SETUP.md)

---

## 💡 Prevention Tips

1. **Test locally first** before pushing to GitHub
2. **Monitor API usage** at console.anthropic.com
3. **Set up billing alerts** in Anthropic console
4. **Keep dependencies updated**:
   ```bash
   npm update @anthropic-ai/sdk
   ```
5. **Use stable Claude models** (not beta/experimental)

---

**Last Updated**: 2025-10-22
**Tested with**: Node.js 20+, Claude Sonnet 4
