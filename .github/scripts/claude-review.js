#!/usr/bin/env node

/**
 * Claude AI Code Review Script
 *
 * This script uses Anthropic's Claude API to perform automated code reviews
 * on GitHub Pull Requests.
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';

// Configuration
const MAX_DIFF_LENGTH = 100000; // Claude's context limit consideration
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'; // Use stable Claude 3.5 Sonnet model

async function main() {
  try {
    console.log('🔍 Starting Claude Code Review...\n');

    // Get environment variables
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const prTitle = process.env.PR_TITLE;
    const prAuthor = process.env.PR_AUTHOR;
    const prNumber = process.env.PR_NUMBER;
    const prAdditions = process.env.PR_ADDITIONS;
    const prDeletions = process.env.PR_DELETIONS;
    const prBody = process.env.PR_BODY;

    console.log('📋 Environment Check:');
    console.log(`  - API Key: ${apiKey ? '✅ Present (length: ' + apiKey.length + ')' : '❌ Missing'}`);
    console.log(`  - PR Title: ${prTitle || '❌ Missing'}`);
    console.log(`  - PR Author: ${prAuthor || '❌ Missing'}`);
    console.log(`  - PR Number: ${prNumber || '❌ Missing'}`);
    console.log();

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY secret is not configured in GitHub. Please add it in Settings → Secrets → Actions');
    }

    if (!prTitle || !prAuthor || !prNumber) {
      throw new Error('PR metadata is incomplete. This might be a GitHub Actions configuration issue.');
    }

    // Check if files exist
    if (!fs.existsSync('pr-diff.txt')) {
      throw new Error('pr-diff.txt not found. The PR diff step may have failed.');
    }
    if (!fs.existsSync('changed-files.txt')) {
      throw new Error('changed-files.txt not found. The PR diff step may have failed.');
    }

    // Read the diff and changed files
    const diff = fs.readFileSync('pr-diff.txt', 'utf8');
    const changedFilesContent = fs.readFileSync('changed-files.txt', 'utf8').trim();
    const changedFiles = changedFilesContent ? changedFilesContent.split('\n').filter(f => f) : [];

    if (!diff || diff.length === 0) {
      // No changes - create a simple review
      const noChangesReview = createNoChangesReview(prNumber, prAuthor);
      fs.writeFileSync('claude-review.md', noChangesReview);
      console.log('ℹ️  No changes detected in PR');
      return;
    }

    console.log(`📊 PR Info: #${prNumber} - ${prTitle}`);
    console.log(`👤 Author: ${prAuthor}`);
    console.log(`📝 Changes: +${prAdditions} -${prDeletions}`);
    console.log(`📁 Files changed: ${changedFiles.length}`);
    console.log('🤖 Starting Claude code review...\n');

    // Truncate diff if too long
    let diffToReview = diff;
    if (diff.length > MAX_DIFF_LENGTH) {
      console.log(`⚠️  Diff too large (${diff.length} chars), truncating to ${MAX_DIFF_LENGTH} chars`);
      diffToReview = diff.substring(0, MAX_DIFF_LENGTH) + '\n\n... (diff truncated due to length)';
    }

    // Initialize Claude client
    const client = new Anthropic({ apiKey });

    // Create the review prompt
    const prompt = createReviewPrompt({
      title: prTitle,
      author: prAuthor,
      number: prNumber,
      body: prBody,
      additions: prAdditions,
      deletions: prDeletions,
      changedFiles,
      diff: diffToReview
    });

    // Call Claude API
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Extract the review
    const review = response.content[0].text;

    // Save review to file
    const reviewOutput = formatReviewOutput(review, prNumber, prAuthor);
    fs.writeFileSync('claude-review.md', reviewOutput);

    console.log('✅ Review completed successfully!');
    console.log(`📄 Review saved to claude-review.md`);

  } catch (error) {
    console.error('❌ Error during code review:', error.message);
    console.error('Stack trace:', error.stack);

    // Write detailed error to review file
    const errorOutput = `# ⚠️ Claude Code Review Failed

**Error**: ${error.message}

The automated code review could not be completed.

## Possible Causes

1. **Missing API Key**: Make sure \`ANTHROPIC_API_KEY\` is configured in GitHub Settings → Secrets → Actions
2. **API Quota Exceeded**: Check your Anthropic account usage at https://console.anthropic.com/
3. **Network Issues**: GitHub Actions may have connectivity problems
4. **Model Unavailable**: The Claude model may be temporarily unavailable

## How to Fix

1. **Check API Key**:
   - Go to GitHub repo Settings → Secrets and variables → Actions
   - Verify \`ANTHROPIC_API_KEY\` exists and is valid
   - Get a new key from https://console.anthropic.com/

2. **Check Workflow Logs**:
   - Go to Actions tab → Failed workflow → "Run Claude Code Review" step
   - Look for specific error messages

3. **Manual Review**:
   - Use \`/review-pr\` command in Claude Code IDE
   - Or review the PR manually

## Support

- [GitHub Actions Logs](../../actions)
- [Anthropic Status](https://status.anthropic.com/)
- [Setup Guide](../.github/CLAUDE_REVIEW_SETUP.md)

---
*This is an automated review powered by Claude AI*

<details>
<summary>Technical Details</summary>

\`\`\`
${error.stack || error.message}
\`\`\`

</details>
`;
    fs.writeFileSync('claude-review.md', errorOutput);

    process.exit(1);
  }
}

function createNoChangesReview(prNumber, author) {
  return `# 🤖 Claude AI Code Review

**PR**: #${prNumber}
**Author**: @${author}
**Reviewed by**: Claude Sonnet 4.5
**Review Date**: ${new Date().toISOString().split('T')[0]}

---

## ℹ️ No Changes Detected

This PR appears to have no code changes to review. This might be:
- A merge commit with no new changes
- A documentation-only PR with no diff
- A PR that has already been merged

If you expected changes to be reviewed, please check:
1. The PR has commits with actual code changes
2. The base branch is correct
3. The PR is not already merged

---

*🤖 Automated review powered by Claude AI*
`;
}

function createReviewPrompt({ title, author, number, body, additions, deletions, changedFiles, diff }) {
  return `You are an expert code reviewer performing a comprehensive code review for a GitHub Pull Request.

# Pull Request Information

**Title**: ${title}
**Author**: @${author}
**PR Number**: #${number}
**Description**: ${body}

**Changes Summary**:
- Additions: +${additions} lines
- Deletions: -${deletions} lines
- Files changed: ${changedFiles.length}

**Changed Files**:
${changedFiles.map(f => `- ${f}`).join('\n')}

# Diff to Review

\`\`\`diff
${diff}
\`\`\`

# Your Task

Perform a comprehensive code review covering:

## 1. 🎯 Overall Assessment
- Summarize what this PR does (1-2 sentences)
- Rate code quality: Excellent / Good / Needs Work / Requires Changes
- Give recommendation: Approve ✅ / Request Changes 🔄 / Needs Discussion 💬

## 2. ✅ Strengths
List 2-5 positive aspects of this PR

## 3. 🔍 Key Review Areas

### 🔒 Security Issues
- Check for: SQL injection, XSS, exposed secrets, input validation, auth issues
- Rate: Critical 🔴 / Warning 🟡 / None ✅

### ⚡ Performance Concerns
- Check for: Inefficient algorithms, N+1 queries, memory leaks, unnecessary renders
- Rate: Critical 🔴 / Warning 🟡 / None ✅

### 🐛 Potential Bugs
- Check for: Null checks, edge cases, race conditions, type errors
- List specific concerns with file:line references

### 📐 Code Quality
- Readability, maintainability, DRY, naming conventions
- Rate: Excellent / Good / Needs Improvement

### 🧪 Testing
- Are there tests? Are they sufficient?
- Rate: Well Tested / Partially Tested / Needs Tests

## 4. 🚨 Issues Found

For each issue, use this format:

**🔴 Critical** (Must fix before merge)
- **Location**: \`path/to/file.ts:line\`
- **Issue**: [Description]
- **Why**: [Impact explanation]
- **Fix**: [Specific suggestion with code example]

**🟡 Warning** (Should fix)
- Same format

**🔵 Suggestion** (Nice to have)
- Same format

## 5. 💡 Specific Recommendations

Provide 3-5 actionable recommendations with file locations.

## 6. 📋 Author Checklist

Create a checklist for the PR author:
- [ ] [Action item 1]
- [ ] [Action item 2]
- [ ] [Action item 3]

## 7. 🎯 Final Verdict

**Overall Rating**: [Rating]
**Recommendation**: [Approve ✅ / Request Changes 🔄 / Needs Discussion 💬]
**Risk Level**: [Low / Medium / High]
**Key Action**: [Main thing to do before merging]

---

**Important Guidelines**:
- Be constructive and respectful
- Explain WHY, not just WHAT
- Provide specific file:line references
- Include code examples for suggestions
- Prioritize security and correctness over style
- Consider project context (this is Country TV, a music streaming app)
- Keep the tone professional but friendly
- Focus on the most important issues

Generate the review now in markdown format, ready to be posted as a GitHub comment.`;
}

function formatReviewOutput(review, prNumber, author) {
  const header = `# 🤖 Claude AI Code Review

**PR**: #${prNumber}
**Author**: @${author}
**Reviewed by**: Claude Sonnet 4.5
**Review Date**: ${new Date().toISOString().split('T')[0]}

---

`;

  const footer = `

---

<details>
<summary>ℹ️ About this review</summary>

This automated code review was generated by [Claude AI](https://www.anthropic.com/claude) using the Sonnet 4.5 model.

**What was analyzed**:
- Security vulnerabilities (XSS, SQL injection, exposed secrets)
- Performance issues (algorithms, memory, database queries)
- Potential bugs (null checks, edge cases, race conditions)
- Code quality (readability, maintainability, best practices)
- Testing coverage and quality
- Documentation completeness

**How to use this review**:
1. ✅ Address all **🔴 Critical** issues before merging
2. 🔄 Consider fixing **🟡 Warnings** for production readiness
3. 💡 **🔵 Suggestions** are optional improvements
4. ❓ Ask questions if anything is unclear

**Limitations**:
- AI may miss context-specific issues
- Always use human judgment for final decisions
- Some suggestions may not apply to your specific case

*If you disagree with any feedback or have questions, please comment!*
</details>

---

*🤖 Automated review powered by Claude AI • [Country TV](https://github.com/bedomax/countryTV)*
`;

  return header + review + footer;
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
