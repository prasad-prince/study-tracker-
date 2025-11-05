# Quick Start - Upload to GitHub

## Step 1: Install Git (if not installed)

Download and install Git from: **https://git-scm.com/download/win**

After installation, **restart your computer** or open a new terminal window.

## Step 2: Create a GitHub Repository

1. Go to https://github.com and sign in (or create an account)
2. Click the "+" icon → "New repository"
3. Name your repository (e.g., `study-goal-tracker-frontend`)
4. Choose Public or Private
5. **DO NOT** check "Initialize with README" (we already have files)
6. Click "Create repository"

## Step 3: Upload Files

### Option A: Use the Batch Script (Easiest)

1. Double-click `upload-to-github.bat` in the fornted folder
2. Follow the prompts
3. Enter your GitHub repository URL when asked

### Option B: Manual Commands

Open Command Prompt or PowerShell in the `fornted` folder and run:

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Study Goal Tracker frontend"

# Add your GitHub repository (replace with your actual URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Verify

Go to your GitHub repository page and verify all files are uploaded!

---

**Need help?** Make sure:
- ✅ Git is installed (`git --version` should work)
- ✅ You're logged into GitHub
- ✅ Your repository URL is correct

