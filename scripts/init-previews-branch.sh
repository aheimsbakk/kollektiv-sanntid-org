#!/bin/bash
# Initialize orphan previews branch for PR preview deployments
# This script creates a new orphan branch with an index.html redirecting to main

set -e

echo "🚀 Initializing previews branch for PR preview deployments..."

# Save current branch
CURRENT_BRANCH=$(git branch --show-current)

# Check if previews branch already exists
if git show-ref --verify --quiet refs/heads/previews; then
  echo "⚠️  Branch 'previews' already exists."
  read -p "Do you want to recreate it? This will delete all existing PR previews. (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted."
    exit 1
  fi
  git branch -D previews
fi

# Create orphan branch
git checkout --orphan previews

# Remove all files from staging
git rm -rf .

# Create index.html redirecting to main site
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="0; url=../">
  <title>PR Previews</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    a {
      color: #0066cc;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>PR Previews</h1>
    <p>Redirecting to <a href="../">main site</a>...</p>
    <p><small>PR preview URLs: <code>/pr-123/</code></small></p>
  </div>
</body>
</html>
EOF

# Create README
cat > README.md << 'EOF'
# PR Preview Deployments

This branch contains PR preview deployments in subfolders.

## Structure

- `/` - Root index redirects to main site
- `/pr-123/` - Preview for PR #123
- `/pr-456/` - Preview for PR #456
- etc.

## How It Works

1. When a PR is opened/updated, GitHub Actions copies `src/` to `pr-N/`
2. GitHub Pages serves this branch at the repository URL
3. Each PR preview is accessible at `https://owner.github.io/repo/pr-N/`
4. When PR is closed, the `pr-N/` folder is automatically removed

## Configuration

Configure GitHub Pages to serve from the `previews` branch:
1. Go to Settings → Pages
2. Source: Deploy from a branch
3. Branch: `previews` / `/ (root)`
4. Save

---

**Note:** This branch is managed automatically by GitHub Actions. Do not edit manually.
EOF

# Commit
git add index.html README.md
git commit -m "Initialize previews branch for PR deployments"

echo "✅ Previews branch created successfully!"
echo ""
echo "Next steps:"
echo "1. Push the branch: git push -u origin previews"
echo "2. Configure GitHub Pages:"
echo "   - Go to Settings → Pages"
echo "   - Source: Deploy from a branch"
echo "   - Branch: previews / (root)"
echo "   - Save"
echo ""
echo "Returning to ${CURRENT_BRANCH} branch..."

# Return to original branch
git checkout "$CURRENT_BRANCH"

echo "✅ Done! You're back on ${CURRENT_BRANCH}"
